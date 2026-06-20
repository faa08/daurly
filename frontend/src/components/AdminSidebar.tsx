"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "grid_view" },
    { name: "Verifikasi Toko", href: "/admin/verification", icon: "verified_user" },
    { name: "Manajemen Toko", href: "/admin/stores", icon: "storefront" },
    { name: "Transaksi", href: "/admin/transactions", icon: "receipt_long" },
    { name: "Laporan", href: "/admin/reports", icon: "analytics" },
    { name: "Pengaturan", href: "/admin/settings", icon: "settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col py-6 px-4 z-40 overflow-y-auto">
      {/* Brand Header & Profile Info */}
      <div className="flex items-center gap-3 mb-8 px-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" 
            alt="Superadmin Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="font-headline text-sm font-bold text-[#1F1B18] leading-tight">Pelataran UMKM</h1>
          <p className="text-[10px] text-[#5C5550] font-bold">Verified Superadmin</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                isActive
                  ? "bg-[#1D4ED8] text-white font-bold"
                  : "text-[#3E3834] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="pt-4 space-y-1">
        <Link
          href="/admin/help"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-[#3E3834] hover:bg-[#F5F3F0] hover:text-[#1F1B18] transition"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
          <span>Support</span>
        </Link>
        <Link
          href="/masuk"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-[#1D4ED8] hover:bg-[#EFF6FF] transition"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
