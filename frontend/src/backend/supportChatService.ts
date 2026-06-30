import type { ChatReceiptFields } from "@/lib/chatReadReceipts";
import { apiFetch } from "@/lib/api-client";

export interface SupportChatMessage extends ChatReceiptFields {
  id_message: string;
  id_chat: string;
  sender_role: "admin" | "customer";
  sender_id: string | null;
  text: string;
  created_at: string;
}

export interface SupportChatRoom {
  id_chat: string;
  id_user: string;
  created_at: string;
  users?: { nama_lengkap?: string; email?: string } | { nama_lengkap?: string; email?: string }[];
}

export const supportChatService = {
  async ensureRoom(userId: string): Promise<string | null> {
    const res = await apiFetch("/api/support-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ensure", userId }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data.id_chat as string;
  },

  async getMessages(
    chatId: string,
    viewerRole?: "admin" | "customer",
    options?: { markRead?: boolean }
  ): Promise<SupportChatMessage[]> {
    const params = new URLSearchParams({ chatId });
    if (viewerRole) params.set("viewerRole", viewerRole);
    if (options?.markRead) params.set("markRead", "true");
    const res = await apiFetch(`/api/support-chat?${params}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.messages || [];
  },

  async sendMessage(
    chatId: string,
    senderRole: "admin" | "customer",
    senderId: string | null,
    text: string
  ): Promise<boolean> {
    const res = await apiFetch("/api/support-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", chatId, senderRole, senderId, text }),
    });
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pelum-notif-refresh"));
    }
    return res.ok;
  },

  async deleteChat(chatId: string): Promise<boolean> {
    const res = await apiFetch("/api/support-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", chatId }),
    });
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pelum-notif-refresh"));
    }
    return res.ok;
  },

  async listRoomsForAdmin(): Promise<SupportChatRoom[]> {
    const res = await apiFetch("/api/support-chat?list=admin");
    const data = await res.json();
    if (!res.ok) return [];
    return data.rooms || [];
  },
};
