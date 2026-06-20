"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Bell, 
  Tag, 
  Check, 
  MessageSquare, 
  Trash2, 
  BellOff, 
  RotateCcw,
  User 
} from "lucide-react";

interface HeaderProps {
  cartCount?: number;
  showProfile?: boolean;
  isMinimalist?: boolean; // Used for login / minimalist pages
}

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

export default function Header({
  cartCount = 0,
  showProfile = false,
  isMinimalist = false,
}: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const profileContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isProfileOpen || isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen, isOpen]);

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
        {/* Brand Logo - Styled to match home page logo with stripes */}
        <Link href="/" className="navbar-logo-custom hover:opacity-90 transition">
          <div className="logo-stripes">
            <span className="stripe-orange"></span>
            <span className="stripe-gray"></span>
          </div>
          <span className="logo-text-bold">Pelataran UMKM</span>
        </Link>

        {/* If minimalist (e.g. Login Screen), show only a back to home link */}
        {isMinimalist ? (
          <nav className="font-semibold text-xs uppercase tracking-wider text-secondary">
            <Link href="/" className="flex items-center gap-1.5 hover:text-primary transition">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali ke Beranda
            </Link>
          </nav>
        ) : (
          <>
            {/* Action Area */}
            <div className="flex items-center gap-6">
              {/* Search Bar inside Header */}
              <div className="relative flex items-center w-[180px] sm:w-[240px] md:w-[320px]">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px] pointer-events-none">search</span>
                <input 
                  type="text" 
                  placeholder="Cari produk UMKM..." 
                  className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body text-[#1F1B18]"
                />
              </div>

              {/* Cart Icon */}
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

              {/* Profile Avatar vs Login/Register Buttons */}
              {showProfile ? (
                <div className="relative flex items-center" ref={profileContainerRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 hover:opacity-90 transition"
                    aria-expanded={isProfileOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden border border-surface-container-high">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" 
                        alt="User Profile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-xs font-bold text-on-surface hidden md:inline">Siti Rahayu</span>
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
              ) : (
                <div className="flex items-center gap-4 text-xs font-bold text-secondary uppercase tracking-wider">
                  <Link href="/daftar" className="hover:text-primary transition">Daftar</Link>
                  <Link href="/masuk" className="hover:text-primary transition">Login</Link>
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
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
