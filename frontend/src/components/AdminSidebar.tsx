"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { authService } from "@/backend/authService";
import { adminService } from "@/backend/adminService";
import { useLogoutConfirm } from "@/hooks/useLogoutConfirm";

export default function AdminSidebar({
  mobileOpen = false,
  onNavigate,
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabQuery = searchParams.get("tab") || "";
  const [adminUser, setAdminUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);
  const [pendingChatCount, setPendingChatCount] = useState(0);

  useEffect(() => {
    setAdminUser(authService.getCurrentUser());
    const handleStorage = () => setAdminUser(authService.getCurrentUser());
    window.addEventListener("storage", handleStorage);
    adminService.getPendingShippingChatCount().then(setPendingChatCount);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pathname]);

  const { requestLogout, LogoutConfirmDialog } = useLogoutConfirm({
    redirectTo: "/masuk?msg=logged_out",
    onBeforeLogout: () => onNavigate?.(),
  });

  const displayName = adminUser?.nama_lengkap || adminUser?.username || "Superadmin";
  const avatarSrc = adminUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop";

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "grid_view" },
    { name: "Manajemen User", href: "/admin/users", icon: "manage_accounts" },
    { name: "Manajemen Toko", href: "/admin/stores", icon: "storefront" },
    { name: "Manajemen Produk", href: "/admin/products", icon: "inventory_2" },
    { name: "Kategori Produk", href: "/admin/categories", icon: "category" },
    { name: "Banner & Hero", href: "/admin/banners", icon: "view_carousel" },
    { name: "Pesanan", href: "/admin/orders", icon: "shopping_bag" },
    { name: "Pusat Chat", href: "/admin/chat", icon: "forum" },
    { name: "Pengiriman", href: "/admin/pengiriman", icon: "local_shipping" },
    { name: "Saldo", href: "/admin/saldo", icon: "account_balance_wallet" },
    { name: "Transaksi", href: "/admin/transactions", icon: "receipt_long" },
    { name: "Laporan", href: "/admin/reports", icon: "analytics" },
    { name: "Kupon & Diskon", href: "/admin/coupons", icon: "percent" },
    { name: "Kontak & CS", href: "/admin/contact", icon: "contact_support" },
    { name: "Tarif & Komisi", href: "/admin/commission", icon: "payments" },
    { name: "Affiliate Partner", href: "/admin/affiliates", icon: "handshake" },
    { name: "Kebijakan & TOS", href: "/admin/policies", icon: "gavel" },
    { name: "Batas Waktu", href: "/admin/limits", icon: "hourglass_empty" },
    { name: "Maintenance", href: "/admin/maintenance", icon: "construction" },
  ];

  return (
    <aside
      className={`admin-sidebar-drawer fixed left-0 top-0 h-screen w-72 max-w-[85vw] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col py-6 px-4 z-50 overflow-y-auto lg:translate-x-0 ${
        mobileOpen ? "is-open" : ""
      }`}
    >
      {/* Brand Header & Profile Info */}
      <div className="flex items-center gap-3 mb-8 px-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
          <img 
            src={avatarSrc}
            alt="Superadmin Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="font-headline text-sm font-bold text-[#1F1B18] leading-tight truncate max-w-[180px]">{displayName}</h1>
          <p className="text-[10px] text-[#5C5550] font-bold">Verified Superadmin</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/chat" && pathname.startsWith("/admin/chat"));
          const badge =
            item.href === "/admin/chat" && pendingChatCount > 0 ? pendingChatCount : null;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                isActive
                  ? "bg-[#16A34A] text-white font-bold"
                  : "text-[#3E3834] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {badge !== null && (
                <span
                  className={`text-[10px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center font-extrabold ${
                    isActive ? "bg-white text-[#16A34A]" : "bg-[#16A34A] text-white"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="pt-4 space-y-1">
        <Link
          href="/admin/help"
          onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-[#3E3834] hover:bg-[#F5F3F0] hover:text-[#1F1B18] transition"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
          <span>Support</span>
        </Link>
        <button
          type="button"
          onClick={requestLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-[#16A34A] hover:bg-[#F0FDF4] transition w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
      <LogoutConfirmDialog />
    </aside>
  );
}
