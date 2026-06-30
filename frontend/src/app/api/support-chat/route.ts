import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, denyForeignUser, verifySupportChatAccess } from "@/lib/api-auth";
import {
  fetchChatMessagesWithReceipts,
  type ChatViewerRole,
} from "@/lib/chatReadReceipts";
import { notifySupportChatMessage } from "@/lib/chatNotifications";

export async function GET(request: NextRequest) {
  const listAdmin = request.nextUrl.searchParams.get("list") === "admin";
  if (listAdmin) {
    const adminAuth = await requireAdmin(request);
    if (!adminAuth.ok) return adminAuth.response;
    try {
      const { data, error } = await adminAuth.ctx.admin
        .from("support_chat")
        .select(`*, users ( nama_lengkap, email )`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ rooms: data || [] });
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json({ error: e.message || "Gagal memuat chat." }, { status: 500 });
    }
  }

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { admin, user } = auth.ctx;
  const chatId = request.nextUrl.searchParams.get("chatId");
  const queryUserId = request.nextUrl.searchParams.get("userId");
  const viewerRole = request.nextUrl.searchParams.get("viewerRole") as ChatViewerRole | null;
  const markRead = request.nextUrl.searchParams.get("markRead") === "true";

  try {
    if (chatId) {
      const allowed = await verifySupportChatAccess(admin, chatId, user.id_user, user.role === "admin");
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }
      const messages = await fetchChatMessagesWithReceipts(
        admin,
        "support_chat_message",
        chatId,
        viewerRole === "admin" || viewerRole === "customer" ? viewerRole : null,
        markRead
      );
      return NextResponse.json({ messages });
    }

    if (queryUserId) {
      const denied = denyForeignUser(auth.ctx, queryUserId);
      if (denied) return denied;
      const { data, error } = await admin
        .from("support_chat")
        .select("*")
        .eq("id_user", user.id_user)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ room: data });
    }

    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memuat chat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { admin, user } = auth.ctx;

  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "ensure") {
      const denied = denyForeignUser(auth.ctx, body.userId ? String(body.userId) : null);
      if (denied) return denied;

      const { data: existing } = await admin
        .from("support_chat")
        .select("id_chat")
        .eq("id_user", user.id_user)
        .maybeSingle();

      if (existing?.id_chat) {
        return NextResponse.json({ id_chat: existing.id_chat });
      }

      const { data: created, error } = await admin
        .from("support_chat")
        .insert({ id_user: user.id_user })
        .select("id_chat")
        .single();
      if (error) throw error;

      await admin.from("support_chat_message").insert({
        id_chat: created.id_chat,
        sender_role: "admin",
        sender_id: null,
        text: "Halo! Saya admin Pelataran UMKM. Ada yang bisa kami bantu terkait pesanan, pembayaran, atau produk?",
      });

      return NextResponse.json({ id_chat: created.id_chat });
    }

    if (action === "send") {
      const chatId = String(body.chatId || "");
      const wantsAdmin = body.senderRole === "admin";
      const senderRole = wantsAdmin ? "admin" : "customer";
      const text = String(body.text || "").trim();
      if (!chatId || !text) {
        return NextResponse.json({ error: "chatId dan text wajib." }, { status: 400 });
      }

      if (wantsAdmin && user.role !== "admin") {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }

      const allowed = await verifySupportChatAccess(
        admin,
        chatId,
        user.id_user,
        user.role === "admin"
      );
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }

      const { error } = await admin.from("support_chat_message").insert({
        id_chat: chatId,
        sender_role: senderRole,
        sender_id: user.id_user,
        text,
      });
      if (error) throw error;

      await notifySupportChatMessage(admin, chatId, senderRole, user.id_user, text);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const chatId = String(body.chatId || "");
      if (!chatId) {
        return NextResponse.json({ error: "chatId wajib." }, { status: 400 });
      }

      const allowed = await verifySupportChatAccess(
        admin,
        chatId,
        user.id_user,
        user.role === "admin"
      );
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan atau akses ditolak." }, { status: 404 });
      }

      if (user.role === "admin") {
        const { error } = await admin
          .from("support_chat")
          .delete()
          .eq("id_chat", chatId);
        if (error) throw error;
      } else {
        const { error } = await admin
          .from("support_chat_message")
          .delete()
          .eq("id_chat", chatId);
        if (error) throw error;

        await admin.from("support_chat_message").insert({
          id_chat: chatId,
          sender_role: "admin",
          sender_id: null,
          text: "Halo! Saya admin Pelataran UMKM. Ada yang bisa kami bantu terkait pesanan, pembayaran, atau produk?",
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action tidak dikenal." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memproses chat." }, { status: 500 });
  }
}
