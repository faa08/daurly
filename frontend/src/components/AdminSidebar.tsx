"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { name: "Verifikasi Toko", href: "/admin/verification", icon: "verified_user" },
    { name: "Manajemen Toko", href: "/admin/stores", icon: "storefront" },
    { name: "Transaksi", href: "/admin/transactions", icon: "receipt_long" },
    { name: "Laporan", href: "/admin/reports", icon: "analytics" },
    { name: "Pengaturan", href: "/admin/settings", icon: "settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest border-r border-surface-container flex flex-col py-8 px-4 z-40">
      {/* Brand Header */}
      <Link href="/" className="mb-8 px-4 flex items-center gap-3 hover:opacity-90 transition">
        <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white">
          <span className="material-symbols-outlined font-bold">storefront</span>
        </div>
        <div>
          <h1 className="font-headline text-lg font-bold text-primary leading-none">Pelataran UMKM</h1>
          <p className="font-body text-xs font-semibold text-secondary mt-1">Superadmin Panel</p>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold scale-[0.98]"
                  : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile indicator */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-surface-container mt-auto">
        <div className="w-8 h-8 rounded-full bg-zinc-400 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" alt="Admin Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-on-surface leading-tight">Superadmin</span>
          <span className="text-[10px] text-secondary font-medium">Admin Mode</span>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-surface-container pt-4 space-y-1">
        <Link
          href="/admin/help"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-secondary hover:bg-surface-container-high transition"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span>Help Center</span>
        </Link>
        <Link
          href="/masuk"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-error hover:bg-error-container/20 transition"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}
