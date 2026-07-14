import { supabase } from "./supabase";

export type NotificationUiType = "offer" | "accepted" | "message";

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  type: NotificationUiType;
  unread: boolean;
  link?: string;
}

type DbNotifType = "order" | "payment" | "shipping" | "promo" | "system";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

function mapUiType(tipe: DbNotifType): NotificationUiType {
  if (tipe === "promo") return "offer";
  if (tipe === "payment" || tipe === "order") return "accepted";
  return "message";
}

function formatNotifTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapRow(row: {
  id_notifikasi: string;
  judul: string;
  pesan: string;
  tipe: DbNotifType;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}): NotificationItem {
  return {
    id: row.id_notifikasi,
    text: row.pesan ? `${row.judul}: ${row.pesan}` : row.judul,
    time: formatNotifTime(row.created_at),
    type: mapUiType(row.tipe),
    unread: !row.is_read,
    link: row.link || undefined,
  };
}

export const notificationService = {
  async getForUser(userId: string): Promise<NotificationItem[]> {
    if (isPlaceholder()) {
      const raw = localStorage.getItem(`pelum_notif_${userId}`);
      return raw ? JSON.parse(raw) : [];
    }

    try {
      const { data, error } = await supabase
        .from("notifikasi")
        .select("id_notifikasi, judul, pesan, tipe, link, is_read, created_at")
        .eq("id_user", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("notificationService.getForUser:", error.message);
        return [];
      }
      return (data || []).map(mapRow);
    } catch (err) {
      console.warn("notificationService.getForUser network offline/glitch:", err);
      return [];
    }
  },

  async markAsRead(id: string, isRead: boolean): Promise<void> {
    if (isPlaceholder()) return;

    await supabase.from("notifikasi").update({ is_read: isRead }).eq("id_notifikasi", id);
  },

  async markAllRead(userId: string): Promise<void> {
    if (isPlaceholder()) return;

    await supabase.from("notifikasi").update({ is_read: true }).eq("id_user", userId);
  },

  async deleteAll(userId: string): Promise<void> {
    if (isPlaceholder()) {
      localStorage.removeItem(`pelum_notif_${userId}`);
      return;
    }

    await supabase.from("notifikasi").delete().eq("id_user", userId);
  },
};
