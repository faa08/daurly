"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, X, Send, Bot, Loader2, UserCircle, Trash2 } from "lucide-react";
import "./CustomerService.css";
import { CUSTOMER_SERVICE_WELCOME } from "@/data/customerServiceKnowledge";
import { authService } from "@/backend/authService";
import { apiFetch } from "@/lib/api-client";
import { supportChatService, SupportChatMessage } from "@/backend/supportChatService";
import ChatReadReceipt from "@/components/ChatReadReceipt";
import { useChatPolling } from "@/hooks/useChatPolling";

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface CustomerServiceContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CustomerServiceContext = createContext<CustomerServiceContextValue | null>(null);

export function useCustomerService() {
  const ctx = useContext(CustomerServiceContext);
  if (!ctx) throw new Error("useCustomerService must be used within CustomerServiceProvider");
  return ctx;
}

const WELCOME_MESSAGE: AiMessage = {
  id: "welcome",
  role: "assistant",
  text: CUSTOMER_SERVICE_WELCOME,
  time: "",
};

type ChatMode = "ai" | "admin";

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function AiChatPanel() {
  const [messages, setMessages] = useState<AiMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      time: formatTime(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const history = updated
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await apiFetch("/api/customer-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: res.ok ? data.reply : data.error || "Maaf, terjadi kesalahan.",
          time: formatTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Koneksi gagal. Periksa internet Anda dan coba lagi.",
          time: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-panel-body">
      <div className="cs-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`cs-message cs-message--${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="cs-msg-avatar">
                <Bot size={14} />
              </div>
            )}
            <div className="cs-msg-bubble">
              <p>{msg.text}</p>
              {msg.time && <span className="cs-msg-time">{msg.time}</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="cs-message cs-message--assistant">
            <div className="cs-msg-avatar">
              <Bot size={14} />
            </div>
            <div className="cs-msg-bubble cs-msg-bubble--typing">
              <Loader2 size={16} className="cs-spinner" />
              <span>Mengetik...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="cs-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya AI — ketik pertanyaan..."
          disabled={loading}
          className="cs-input"
        />
        <button type="submit" disabled={!input.trim() || loading} className="cs-send-btn" aria-label="Kirim">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function AdminChatPanel() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [initError, setInitError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

  const fetchMessages = useCallback(
    (id: string) => supportChatService.getMessages(id, "customer", { markRead: true }),
    []
  );
  const { messages, refresh } = useChatPolling(chatId, fetchMessages);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    async function init() {
      if (!user) {
        setLoading(false);
        return;
      }
      setInitError("");
      const id = await supportChatService.ensureRoom(user.id_user);
      if (id) {
        setChatId(id);
      } else {
        setInitError(
          "Chat belum siap. Jalankan migrasi support_chat di Supabase SQL Editor, lalu refresh halaman."
        );
      }
      setLoading(false);
    }
    init();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim() || sending) return;

    setSending(true);
    setInitError("");

    let activeChatId = chatId;
    if (!activeChatId) {
      activeChatId = await supportChatService.ensureRoom(user.id_user);
      if (activeChatId) setChatId(activeChatId);
    }

    if (!activeChatId) {
      setInitError("Gagal mengirim pesan. Periksa migrasi database support_chat di Supabase.");
      setSending(false);
      return;
    }

    const ok = await supportChatService.sendMessage(activeChatId, "customer", user.id_user, input.trim());
    if (ok) {
      await refresh();
      setInput("");
    } else {
      setInitError("Pesan gagal terkirim. Coba lagi sebentar.");
    }
    setSending(false);
  };

  const handleClearChat = async () => {
    if (!chatId) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat chat dengan admin?");
    if (!ok) return;

    const success = await supportChatService.deleteChat(chatId);
    if (success) {
      await refresh();
    } else {
      alert("Gagal menghapus riwayat chat.");
    }
  };

  if (!user) {
    return (
      <div className="cs-admin-login-prompt">
        <UserCircle size={40} className="cs-admin-login-icon" />
        <p className="cs-admin-login-title">Masuk untuk chat admin</p>
        <p className="cs-admin-login-desc">
          Chat dengan tim Pelataran UMKM untuk bantuan pesanan, pembayaran, dan return.
        </p>
        <Link href="/masuk?redirect=/chat" className="cs-admin-login-btn">
          Masuk / Daftar
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cs-admin-login-prompt">
        <Loader2 size={28} className="cs-spinner" />
        <p className="cs-admin-login-desc">Memuat chat admin...</p>
      </div>
    );
  }

  return (
    <div className="cs-panel-body">
      {initError && (
        <div className="cs-admin-error" role="alert">
          {initError}
        </div>
      )}
      {messages.length > 0 && (
        <div className="cs-clear-chat-bar" style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "6px 12px",
          backgroundColor: "#F5F3F0",
          borderBottom: "1px solid #EAE5E0",
          fontSize: "11px",
          fontWeight: "bold",
          color: "#8E8680"
        }}>
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1 hover:text-red-600 transition"
          >
            <Trash2 size={12} /> Hapus Riwayat Chat
          </button>
        </div>
      )}
      <div className="cs-messages">
        {messages.map((msg) => {
          const isAdmin = msg.sender_role === "admin";
          return (
            <div
              key={msg.id_message}
              className={`cs-message ${isAdmin ? "cs-message--assistant cs-message--human" : "cs-message--user"}`}
            >
              {isAdmin && (
                <div className="cs-msg-avatar cs-msg-avatar--human">
                  <Headphones size={14} />
                </div>
              )}
              <div className="cs-msg-bubble">
                {isAdmin && <span className="cs-msg-label">Admin</span>}
                <p>{msg.text}</p>
                <span className="cs-msg-time">
                  {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {!isAdmin && (
                    <span className="cs-msg-receipt">
                      <ChatReadReceipt message={msg} onLight />
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form className="cs-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Chat admin — tulis pesan..."
          disabled={sending}
          className="cs-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="cs-send-btn cs-send-btn--admin"
          aria-label="Kirim"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function CustomerServiceChat({
  onClose,
  fullPage = false,
  initialMode = "ai",
}: {
  onClose?: () => void;
  fullPage?: boolean;
  initialMode?: ChatMode;
}) {
  const [mode, setMode] = useState<ChatMode>(initialMode);

  return (
    <div className={`cs-chat ${fullPage ? "cs-chat--full" : ""}`}>
      <div className="cs-chat-header">
        <div className="cs-chat-header-info">
          <div className="cs-chat-avatar">
            {mode === "ai" ? <Bot size={20} /> : <Headphones size={20} />}
          </div>
          <div>
            <h3 className="cs-chat-title">Customer Service</h3>
            <p className="cs-chat-status">
              <span className="cs-online-dot" />
              {mode === "ai" ? "TANYA AI · Online" : "Chat Admin · Online"}
            </p>
          </div>
        </div>
        {onClose && (
          <button type="button" className="cs-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="cs-mode-tabs">
        <button
          type="button"
          className={`cs-mode-tab ${mode === "ai" ? "cs-mode-tab--active" : ""}`}
          onClick={() => setMode("ai")}
        >
          <Bot size={14} />
          Tanya AI
        </button>
        <button
          type="button"
          className={`cs-mode-tab ${mode === "admin" ? "cs-mode-tab--active" : ""}`}
          onClick={() => setMode("admin")}
        >
          <Headphones size={14} />
          Chat Admin
        </button>
      </div>

      {mode === "ai" ? <AiChatPanel /> : <AdminChatPanel />}
    </div>
  );
}

export default function CustomerServiceProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CustomerServiceContext.Provider value={{ open, close, toggle, isOpen }}>
      {children}

      {!isChatPage && (
        <>
          <button
            type="button"
            className={`cs-fab ${isOpen ? "cs-fab--active" : ""}`}
            onClick={toggle}
            aria-label="Customer Service"
            title="Customer Service"
          >
            {isOpen ? <X size={22} /> : <Headphones size={22} />}
          </button>

          {isOpen && (
            <>
              <div className="cs-backdrop" onClick={close} aria-hidden="true" />
              <div className="cs-panel">
                <CustomerServiceChat onClose={close} />
              </div>
            </>
          )}
        </>
      )}
    </CustomerServiceContext.Provider>
  );
}

export { CustomerServiceChat };
