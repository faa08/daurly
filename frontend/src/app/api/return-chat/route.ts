import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, verifyReturnChatAccess } from "@/lib/api-auth";
import {
  fetchChatMessagesWithReceipts,
  type ChatViewerRole,
} from "@/lib/chatReadReceipts";
import { notifyReturnChatMessage } from "@/lib/chatNotifications";

export async function GET(request: NextRequest) {
  const listAdmin = request.nextUrl.searchParams.get("list") === "admin";
  if (listAdmin) {
    const adminAuth = await requireAdmin(request);
    if (!adminAuth.ok) return adminAuth.response;
    try {
      const { data, error } = await adminAuth.ctx.admin
        .from("return_chat")
        .select(`
          *,
          retur ( alasan, status, created_at ),
          users ( nama_lengkap, email )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ rooms: data || [] });
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json({ error: e.message || "Gagal memuat chat return." }, { status: 500 });
    }
  }

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { admin, user } = auth.ctx;
  const chatId = request.nextUrl.searchParams.get("chatId");
  const returId = request.nextUrl.searchParams.get("returId");
  const viewerRole = request.nextUrl.searchParams.get("viewerRole") as ChatViewerRole | null;
  const markRead = request.nextUrl.searchParams.get("markRead") === "true";

  try {
    if (chatId) {
      const allowed = await verifyReturnChatAccess(admin, chatId, user.id_user, user.role === "admin");
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }
      const messages = await fetchChatMessagesWithReceipts(
        admin,
        "return_chat_message",
        chatId,
        viewerRole === "admin" || viewerRole === "customer" ? viewerRole : null,
        markRead
      );
      return NextResponse.json({ messages });
    }

    if (returId) {
      const { data, error } = await admin
        .from("return_chat")
        .select(`*, retur ( alasan, status, id_user )`)
        .eq("id_retur", returId)
        .maybeSingle();
      if (error) throw error;
      const retur = Array.isArray(data?.retur) ? data.retur[0] : data?.retur;
      if (!data || (user.role !== "admin" && retur?.id_user !== user.id_user && data.id_user !== user.id_user)) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ room: data });
    }

    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memuat chat return." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { admin, user } = auth.ctx;

  try {
    const body = await request.json();
    const action = String(body.action || "");

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

      const allowed = await verifyReturnChatAccess(
        admin,
        chatId,
        user.id_user,
        user.role === "admin"
      );
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }

      const insertPromise = admin.from("return_chat_message").insert({
        id_chat: chatId,
        sender_role: senderRole,
        sender_id: user.id_user,
        text,
      });

      const notifyPromise = notifyReturnChatMessage(admin, chatId, senderRole, user.id_user, text);

      const [insertRes] = await Promise.all([insertPromise, notifyPromise]);
      if (insertRes.error) throw insertRes.error;

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action tidak dikenal." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memproses chat." }, { status: 500 });
  }
}
