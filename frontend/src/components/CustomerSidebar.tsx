"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService, USER_UPDATED_EVENT } from "@/backend/authService";
import { resolveAvatarUrl } from "@/lib/avatar";
import { useLogoutConfirm } from "@/hooks/useLogoutConfirm";

export default function CustomerSidebar({
  mobileOpen = false,
  onNavigate,
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

  useEffect(() => {
    const syncUser = () => setUser(authService.getCurrentUser());
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener(USER_UPDATED_EVENT, syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(USER_UPDATED_EVENT, syncUser);
    };
  }, []);

  const { requestLogout, LogoutConfirmDialog } = useLogoutConfirm({
    onBeforeLogout: () => onNavigate?.(),
  });

  const menuItems = [
    { name: "Biodata", href: "/account/profile", icon: "person" },
    { name: "Alamat", href: "/account/address", icon: "location_on" },
    { name: "Pesanan Saya", href: "/account/orders", icon: "receipt" },
    { name: "Keamanan", href: "/account/security", icon: "shield" },
    {
      name: user?.is_affiliate ? "Affiliate Center" : "Bergabung Menjadi Affiliate",
      href: "/affiliate",
      icon: "share",
    },
  ];

  const displayName = user?.nama_lengkap || user?.username || "Pengguna";
  const avatarSrc = resolveAvatarUrl(user?.avatar);

  return (
    <aside
      className={`account-sidebar-drawer space-y-6 md:static md:translate-x-0 ${
        mobileOpen ? "is-open" : ""
      }`}
    >
      <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-6 h-full md:h-auto">
        {/* User details header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-surface-container-high bg-[#E8E8E8] flex items-center justify-center shrink-0">
            <img
              src={avatarSrc}
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="font-headline font-bold text-on-surface text-base leading-tight truncate">{displayName}</h3>
            <span className="inline-block bg-surface-container text-secondary text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border border-surface-container-high">
              Member Silver
            </span>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-secondary hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-surface-container my-3"></div>
          
          <button
            type="button"
            onClick={requestLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider text-error hover:bg-error-container/20 transition w-full text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar</span>
          </button>
        </nav>
      </div>
      <LogoutConfirmDialog />
    </aside>
  );
}
