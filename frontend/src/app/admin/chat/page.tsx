"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { supportChatService, SupportChatMessage, SupportChatRoom } from "@/backend/supportChatService";
import { orderChatService, OrderChatMessage, OrderChatRoom } from "@/backend/orderChatService";
import { returnChatService } from "@/backend/returnService";
import { getOrderPaymentDisplay } from "@/lib/checkoutConstants";
import ChatReadReceipt from "@/components/ChatReadReceipt";
import { useChatPolling } from "@/hooks/useChatPolling";
import { useChatScroll } from "@/hooks/useChatScroll";
import type { ChatReceiptFields } from "@/lib/chatReadReceipts";

type TabId = "support" | "shipping" | "return";

const TABS: { id: TabId; label: string; desc: string }[] = [
  { id: "support", label: "Chat Pelanggan", desc: "Pertanyaan umum & bantuan" },
  { id: "shipping", label: "Pengiriman", desc: "QRIS — wajib chat pembeli" },
  { id: "return", label: "Return", desc: "Pengajuan pengembalian" },
];

function ChatBubble({
  text,
  time,
  isAdmin,
  message,
}: {
  text: string;
  time: string;
  isAdmin: boolean;
  message?: ChatReceiptFields;
}) {
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-xl px-4 py-2.5 text-sm ${
          isAdmin
            ? "bg-[#1D4ED8] text-white rounded-br-sm"
            : "bg-[#F5F3F0] text-[#1F1B18] rounded-bl-sm"
        }`}
      >
        {text.includes("[ATTACHMENT_QRIS]") ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/qr.jpeg"
              alt="QRIS Code"
              className="max-w-[180px] w-full h-auto rounded-lg bg-white p-2 border border-surface-container-high mx-auto block shadow-sm"
            />
            <div className="flex justify-center">
              <a
                href="/qr.jpeg"
                download="QRIS_Pelataran_UMKM.jpeg"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[11px] font-bold text-[#3E3834] rounded-md border border-gray-200 transition shadow-xs decoration-transparent"
              >
                <span className="material-symbols-outlined text-[14px] align-middle">download</span>
                <span>Unduh QRIS</span>
              </a>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap text-center font-bold">
              {text.replace("[ATTACHMENT_QRIS]", "").trim() || "QRIS Platform"}
            </p>
          </div>
        ) : text.includes("[ATTACHMENT_IMAGE]") ? (
          <div className="space-y-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={text.replace("[ATTACHMENT_IMAGE]", "").trim()}
              alt="Bukti Pembayaran"
              className="max-w-[200px] w-full h-auto rounded-lg border border-gray-100 shadow-sm mx-auto cursor-pointer"
              onClick={() => window.open(text.replace("[ATTACHMENT_IMAGE]", "").trim(), "_blank")}
            />
            <p className="text-center font-semibold text-xs leading-relaxed">
              Bukti Pembayaran
            </p>
          </div>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
        )}
        <p className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isAdmin ? "text-white/70" : "text-[#8E8680]"}`}>
          <span>{time}</span>
          {isAdmin && message && <ChatReadReceipt message={message} onLight />}
        </p>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatOrderId(id: string) {
  return `ORD-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function SupportPanel() {
  const [rooms, setRooms] = useState<SupportChatRoom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(
    (id: string) => supportChatService.getMessages(id, "admin", { markRead: true }),
    []
  );
  const { messages, refresh } = useChatPolling(selectedId, fetchMessages);
  const { containerRef, onScroll, scrollToBottomAfterSend } = useChatScroll(messages);

  useEffect(() => {
    supportChatService.listRoomsForAdmin().then((data) => {
      setRooms(data);
      if (data[0]?.id_chat) setSelectedId(data[0].id_chat);
      setLoading(false);
    });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const ok = await supportChatService.sendMessage(selectedId, "admin", user?.id_user || null, text.trim());
    if (ok) {
      await refresh();
      setText("");
      scrollToBottomAfterSend();
    }
    setSending(false);
  };

  const handleDeleteChat = async () => {
    if (!selectedId) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus seluruh percakapan chat support ini?");
    if (!ok) return;

    const success = await supportChatService.deleteChat(selectedId);
    if (success) {
      const data = await supportChatService.listRoomsForAdmin();
      setRooms(data);
      if (data.length > 0) {
        setSelectedId(data[0].id_chat);
      } else {
        setSelectedId(null);
      }
    } else {
      alert("Gagal menghapus percakapan.");
    }
  };

  return (
    <ChatLayout
      loading={loading}
      empty={rooms.length === 0}
      emptyText="Belum ada chat pelanggan."
      list={
        rooms.map((room) => {
          const rawUser = room.users;
          const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
          return (
            <button
              key={room.id_chat}
              type="button"
              onClick={() => setSelectedId(room.id_chat)}
              className={`w-full text-left px-4 py-3 border-b border-[#F5F3F0] transition ${
                room.id_chat === selectedId ? "bg-[#EFF6FF]" : "hover:bg-[#FCFCFA]"
              }`}
            >
              <p className="font-bold text-sm text-[#1F1B18]">{user?.nama_lengkap || user?.email || "Pelanggan"}</p>
              <p className="text-[10px] text-[#8E8680] mt-0.5 uppercase font-bold tracking-wider">Chat umum</p>
            </button>
          );
        })
      }
      headerTitle={selectedId ? "Chat Pelanggan" : undefined}
      messages={
        messages.map((msg) => (
          <ChatBubble
            key={msg.id_message}
            text={msg.text}
            time={formatTime(msg.created_at)}
            isAdmin={msg.sender_role === "admin"}
            message={msg}
          />
        ))
      }
      containerRef={containerRef}
      onScroll={onScroll}
      text={text}
      setText={setText}
      onSend={handleSend}
      sending={sending}
      hasSelection={!!selectedId}
      placeholder="Balas pelanggan..."
      onDelete={handleDeleteChat}
    />
  );
}

function ShippingPanel({ focusOrderId }: { focusOrderId?: string | null }) {
  const [rooms, setRooms] = useState<OrderChatRoom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const selectedRoom = rooms.find((r) => r.id_chat === selectedId);

  const fetchMessages = useCallback(
    (id: string) => orderChatService.getMessages(id, "admin", { markRead: true }),
    []
  );
  const { messages, refresh } = useChatPolling(selectedId, fetchMessages);
  const { containerRef, onScroll, scrollToBottomAfterSend } = useChatScroll(messages);

  useEffect(() => {
    orderChatService.listRoomsForAdmin().then((data) => {
      setRooms(data);
      if (focusOrderId) {
        const match = data.find((r) => r.id_order === focusOrderId);
        if (match?.id_chat) {
          setSelectedId(match.id_chat);
        } else if (data[0]?.id_chat) {
          setSelectedId(data[0].id_chat);
        }
      } else if (data[0]?.id_chat) {
        setSelectedId(data[0].id_chat);
      }
      setLoading(false);
    });
  }, [focusOrderId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const ok = await orderChatService.sendMessage(selectedId, "admin", user?.id_user || null, text.trim());
    if (ok) {
      await refresh();
      setText("");
      scrollToBottomAfterSend();
    }
    setSending(false);
  };

  const handleSendQris = async () => {
    const user = authService.getCurrentUser();
    if (!selectedId) return;
    setSending(true);
    const qrisText = "[ATTACHMENT_QRIS] Silakan scan kode QRIS di atas untuk melakukan pembayaran pesanan Anda.";
    const ok = await orderChatService.sendMessage(selectedId, "admin", user?.id_user || null, qrisText);
    if (ok) {
      await refresh();
      scrollToBottomAfterSend();
    }
    setSending(false);
  };

  const handleDeleteChat = async () => {
    if (!selectedId) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus seluruh percakapan chat pengiriman ini?");
    if (!ok) return;

    const success = await orderChatService.deleteChat(selectedId);
    if (success) {
      const data = await orderChatService.listRoomsForAdmin();
      setRooms(data);
      if (data.length > 0) {
        setSelectedId(data[0].id_chat);
      } else {
        setSelectedId(null);
      }
    } else {
      alert("Gagal menghapus percakapan.");
    }
  };

  const order = selectedRoom
    ? Array.isArray(selectedRoom.order)
      ? selectedRoom.order[0]
      : selectedRoom.order
    : null;

  const orderPay = order
    ? getOrderPaymentDisplay({ tipe_pembayaran: order.tipe_pembayaran })
    : null;

  return (
    <ChatLayout
      loading={loading}
      empty={rooms.length === 0}
      emptyText="Belum ada chat pengiriman."
      list={rooms.map((room) => {
        const rawUser = room.users ?? room.user;
        const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        const ord = Array.isArray(room.order) ? room.order[0] : room.order;
        const pay = getOrderPaymentDisplay({ tipe_pembayaran: ord?.tipe_pembayaran });
        return (
          <button
            key={room.id_chat}
            type="button"
            onClick={() => setSelectedId(room.id_chat)}
            className={`w-full text-left px-4 py-3 border-b border-[#F5F3F0] transition ${
              room.id_chat === selectedId ? "bg-[#EFF6FF]" : "hover:bg-[#FCFCFA]"
            }`}
          >
            <p className="font-bold text-sm text-[#1F1B18]">{user?.nama_lengkap || user?.email || "Pelanggan"}</p>
            <p className="text-xs text-[#8E8680] mt-0.5">
              {formatOrderId(room.id_order)} · Rp {Number(ord?.total_hrg || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] mt-1 font-bold text-indigo-700">{pay.label} · Chat pengiriman</p>
          </button>
        );
      })}
      headerTitle={selectedRoom ? `Pengiriman ${formatOrderId(selectedRoom.id_order)}` : undefined}
      headerSub={
        order
          ? `Status: ${order.stat_order}${orderPay ? ` · ${orderPay.label} — ${orderPay.desc}` : ""}`
          : undefined
      }
      messages={messages.map((msg) => (
        <ChatBubble
          key={msg.id_message}
          text={msg.text}
          time={formatTime(msg.created_at)}
          isAdmin={msg.sender_role === "admin"}
          message={msg}
        />
      ))}
      containerRef={containerRef}
      onScroll={onScroll}
      text={text}
      setText={setText}
      onSend={handleSend}
      sending={sending}
      hasSelection={!!selectedId}
      placeholder="Koordinasi alamat, kurir, jadwal kirim..."
      onDelete={handleDeleteChat}
      onSendQris={handleSendQris}
    />
  );
}

function ReturnPanel() {
  const [rooms, setRooms] = useState<
    {
      id_chat: string;
      id_retur: string;
      retur?: { alasan: string; status: string } | { alasan: string; status: string }[];
      users?: { nama_lengkap?: string; email?: string } | { nama_lengkap?: string; email?: string }[];
    }[]
  >([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(
    (id: string) => returnChatService.getMessages(id, "admin", { markRead: true }),
    []
  );
  const { messages, refresh } = useChatPolling(selectedId, fetchMessages);
  const { containerRef, onScroll, scrollToBottomAfterSend } = useChatScroll(messages);

  useEffect(() => {
    returnChatService.listRoomsForAdmin().then((data) => {
      setRooms(data);
      if (data[0]?.id_chat) setSelectedId(data[0].id_chat);
      setLoading(false);
    });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const ok = await returnChatService.sendMessage(selectedId, "admin", user?.id_user || null, text.trim());
    if (ok) {
      await refresh();
      setText("");
      scrollToBottomAfterSend();
    }
    setSending(false);
  };

  return (
    <ChatLayout
      loading={loading}
      empty={rooms.length === 0}
      emptyText="Belum ada chat return."
      list={rooms.map((room) => {
        const rawUser = room.users;
        const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        const rawRetur = room.retur;
        const retur = Array.isArray(rawRetur) ? rawRetur[0] : rawRetur;
        return (
          <button
            key={room.id_chat}
            type="button"
            onClick={() => setSelectedId(room.id_chat)}
            className={`w-full text-left px-4 py-3 border-b border-[#F5F3F0] transition ${
              room.id_chat === selectedId ? "bg-orange-50" : "hover:bg-[#FCFCFA]"
            }`}
          >
            <p className="font-bold text-sm text-[#1F1B18]">{user?.nama_lengkap || user?.email || "Pelanggan"}</p>
            <p className="text-xs text-[#8E8680] mt-0.5 line-clamp-1">{retur?.alasan || "Return"}</p>
          </button>
        );
      })}
      headerTitle="Chat Return"
      messages={messages.map((msg) => (
        <ChatBubble
          key={msg.id_message}
          text={msg.text}
          time={formatTime(msg.created_at)}
          isAdmin={msg.sender_role === "admin"}
          message={msg}
        />
      ))}
      containerRef={containerRef}
      onScroll={onScroll}
      text={text}
      setText={setText}
      onSend={handleSend}
      sending={sending}
      hasSelection={!!selectedId}
      placeholder="Balas pengajuan return..."
      sendClassName="bg-[#EA580C] hover:bg-orange-700"
    />
  );
}

function ChatLayout({
  loading,
  empty,
  emptyText,
  list,
  headerTitle,
  headerSub,
  messages,
  containerRef,
  onScroll,
  text,
  setText,
  onSend,
  sending,
  hasSelection,
  placeholder,
  sendClassName = "bg-[#1D4ED8] hover:bg-blue-700",
  onDelete,
  onSendQris,
}: {
  loading: boolean;
  empty: boolean;
  emptyText: string;
  list: React.ReactNode;
  headerTitle?: string;
  headerSub?: string;
  messages: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  text: string;
  setText: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
  sending: boolean;
  hasSelection: boolean;
  placeholder: string;
  sendClassName?: string;
  onDelete?: () => void;
  onSendQris?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 520 }}>
      <div className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#EAE5E0] font-bold text-sm text-[#8E8680] uppercase tracking-wider">
          Daftar Chat
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          {loading ? (
            <p className="p-6 text-sm text-[#8E8680]">Memuat...</p>
          ) : empty ? (
            <p className="p-6 text-sm text-[#8E8680]">{emptyText}</p>
          ) : (
            list
          )}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white border border-[#EAE5E0] rounded-xl flex flex-col overflow-hidden">
        {hasSelection ? (
          <>
            {headerTitle && (
              <div className="px-4 py-3 border-b border-[#EAE5E0] flex justify-between items-center bg-[#FCFCFA]">
                <div>
                  <p className="font-bold text-sm text-[#1F1B18]">{headerTitle}</p>
                  {headerSub && <p className="text-xs text-[#8E8680]">{headerSub}</p>}
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="text-[#8E8680] hover:text-red-600 transition flex items-center justify-center p-1.5 hover:bg-[#F5F3F0] rounded-lg"
                    title="Hapus Chat ini"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                )}
              </div>
            )}
            <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[360px]">
              {messages}
            </div>
            <form onSubmit={onSend} className="border-t border-[#EAE5E0] p-4 flex gap-2">
              {onSendQris && (
                <button
                  type="button"
                  onClick={onSendQris}
                  disabled={sending}
                  className="px-3 h-11 border border-primary text-primary hover:bg-orange-50 font-bold text-xs rounded-lg flex items-center gap-1.5 flex-shrink-0 transition"
                  title="Kirim QRIS Platform"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  Kirim QRIS
                </button>
              )}
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="flex-1 h-11 px-4 rounded-lg border border-[#D5CFC9] text-sm outline-none focus:border-[#1D4ED8]"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className={`px-5 h-11 text-white font-bold text-sm rounded-lg disabled:opacity-50 ${sendClassName}`}
              >
                Kirim
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[#8E8680] p-8">
            Pilih chat dari daftar.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminChatHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabId | null;
  const focusOrderId = searchParams.get("order");
  const activeTab: TabId =
    tabParam === "shipping" || tabParam === "return" ? tabParam : focusOrderId ? "shipping" : "support";

  const setTab = (id: TabId) => {
    router.replace(`/admin/chat?tab=${id}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-2xl font-bold text-[#1F1B18]">Pusat Chat</h1>
        <p className="text-sm text-[#5C5550] mt-1">
          Pesanan <strong>Bayar QRIS</strong>: admin wajib chat pembeli untuk koordinasi pengiriman sebelum input resi.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 bg-white border border-[#EAE5E0] rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-left transition min-w-[140px] ${
              activeTab === tab.id
                ? "bg-[#1D4ED8] text-white shadow-sm"
                : "hover:bg-[#F5F3F0] text-[#5C5550]"
            }`}
          >
            <p className="text-xs font-extrabold uppercase tracking-wider">{tab.label}</p>
            <p className={`text-[10px] mt-0.5 ${activeTab === tab.id ? "text-white/80" : "text-[#8E8680]"}`}>
              {tab.desc}
            </p>
          </button>
        ))}
      </div>

      {activeTab === "support" && <SupportPanel />}
      {activeTab === "shipping" && <ShippingPanel focusOrderId={focusOrderId} />}
      {activeTab === "return" && <ReturnPanel />}
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[#8E8680] p-8">Memuat pusat chat...</div>}>
      <AdminChatHubContent />
    </Suspense>
  );
}
