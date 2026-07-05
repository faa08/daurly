import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminUserRow } from "@/lib/auth/mapUser";

type NotifTipe = "system" | "shipping" | "order";

function previewText(text: string, max = 100): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

async function getSenderLabel(
  admin: SupabaseClient,
  senderId: string | null,
  senderRole: "admin" | "customer"
): Promise<string> {
  if (senderRole === "admin") return "Admin";
  if (!senderId) return "Pelanggan";
  const { data } = await admin
    .from("users")
    .select("nama_lengkap, username")
    .eq("id_user", senderId)
    .maybeSingle();
  return data?.nama_lengkap || data?.username || "Pelanggan";
}

async function getAdminUserIds(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin
    .from("users")
    .select("id_user, username, email, role")
    .or("role.eq.admin,username.eq.admin,username.eq.admin_pelum,email.ilike.%admin@%");
  if (error) {
    console.warn("getAdminUserIds failed:", error.message);
    return [];
  }
  return (data || []).filter(isAdminUserRow).map((u) => u.id_user);
}

/** Admin penerima notif — jika pengirim juga admin (tes satu akun), tetap kirim ke admin. */
function pickAdminRecipients(adminIds: string[], senderId: string | null): string[] {
  if (!adminIds.length) return [];
  if (!senderId) return adminIds;
  const withoutSender = adminIds.filter((id) => id !== senderId);
  return withoutSender.length > 0 ? withoutSender : adminIds;
}

async function insertRows(
  admin: SupabaseClient,
  rows: Array<{
    id_user: string;
    judul: string;
    pesan: string;
    link: string;
    tipe?: NotifTipe;
    id_order?: string | null;
  }>
) {
  if (!rows.length) return;
  const { error } = await admin.from("notifikasi").insert(
    rows.map((r) => ({
      id_user: r.id_user,
      judul: r.judul,
      pesan: r.pesan,
      link: r.link,
      tipe: r.tipe || "system",
      id_order: r.id_order ?? null,
      is_read: false,
    }))
  );
  if (error) {
    console.error("chat notification insert failed:", error.message);
  }
}

export async function notifyOrderChatMessage(
  admin: SupabaseClient,
  chatId: string,
  senderRole: "admin" | "customer",
  senderId: string | null,
  text: string
) {
  const sender = await getSenderLabel(admin, senderId, senderRole);
  const pesan = `${sender}: ${previewText(text)}`;

  if (senderRole === "admin") {
    const { data: room } = await admin
      .from("order_chat")
      .select("id_order, id_user")
      .eq("id_chat", chatId)
      .maybeSingle();
    if (!room?.id_user || !room.id_order) return;

    await insertRows(admin, [
      {
        id_user: room.id_user,
        judul: "Pesan Chat Pengiriman",
        pesan,
        link: `/account/orders/${room.id_order}/chat`,
        tipe: "shipping",
        id_order: room.id_order,
      },
    ]);
    return;
  }

  const { data: room } = await admin
    .from("order_chat")
    .select("id_order")
    .eq("id_chat", chatId)
    .maybeSingle();
  if (!room?.id_order) return;

  const recipients = pickAdminRecipients(await getAdminUserIds(admin), senderId);
  if (!recipients.length) return;

  await insertRows(
    admin,
    recipients.map((id_user) => ({
      id_user,
      judul: "Balasan Chat Pengiriman",
      pesan,
      link: `/admin/chat?tab=shipping&order=${room.id_order}`,
      tipe: "order",
      id_order: room.id_order,
    }))
  );
}

export async function notifySupportChatMessage(
  admin: SupabaseClient,
  chatId: string,
  senderRole: "admin" | "customer",
  senderId: string | null,
  text: string
) {
  const sender = await getSenderLabel(admin, senderId, senderRole);
  const pesan = `${sender}: ${previewText(text)}`;

  if (senderRole === "admin") {
    const { data: room } = await admin
      .from("support_chat")
      .select("id_user")
      .eq("id_chat", chatId)
      .maybeSingle();
    if (!room?.id_user) return;

    await insertRows(admin, [
      {
        id_user: room.id_user,
        judul: "Pesan dari Admin",
        pesan,
        link: "/chat?mode=admin",
        tipe: "system",
      },
    ]);
    return;
  }

  const recipients = pickAdminRecipients(await getAdminUserIds(admin), senderId);
  if (!recipients.length) return;

  await insertRows(
    admin,
    recipients.map((id_user) => ({
      id_user,
      judul: "Chat Pelanggan Baru",
      pesan,
      link: "/admin/chat?tab=support",
      tipe: "system",
    }))
  );
}

export async function notifyReturnChatMessage(
  admin: SupabaseClient,
  chatId: string,
  senderRole: "admin" | "customer",
  senderId: string | null,
  text: string
) {
  const sender = await getSenderLabel(admin, senderId, senderRole);
  const pesan = `${sender}: ${previewText(text)}`;

  if (senderRole === "admin") {
    const { data: room } = await admin
      .from("return_chat")
      .select("id_retur, id_user")
      .eq("id_chat", chatId)
      .maybeSingle();
    if (!room?.id_user || !room.id_retur) return;

    await insertRows(admin, [
      {
        id_user: room.id_user,
        judul: "Pesan Chat Return",
        pesan,
        link: `/account/orders/return/${room.id_retur}/chat`,
        tipe: "system",
      },
    ]);
    return;
  }

  const recipients = pickAdminRecipients(await getAdminUserIds(admin), senderId);
  if (!recipients.length) return;

  await insertRows(
    admin,
    recipients.map((id_user) => ({
      id_user,
      judul: "Balasan Chat Return",
      pesan,
      link: "/admin/chat?tab=return",
      tipe: "system",
    }))
  );
}
