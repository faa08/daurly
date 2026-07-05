import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, denyForeignUser, verifyOrderChatAccess } from "@/lib/api-auth";
import {
  fetchChatMessagesWithReceipts,
  type ChatViewerRole,
} from "@/lib/chatReadReceipts";
import { notifyOrderChatMessage } from "@/lib/chatNotifications";

export async function GET(request: NextRequest) {
  const listAdmin = request.nextUrl.searchParams.get("list") === "admin";
  if (listAdmin) {
    const adminAuth = await requireAdmin(request);
    if (!adminAuth.ok) return adminAuth.response;
    try {
      const { data, error } = await adminAuth.ctx.admin
        .from("order_chat")
        .select(`
          *,
          order ( stat_order, total_hrg, tipe_pembayaran ),
          users ( nama_lengkap, email )
        `)
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
  const orderId = request.nextUrl.searchParams.get("orderId");
  const queryUserId = request.nextUrl.searchParams.get("userId");
  const viewerRole = request.nextUrl.searchParams.get("viewerRole") as ChatViewerRole | null;
  const markRead = request.nextUrl.searchParams.get("markRead") === "true";
  const isAdmin = user.role === "admin";

  try {
    if (chatId) {
      const allowed = await verifyOrderChatAccess(admin, chatId, user.id_user, isAdmin);
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }
      const messages = await fetchChatMessagesWithReceipts(
        admin,
        "order_chat_message",
        chatId,
        viewerRole === "admin" || viewerRole === "customer" ? viewerRole : null,
        markRead
      );
      return NextResponse.json({ messages });
    }

    if (orderId) {
      const { data, error } = await admin
        .from("order_chat")
        .select(`*, order ( stat_order, total_hrg, tipe_pembayaran, id_user )`)
        .eq("id_order", orderId)
        .maybeSingle();
      if (error) throw error;
      const order = Array.isArray(data?.order) ? data.order[0] : data?.order;
      if (!data || (!isAdmin && order?.id_user !== user.id_user && data.id_user !== user.id_user)) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ room: data });
    }

    if (queryUserId) {
      const denied = denyForeignUser(auth.ctx, queryUserId);
      if (denied) return denied;
      const { data, error } = await admin
        .from("order_chat")
        .select(`*, order ( stat_order, total_hrg, tipe_pembayaran )`)
        .eq("id_user", user.id_user)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ rooms: data || [] });
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
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }
      const orderId = String(body.orderId || "");
      const userId = String(body.userId || "");
      if (!orderId || !userId) {
        return NextResponse.json({ error: "orderId dan userId wajib." }, { status: 400 });
      }

      const { data: existing } = await admin
        .from("order_chat")
        .select("id_chat")
        .eq("id_order", orderId)
        .maybeSingle();

      if (existing?.id_chat) {
        return NextResponse.json({ id_chat: existing.id_chat });
      }

      const { data: created, error } = await admin
        .from("order_chat")
        .insert({ id_order: orderId, id_user: userId })
        .select("id_chat")
        .single();
      if (error) throw error;

      await admin.from("order_chat_message").insert({
        id_chat: created.id_chat,
        sender_role: "admin",
        sender_id: null,
        text: "Halo! Pembayaran Anda sudah kami terima. Admin akan membantu mengatur pengiriman pesanan Anda di chat ini.",
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

      const allowed = await verifyOrderChatAccess(
        admin,
        chatId,
        user.id_user,
        user.role === "admin"
      );
      if (!allowed) {
        return NextResponse.json({ error: "Chat tidak ditemukan." }, { status: 404 });
      }

      const senderId = wantsAdmin ? user.id_user : user.id_user;
      const insertPromise = admin.from("order_chat_message").insert({
        id_chat: chatId,
        sender_role: senderRole,
        sender_id: senderId,
        text,
      });

      const notifyPromise = notifyOrderChatMessage(admin, chatId, senderRole, senderId, text);

      const [insertRes] = await Promise.all([insertPromise, notifyPromise]);
      if (insertRes.error) throw insertRes.error;

      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const chatId = String(body.chatId || "");
      if (!chatId) {
        return NextResponse.json({ error: "chatId wajib." }, { status: 400 });
      }

      const allowed = await verifyOrderChatAccess(
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
          .from("order_chat")
          .delete()
          .eq("id_chat", chatId);
        if (error) throw error;
      } else {
        const { error } = await admin
          .from("order_chat_message")
          .delete()
          .eq("id_chat", chatId);
        if (error) throw error;

        await admin.from("order_chat_message").insert({
          id_chat: chatId,
          sender_role: "admin",
          sender_id: null,
          text: "Halo! Pembayaran Anda sudah kami terima. Admin akan membantu mengatur pengiriman pesanan Anda di chat ini.",
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
