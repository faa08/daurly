"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  ShoppingCart, 
  Tag, 
  Check, 
  MessageSquare, 
  Trash2, 
  BellOff, 
  RotateCcw, 
  User 
} from "lucide-react";

interface Notification {
  id: string;
  text: string;
  time: string;
  type: "offer" | "accepted" | "message";
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    text: "satriyo0997 membuat penawaran baru pada produk Anda",
    time: "21 jam yang lalu",
    type: "offer",
    unread: true,
  },
  {
    id: "2",
    text: "Penawaran Anda telah diterima! Buka transaksi untuk berkoordinasi.",
    time: "23 jam yang lalu",
    type: "accepted",
    unread: true,
  },
  {
    id: "3",
    text: "Pesan baru dari toko Sugar",
    time: "1 hari yang lalu",
    type: "message",
    unread: false,
  },
  {
    id: "4",
    text: "MuhammadJesen mengirimkan penawaran harga",
    time: "1 hari yang lalu",
    type: "offer",
    unread: false,
  },
  {
    id: "5",
    text: "Pesan baru dari wuajitrade",
    time: "2 hari yang lalu",
    type: "message",
    unread: false,
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isOpen || isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isProfileOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleReset = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const renderNotifIcon = (type: Notification["type"]) => {
    switch (type) {
      case "offer":
        return <Tag size={15} />;
      case "accepted":
        return <Check size={15} />;
      case "message":
        return <MessageSquare size={15} />;
    }
  };

  return (
    <header className="site-header">
      <div className="navbar-top-row">
        {/* Left: Logo */}
        <div className="nav-brand">
          <Link href="/" className="navbar-logo-custom">
            <div className="logo-stripes">
              <span className="stripe-orange"></span>
              <span className="stripe-gray"></span>
            </div>
            <span className="logo-text-bold">Pelataran UMKM</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="nav-actions-right">
          <Link href="/keranjang" className="nav-cart-btn" id="cart-btn">
            <ShoppingCart size={18} className="nav-icon-orange" />
            <span>Keranjang</span>
          </Link>

          {/* Chat Icon */}
          <Link href="/chat" className="nav-cart-btn" id="chat-btn" title="Chat">
            <MessageSquare size={18} className="nav-icon-orange" />
            <span>Chat</span>
          </Link>

          {/* Notification Button and Dropdown Card */}
          <div className="notif-container" ref={containerRef}>
            <button 
              className="nav-bell-btn" 
              id="notif-btn" 
              title="Notifikasi"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <Bell size={18} className="nav-icon-orange" />
              {unreadCount > 0 && (
                <span className="notif-badge-count">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span className="notif-title">Notifikasi</span>
                  <div className="notif-header-actions">
                    {notifications.length > 0 && (
                      <>
                        <button 
                          className="notif-btn-action" 
                          onClick={handleMarkAllRead}
                        >
                          Tandai semua dibaca
                        </button>
                        <button 
                          className="notif-btn-action notif-btn-action-danger" 
                          onClick={handleClearAll}
                          title="Hapus semua"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="notif-list">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-item ${notif.unread ? "unread" : ""}`}
                        onClick={() => handleToggleRead(notif.id)}
                      >
                        <div className={`notif-icon-box ${notif.type}`}>
                          {renderNotifIcon(notif.type)}
                        </div>
                        <div className="notif-content">
                          <p className="notif-text">{notif.text}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                        {notif.unread && (
                          <div className="notif-unread-indicator" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="notif-empty">
                      <BellOff size={36} className="notif-empty-icon" />
                      <h4 className="notif-empty-title">Tidak ada notif</h4>
                      <p className="notif-empty-desc">
                        Semua notifikasi baru akan muncul di sini.
                      </p>
                      <button className="notif-empty-reset" onClick={handleReset}>
                        <RotateCcw size={12} />
                        <span>Simulasikan Notifikasi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="nav-separator" />

          <Link href="/daftar" className="nav-auth-link" id="register-btn">
            Daftar
          </Link>
          <Link href="/masuk" className="nav-auth-link" id="login-btn">
            Login
          </Link>

          <div className="nav-profile-avatar relative" ref={profileContainerRef}>
            <button 
              className="avatar-circle" 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
            >
              <User size={18} className="text-[#4C1D95] fill-[#4C1D95]" />
            </button>
            {isProfileOpen && (
              <div className="absolute top-[calc(100%+14px)] right-0 w-[180px] bg-white border border-[#EAE5E0] rounded-[10px] shadow-lg z-50 overflow-hidden flex flex-col py-1.5">
                <Link 
                  href="/account/profile" 
                  className="w-full px-4 py-2.5 text-[13px] font-semibold text-[#1F1B18] text-left transition-all duration-150 flex items-center gap-2 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]" 
                  onClick={() => setIsProfileOpen(false)}
                >
                  Akun saya
                </Link>
                <Link 
                  href="/account/orders" 
                  className="w-full px-4 py-2.5 text-[13px] font-semibold text-[#1F1B18] text-left transition-all duration-150 flex items-center gap-2 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]" 
                  onClick={() => setIsProfileOpen(false)}
                >
                  Pesanan saya
                </Link>
                <button 
                  className="w-full px-4 py-2.5 text-[13px] font-semibold text-[#DC2626] text-left transition-all duration-150 flex items-center gap-2 border-t border-[#EAE5E0] mt-1 pt-3 hover:bg-[#FEE2E2]" 
                  onClick={() => {
                    setIsProfileOpen(false);
                    alert("Anda telah logout.");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
