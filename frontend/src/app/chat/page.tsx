"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Store, 
  Search, 
  ChevronLeft, 
  Circle, 
  MoreVertical, 
  Info,
  ShoppingBag,
  ExternalLink,
  MessageSquare
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface Message {
  id: string;
  senderId: "me" | "them";
  text: string;
  time: string;
  type?: "text" | "product";
  product?: Product;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: "buyer" | "seller";
  shopBadge?: string;
  online: boolean;
  lastSeen?: string;
  messages: Message[];
  unreadCount: number;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Toko Maju Jaya",
    avatar: "TM",
    role: "seller",
    shopBadge: "Verified Merchant",
    online: true,
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        senderId: "them",
        text: "Halo kak! Ada yang bisa kami bantu mengenai produk di toko kami?",
        time: "10:30",
        type: "text"
      },
      {
        id: "m2",
        senderId: "me",
        text: "Halo, saya mau tanya apakah produk Batik Tulis Parang Kencana ini ready ukuran XL?",
        time: "10:32",
        type: "text"
      },
      {
        id: "m3",
        senderId: "them",
        text: "Ready kak untuk ukuran XL. Bahannya katun premium halus sekali dan motifnya otentik tulis tangan.",
        time: "10:33",
        type: "text"
      },
      {
        id: "m4",
        senderId: "them",
        text: "Stoknya terbatas ya kak tinggal 2 pcs lagi untuk ukuran XL.",
        time: "10:34",
        type: "text"
      }
    ]
  },
  {
    id: "2",
    name: "Warung Kopi Toraja",
    avatar: "WK",
    role: "seller",
    shopBadge: "Petani Lokal",
    online: false,
    lastSeen: "3 jam yang lalu",
    unreadCount: 0,
    messages: [
      {
        id: "m5",
        senderId: "me",
        text: "Kak, kopi Toraja ini pengirimannya dari mana ya? Apakah ready roast bean?",
        time: "Kemarin, 14:15",
        type: "text"
      },
      {
        id: "m6",
        senderId: "them",
        text: "Pengiriman langsung dari Toraja Utara kak, dijamin fresh roast! Ready dalam bentuk biji (roast bean) maupun bubuk (fine/coarse).",
        time: "Kemarin, 14:20",
        type: "text"
      },
      {
        id: "m7",
        senderId: "me",
        text: "Oke saya pesan yang roast bean biji 2 pcs ya kak. Terima kasih.",
        time: "Kemarin, 14:22",
        type: "text"
      },
      {
        id: "m8",
        senderId: "them",
        text: "Sama-sama kak, pesanan segera kami proses hari ini ya.",
        time: "Kemarin, 14:25",
        type: "text"
      }
    ]
  },
  {
    id: "3",
    name: "Andi Darmawan",
    avatar: "AD",
    role: "buyer",
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: "m9",
        senderId: "them",
        text: "Halo gan, saya tertarik dengan Kemeja Batik Modern Slim Anda.",
        time: "12:05",
        type: "text"
      },
      {
        id: "m10",
        senderId: "them",
        text: "Bisa nego sedikit kah harganya untuk pembelian grosir 5 pcs?",
        time: "12:06",
        type: "text",
      },
      {
        id: "m11",
        senderId: "them",
        text: "Ini produk yang saya maksud:",
        time: "12:06",
        type: "product",
        product: {
          id: "p1",
          name: "Kemeja Batik Modern Slim",
          price: 325000,
          image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100&auto=format&fit=crop"
        }
      },
      {
        id: "m12",
        senderId: "me",
        text: "Halo pak Andi, untuk pembelian 5 pcs kami bisa berikan potongan harga Rp 15.000 per pcs pak.",
        time: "12:15",
        type: "text"
      }
    ]
  }
];

const PRESET_PRODUCTS: Product[] = [
  {
    id: "p101",
    name: "Batik Tulis Parang Kencana",
    price: 450000,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: "p102",
    name: "Kemeja Batik Modern Slim",
    price: 325000,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: "p103",
    name: "Syal Sutra Motif Kawung",
    price: 410000,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop"
  }
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [typingChatId, setTypingChatId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find((c) => c.id === activeId);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages?.length, typingChatId]);

  // Handle click outside attachment menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    }
    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachMenu]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeId) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderId: "me",
      text: inputText,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      type: "text"
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            unreadCount: 0
          };
        }
        return c;
      })
    );

    const activeChatId = activeId;
    const activeChatRole = activeChat?.role;

    if (activeChatRole === "seller") {
      // 1. Simulate typing indicator after 800ms
      setTimeout(() => {
        setTypingChatId(activeChatId);
      }, 800);

      // 2. Append reply after 2500ms
      setTimeout(() => {
        setTypingChatId(null);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeChatId) {
              const botReply: Message = {
                id: `m_bot_${Date.now()}`,
                senderId: "them",
                text: "Halo, ada yang bisa kami bantu? Produk ini ready stock ya!",
                time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                type: "text"
              };
              return {
                ...c,
                messages: [...c.messages, botReply],
                unreadCount: activeId === activeChatId ? 0 : c.unreadCount + 1
              };
            }
            return c;
          })
        );
      }, 2500);
    }

    setInputText("");
  };

  const handleSendProduct = (product: Product) => {
    if (!activeId) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderId: "me",
      text: `Rekomendasi Produk:`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      type: "product",
      product
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            unreadCount: 0
          };
        }
        return c;
      })
    );

    setShowAttachMenu(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveId(id);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 py-6 flex flex-col h-[650px] md:h-[650px] flex-shrink-0">
        {/* Breadcrumb / Title */}
        <div className="mb-4 flex-shrink-0">
          <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
            <MessageSquare className="text-primary" size={24} />
            Kotak Masuk Chat
          </h2>
          <p className="text-xs text-secondary mt-0.5">Hubungi penjual atau pembeli secara langsung</p>
        </div>

        {/* Chat Interface Container */}
        <div className="flex-grow bg-white border border-[#EAE5E0] rounded-xl flex overflow-hidden shadow-sm relative min-h-0">
          
          {/* LEFT SIDEBAR: Conversations List */}
          <div className={`w-full md:w-[360px] border-r border-[#EAE5E0] flex flex-col bg-white min-h-0 ${activeId && "hidden md:flex"}`}>
            
            {/* Search Bar */}
            <div className="p-4 border-b border-[#EAE5E0] flex-shrink-0">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-secondary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari kontak..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#EAE5E0] rounded-lg bg-surface-container-low text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-semibold"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-grow overflow-y-auto divide-y divide-[#EAE5E0]/40 min-h-0">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((chat) => {
                  const isActive = chat.id === activeId;
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={`w-full p-4 flex gap-3 text-left transition ${
                        isActive 
                          ? "bg-primary-container/40 text-on-surface" 
                          : "hover:bg-surface-container-low"
                      }`}
                    >
                      {/* Avatar with Online Badge */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-surface-container border border-surface-container-high overflow-hidden flex items-center justify-center font-bold text-sm text-secondary">
                          {chat.avatar}
                        </div>
                        {chat.online ? (
                          <Circle size={10} className="absolute bottom-0 right-0 text-green-500 fill-green-500 border-2 border-white rounded-full" />
                        ) : (
                          <Circle size={10} className="absolute bottom-0 right-0 text-[#8E8680] fill-[#8E8680] border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Preview Text */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-xs text-on-surface truncate flex items-center gap-1.5">
                            {chat.name}
                            {chat.role === "seller" && (
                              <span className="bg-primary/10 text-primary text-[8px] font-extrabold px-1 rounded uppercase tracking-wider">
                                Seller
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-secondary font-medium">
                            {lastMessage ? lastMessage.time : ""}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${chat.unreadCount > 0 ? "font-bold text-on-surface" : "text-[#8E8680] font-medium"}`}>
                          {lastMessage 
                            ? lastMessage.type === "product" 
                              ? `📦 Mengirim produk: ${lastMessage.product?.name}` 
                              : lastMessage.text
                            : "Belum ada pesan."}
                        </p>
                      </div>

                      {/* Unread Counter Badge */}
                      {chat.unreadCount > 0 && (
                        <div className="flex-shrink-0 self-center">
                          <span className="w-5 h-5 rounded-full bg-primary text-white font-bold text-[10px] flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-secondary text-xs font-semibold">
                  Tidak ada obrolan ditemukan.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT VIEW: Active Chat Screen */}
          {activeChat ? (
            <div className={`flex-grow flex flex-col bg-surface-container-low min-h-0 ${!activeId && "hidden md:flex"}`}>
              
              {/* Chat Window Header */}
              <div className="bg-white border-b border-[#EAE5E0] px-4 py-3 flex items-center justify-between shadow-xs flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setActiveId("")}
                    className="p-1 -ml-1 text-secondary hover:text-on-surface md:hidden transition"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center font-bold text-xs text-secondary overflow-hidden">
                      {activeChat.avatar}
                    </div>
                    {activeChat.online ? (
                      <Circle size={8} className="absolute bottom-0 right-0 text-green-500 fill-green-500 border border-white rounded-full" />
                    ) : (
                      <Circle size={8} className="absolute bottom-0 right-0 text-[#8E8680] fill-[#8E8680] border border-white rounded-full" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                      {activeChat.name}
                      {activeChat.shopBadge && (
                        <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-[#EFF6FF]">
                          {activeChat.shopBadge}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-secondary font-medium">
                      {activeChat.online ? "Online" : `Terakhir aktif: ${activeChat.lastSeen}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    title="Informasi Toko/User"
                    onClick={() => alert(`Informasi Kontak:\nNama: ${activeChat.name}\nStatus: ${activeChat.role.toUpperCase()}`)}
                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface transition"
                  >
                    <Info size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface transition">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-surface-container-low/20 min-h-0">
                
                {/* Date stamp */}
                <div className="text-center my-2">
                  <span className="bg-[#EBE8E2] text-secondary text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                    Hari Ini
                  </span>
                </div>

                {activeChat.messages.map((message) => {
                  const isMe = message.senderId === "me";
                  return (
                    <div 
                      key={message.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] rounded-lg px-4 py-2.5 shadow-sm ${
                        isMe 
                          ? "bg-primary text-white" 
                          : "bg-white text-on-surface border border-[#EAE5E0]"
                      }`}>
                        
                        {/* Standard Text Message */}
                        {message.type === "product" && message.product ? (
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                              Rekomendasi Produk
                            </span>
                            <div className="bg-surface-container-low border border-border rounded-lg p-2 flex gap-3 text-on-surface">
                              <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0 border border-border">
                                <img src={message.product.image} alt={message.product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs truncate leading-tight text-on-surface">{message.product.name}</p>
                                <p className="text-xs font-black text-primary mt-1">Rp {message.product.price.toLocaleString("id-ID")}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button 
                                onClick={() => alert(`Membeli ${message.product?.name}!`)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded transition ${isMe ? "bg-white text-primary hover:bg-zinc-100" : "bg-primary text-white hover:brightness-95"}`}
                              >
                                Beli Sekarang
                              </button>
                              <button 
                                onClick={() => alert(`Mengirim tawaran harga untuk ${message.product?.name}...`)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded border transition ${isMe ? "border-white/30 text-white hover:bg-white/10" : "border-border text-secondary hover:bg-surface-container"}`}
                              >
                                Tawar Harga
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold whitespace-pre-wrap leading-relaxed">
                            {message.text}
                          </p>
                        )}

                        <span className={`block text-[9px] text-right mt-1.5 font-bold ${
                          isMe ? "text-white/80" : "text-secondary"
                        }`}>
                          {message.time} {isMe && "✓✓"}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {typingChatId === activeId && (
                  <div className="flex justify-start">
                    <div className="bg-white text-on-surface border border-[#EAE5E0] rounded-lg px-4 py-2.5 shadow-sm max-w-[70%] flex items-center gap-1.5">
                      <span className="text-xs text-secondary font-bold font-body">{activeChat.name} sedang mengetik</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="bg-white border-t border-[#EAE5E0] p-4 relative flex-shrink-0">
                
                {/* Product Attachment Popover menu */}
                {showAttachMenu && (
                  <div 
                    ref={attachMenuRef}
                    className="absolute bottom-[calc(100%-8px)] left-4 w-72 bg-white border border-[#EAE5E0] rounded-xl shadow-lg z-20 p-3 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-[#EAE5E0]">
                      <span className="font-bold text-xs text-on-surface">Pilih Produk UMKM</span>
                      <span className="text-[10px] text-secondary font-medium">Kirim ke chat</span>
                    </div>
                    <div className="space-y-2">
                      {PRESET_PRODUCTS.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => handleSendProduct(prod)}
                          className="w-full flex gap-3 p-2 rounded-lg hover:bg-surface-container border border-transparent hover:border-[#EAE5E0] text-left transition"
                        >
                          <div className="w-10 h-10 bg-surface rounded border border-border overflow-hidden flex-shrink-0">
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate leading-tight text-on-surface">{prod.name}</p>
                            <p className="text-[11px] font-black text-primary mt-0.5">Rp {prod.price.toLocaleString("id-ID")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  
                  {/* Actions buttons */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      title="Sematkan Produk"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className={`w-9 h-9 rounded-lg border border-[#EAE5E0] flex items-center justify-center transition ${
                        showAttachMenu ? "bg-primary-container text-primary" : "text-secondary hover:bg-surface-container"
                      }`}
                    >
                      <Store size={18} />
                    </button>
                    <button
                      type="button"
                      title="Lampirkan File"
                      onClick={() => alert("Simulasi: Unggah lampiran berkas...")}
                      className="w-9 h-9 rounded-lg border border-[#EAE5E0] text-secondary hover:bg-surface-container flex items-center justify-center transition"
                    >
                      <Paperclip size={18} />
                    </button>
                  </div>

                  {/* Input field */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tulis pesan Anda di sini..."
                    className="flex-grow px-4 py-2 bg-surface-container-low border border-[#EAE5E0] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            /* Empty active chat state */
            <div className="flex-grow bg-surface-container-low flex flex-col items-center justify-center p-8 text-center text-[#8E8680] select-none min-h-0">
              <div className="w-16 h-16 rounded-full bg-white border border-[#EAE5E0] flex items-center justify-center shadow-xs text-primary mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Pilih Percakapan</h3>
              <p className="text-xs font-medium max-w-xs mt-1 leading-relaxed">
                Silakan pilih kontak pembeli atau toko di sebelah kiri untuk melihat percakapan dan memulai mengirim pesan.
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
