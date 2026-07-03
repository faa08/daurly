"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/backend/authService";
import { orderChatService } from "@/backend/orderChatService";
import ChatReadReceipt from "@/components/ChatReadReceipt";
import { useChatPolling } from "@/hooks/useChatPolling";
import { useChatScroll } from "@/hooks/useChatScroll";
import { Trash2 } from "lucide-react";

export default function OrderChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params.id || "");
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(
    (id: string) => orderChatService.getMessages(id, "customer", { markRead: true }),
    []
  );

  const { messages, refresh } = useChatPolling(chatId, fetchMessages);
  const { containerRef, onScroll, scrollToBottomAfterSend } = useChatScroll(messages);

  useEffect(() => {
    async function load() {
      const user = authService.getCurrentUser();
      if (!user) {
        router.replace(`/masuk?redirect=/account/orders/${orderId}/chat`);
        return;
      }

      let room = await orderChatService.getRoomByOrder(orderId);
      if (!room) {
        const id = await orderChatService.ensureRoom(orderId, user.id_user);
        if (id) {
          room = await orderChatService.getRoomByOrder(orderId);
        }
      }

      if (room?.id_chat) {
        setChatId(room.id_chat);
      }
      setLoading(false);
    }
    load();
  }, [orderId, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user || !chatId || !text.trim()) return;

    setSending(true);
    const ok = await orderChatService.sendMessage(chatId, "customer", user.id_user, text.trim());
    if (ok) {
      await refresh();
      setText("");
      scrollToBottomAfterSend();
    }
    setSending(false);
  };

  const handleClearChat = async () => {
    if (!chatId) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat chat pengiriman ini?");
    if (!ok) return;

    const success = await orderChatService.deleteChat(chatId);
    if (success) {
      await refresh();
    } else {
      alert("Gagal menghapus riwayat chat.");
    }
  };

  if (loading) {
    return <div className="bg-white border border-surface-container rounded-xl p-12 text-center text-secondary text-sm">Memuat chat...</div>;
  }

  if (!chatId) {
    return (
      <div className="bg-white border border-surface-container rounded-xl p-12 text-center space-y-4">
        <p className="text-secondary text-sm">Chat pengiriman belum tersedia untuk pesanan ini.</p>
        <Link href="/account/orders" className="text-primary font-bold text-sm">← Kembali ke Pesanan</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <Link href="/account/orders" className="text-xs font-bold text-secondary hover:text-primary mb-2 inline-block">
            ← Pesanan Saya
          </Link>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Chat Pengiriman</h2>
          <p className="text-sm text-secondary mt-1">
            Koordinasi pengiriman dengan admin setelah pembayaran digital.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8E8680] font-bold border border-surface-container rounded-lg hover:text-red-600 hover:border-red-200 transition bg-white"
          >
            <Trash2 size={14} className="flex-shrink-0" />
            Hapus Riwayat
          </button>
        )}
      </header>

      <div className="bg-white border border-surface-container rounded-xl shadow-sm flex flex-col" style={{ height: "min(520px, 70vh)" }}>
        <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-secondary text-sm py-8">Belum ada pesan. Admin akan segera menghubungi Anda.</p>
          )}
          {messages.map((msg) => {
            const isAdmin = msg.sender_role === "admin";
            const isOwn = !isAdmin;
            return (
              <div key={msg.id_message} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    isAdmin
                      ? "bg-surface-container text-on-surface rounded-bl-sm"
                      : "bg-primary text-white rounded-br-sm"
                  }`}
                >
                  {isAdmin && (
                    <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1">Admin</p>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isAdmin ? "text-secondary" : "text-white/70"}`}>
                    <span>
                      {new Date(msg.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                    </span>
                    {isOwn && <ChatReadReceipt message={msg} onLight />}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="border-t border-surface-container p-4 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan untuk admin..."
            className="flex-1 h-11 px-4 rounded-lg border border-surface-container-high text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="px-5 h-11 bg-primary text-white font-bold text-sm rounded-lg disabled:opacity-50"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
