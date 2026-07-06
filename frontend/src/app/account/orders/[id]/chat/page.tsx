"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/backend/authService";
import { orderChatService } from "@/backend/orderChatService";
import { supabase } from "@/backend/supabase";
import ChatReadReceipt from "@/components/ChatReadReceipt";
import { useChatPolling } from "@/hooks/useChatPolling";
import { useChatScroll } from "@/hooks/useChatScroll";
import { Trash2, Paperclip, Loader2 } from "lucide-react";

function getFileName(orderId: string, ext: string) {
  return `bukti-chat-${orderId}-${Date.now()}.${ext}`;
}

export default function OrderChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params.id || "");
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [room, setRoom] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const user = authService.getCurrentUser();
    if (!file || !user || !chatId || uploading) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = getFileName(orderId, fileExt);
      const filePath = `payment-receipts/${fileName}`;

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      const fileUrl = data?.publicUrl;

      if (!fileUrl) throw new Error("Gagal mengambil URL gambar.");

      // Send chat message with attachment prefix
      const textMsg = `[ATTACHMENT_IMAGE] ${fileUrl}`;
      const ok = await orderChatService.sendMessage(chatId, "customer", user.id_user, textMsg);
      if (ok) {
        await refresh();
        scrollToBottomAfterSend();
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal mengunggah bukti pembayaran.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
        setRoom(room);
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

      {room?.order?.order_item && room.order.order_item.length > 0 && (
        <div className="bg-white border border-surface-container rounded-xl p-3.5 flex flex-wrap gap-2 items-center text-xs text-secondary shadow-xs">
          <span className="font-bold text-on-surface">Barang yang dibeli:</span>
          <div className="flex flex-wrap gap-1.5">
            {room.order.order_item.map((it: any) => (
              <span key={it.id_order_item} className="bg-surface-container border border-surface-container-high rounded-lg px-2.5 py-1 font-bold text-on-surface">
                {it.nama_produk_snapshot} (x{it.qty_orderitem})
              </span>
            ))}
          </div>
        </div>
      )}

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
                  {msg.text.includes("[ATTACHMENT_QRIS]") ? (
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/qr.jpeg"
                        alt="QRIS Code"
                        className="max-w-[200px] w-full h-auto rounded-lg bg-white p-2 border border-surface-container-high mx-auto block shadow-sm"
                      />
                      <div className="flex justify-center">
                        <a
                          href="/qr.jpeg"
                          download="QRIS_Pelataran_UMKM.jpeg"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F5F3F0] hover:bg-[#EBE8E2] text-xs font-bold text-gray-700 rounded-lg transition shadow-xs text-center decoration-transparent"
                        >
                          <span className="material-symbols-outlined text-[15px] align-middle">download</span>
                          <span>Unduh QRIS</span>
                        </a>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap text-center font-bold">
                        {msg.text.replace("[ATTACHMENT_QRIS]", "").trim() || "Pindai QRIS di atas untuk membayar"}
                      </p>
                    </div>
                  ) : msg.text.includes("[ATTACHMENT_IMAGE]") ? (
                    <div className="space-y-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.text.replace("[ATTACHMENT_IMAGE]", "").trim()}
                        alt="Bukti Pembayaran"
                        className="max-w-[240px] w-full h-auto rounded-lg border border-gray-100 shadow-sm mx-auto cursor-pointer"
                        onClick={() => window.open(msg.text.replace("[ATTACHMENT_IMAGE]", "").trim(), "_blank")}
                      />
                      <p className="text-center font-semibold text-xs leading-relaxed">
                        Bukti Pembayaran
                      </p>
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
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

        <form onSubmit={handleSend} className="border-t border-surface-container p-4 flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading || sending}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            className="w-11 h-11 flex items-center justify-center border border-surface-container-high rounded-lg hover:bg-surface-container transition text-secondary disabled:opacity-50 shrink-0"
            title="Kirim Bukti Pembayaran (Gambar)"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : (
              <Paperclip size={18} />
            )}
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan untuk admin..."
            disabled={uploading || sending}
            className="flex-1 h-11 px-4 rounded-lg border border-surface-container-high text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending || uploading || !text.trim()}
            className="px-5 h-11 bg-primary text-white font-bold text-sm rounded-lg disabled:opacity-50 shrink-0"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
