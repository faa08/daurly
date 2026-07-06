"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  ShoppingCart, 
  Tag, 
  Check, 
  MessageSquare, 
  Trash2, 
  BellOff, 
  RotateCcw, 
  User,
  Ticket,
  Share2,
  LogOut,
  Headphones,
  Package,
} from "lucide-react";
import { authService, USER_UPDATED_EVENT } from "@/backend/authService";
import { resolveAvatarUrl } from "@/lib/avatar";
import { useCustomerService } from "@/components/CustomerServiceProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { useLogoutConfirm } from "@/hooks/useLogoutConfirm";
import type { NotificationItem } from "@/backend/notificationService";

type Notification = NotificationItem;

export default function Navbar({ searchQuery, setSearchQuery, hideCartAndChat = false }: { searchQuery?: string; setSearchQuery?: (q: string) => void; hideCartAndChat?: boolean }) {
  const router = useRouter();
  const { open: openCustomerService } = useCustomerService();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    handleMarkAllRead,
    handleClearAll,
    handleToggleRead,
    handleOpen,
    refresh,
  } = useNotifications();
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync current user on mount and on storage changes (login/logout in other tabs)
  useEffect(() => {
    const syncUser = () => setCurrentUser(authService.getCurrentUser());
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener(USER_UPDATED_EVENT, syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(USER_UPDATED_EVENT, syncUser);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (
        profileContainerRef.current && 
        !profileContainerRef.current.contains(event.target as Node) &&
        (!mobileSheetRef.current || !mobileSheetRef.current.contains(event.target as Node))
      ) {
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

  const { requestLogout, LogoutConfirmDialog } = useLogoutConfirm({
    onBeforeLogout: () => {
      setIsProfileOpen(false);
      setCurrentUser(null);
    },
  });

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
    <>
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
          {!hideCartAndChat && (
            <>
              <Link href="/keranjang" className="nav-cart-btn" id="cart-btn">
                <ShoppingCart size={18} className="nav-icon-orange" />
                <span className="nav-text-hide-sm">Keranjang</span>
              </Link>

              <button
                type="button"
                onClick={openCustomerService}
                className="nav-cart-btn"
                id="cs-btn"
                title="Customer Service"
              >
                <Headphones size={18} className="nav-icon-orange" />
                <span className="nav-text-hide-sm">Bantuan</span>
              </button>
            </>
          )}

          {/* Notification Button and Dropdown Card */}
          <div className="notif-container" ref={containerRef}>
            <button 
              className="nav-bell-btn" 
              id="notif-btn" 
              title="Notifikasi"
              onClick={() => {
                if (!isOpen) refresh();
                setIsOpen(!isOpen);
              }}
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
                        onClick={async () => {
                          const link = await handleOpen(notif);
                          setIsOpen(false);
                          if (link) router.push(link);
                        }}
                        style={{ cursor: notif.link ? "pointer" : "default" }}
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="nav-separator" />

          {currentUser ? (
            /* ── Logged-in: avatar + profile dropdown ── */
            <div className="nav-profile-avatar relative" ref={profileContainerRef}>
              <button
                className="flex items-center gap-2 hover:opacity-90 transition"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
              >
                <img src={resolveAvatarUrl(currentUser.avatar)} alt="avatar" className="w-8 h-8 shrink-0 rounded-full object-cover border border-surface-container bg-[#E8E8E8]" />
                <span className="text-sm font-semibold text-on-surface hidden sm:block max-w-[120px] truncate">
                  {currentUser.nama_lengkap || currentUser.username}
                </span>
              </button>

              {isProfileOpen && !isMobile && (
                <div className="absolute top-[calc(100%+14px)] right-0 w-[290px] bg-white border border-[#EAE5E0] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col py-3 px-3 text-[#1F1B18] normal-case tracking-normal">
                  {/* Profile Info Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 px-1">
                    <div className="flex items-center gap-3">
                      <img src={resolveAvatarUrl(currentUser.avatar)} alt="avatar" className="w-10 h-10 shrink-0 rounded-full object-cover bg-[#E8E8E8]" />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold leading-tight">{currentUser.nama_lengkap || currentUser.username}</span>
                        <span className="text-[11px] text-gray-400">@{currentUser.username}</span>
                      </div>
                    </div>
                    <Link
                      href={currentUser.role === "admin" ? "/admin/dashboard" : "/account/profile"}
                      onClick={() => setIsProfileOpen(false)}
                      className="px-3.5 py-1.5 bg-[#F5F3F0] hover:bg-[#EBE8E2] transition-colors rounded-full text-xs font-semibold text-gray-700"
                    >
                      {currentUser.role === "admin" ? "Dashboard" : "Profil Saya"}
                    </Link>
                  </div>

                  {/* Dropdown Items */}
                  <div className="flex flex-col gap-0.5 text-left font-body">
                    <Link
                      href="/account/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>Pesanan Saya</span>
                    </Link>

                    <Link
                      href="/promo"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-gray-400" />
                      <span>Kupon dan Diskon</span>
                    </Link>

                    <Link
                      href="/account/affiliate"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-gray-400" />
                      <span>Program Affiliate</span>
                    </Link>


                    <button
                      onClick={requestLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left w-full mt-1 border-t border-gray-100 pt-3"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Daftar + Login ── */
            <>
              <Link href="/daftar" className="nav-auth-link" id="register-btn">
                Daftar
              </Link>
              <Link href="/masuk" className="nav-auth-link" id="login-btn">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>

      {/* Mobile Bottom Sheet — only shown when logged in */}
      {isProfileOpen && isMobile && currentUser && (
        <div className="md:hidden">
          <div 
            className="fixed inset-0 bg-[#1F1B18]/40 backdrop-blur-xs z-[10050] animate-fade-in"
            onClick={() => setIsProfileOpen(false)}
          />
          <div 
            ref={mobileSheetRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] border-t border-[#EAE5E0] shadow-2xl z-[10051] px-6 pb-8 pt-3 text-[#1F1B18] animate-slide-up normal-case tracking-normal flex flex-col"
          >
            {/* Handlebar */}
            <div 
              className="w-12 h-1.5 bg-[#EAE5E0] rounded-full mx-auto mb-5 cursor-pointer"
              onClick={() => setIsProfileOpen(false)}
            />

            {/* Profile Info Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F5F3F0]">
              <div className="flex items-center gap-3">
                <img src={resolveAvatarUrl(currentUser.avatar)} alt="avatar" className="w-11 h-11 shrink-0 rounded-full object-cover border border-[#EAE5E0] bg-[#E8E8E8]" />
                <div className="flex flex-col text-left">
                  <span className="text-base font-bold leading-tight text-[#1F1B18]">{currentUser.nama_lengkap || currentUser.username}</span>
                  <span className="text-xs text-[#8E8680]">@{currentUser.username}</span>
                </div>
              </div>
              <Link 
                href={currentUser.role === "admin" ? "/admin/dashboard" : "/account/profile"}
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 bg-[#F5F3F0] hover:bg-[#EBE8E2] transition-colors rounded-full text-xs font-bold text-[#5C5550]"
              >
                {currentUser.role === "admin" ? "Dashboard" : "Profil Saya"}
              </Link>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1 text-left font-body">
              <Link
                href="/account/orders"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-[#5C5550] hover:bg-gray-50 transition-colors border border-gray-100/50"
              >
                <Package className="w-5 h-5 text-[#8E8680]" />
                <span>Pesanan Saya</span>
              </Link>

              <Link
                href="/promo"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-[#5C5550] hover:bg-gray-50 transition-colors border border-gray-100/50"
              >
                <Ticket className="w-5 h-5 text-[#8E8680]" />
                <span>Kupon dan Diskon</span>
              </Link>

              <Link
                href="/account/affiliate"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-[#5C5550] hover:bg-gray-50 transition-colors border border-gray-100/50"
              >
                <Share2 className="w-5 h-5 text-[#8E8680]" />
                <span>Program Affiliate</span>
              </Link>


              <button
                type="button"
                onClick={requestLogout}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left w-full mt-2 border border-red-100 bg-red-50/20"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <LogoutConfirmDialog />
    </>
  );
}
