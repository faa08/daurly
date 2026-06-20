"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: "grid_view" },
    { name: "Produk Saya", href: "/seller/products", icon: "inventory_2" },
    { name: "Pesanan Baru", href: "/seller/orders", icon: "shopping_bag" },
    { name: "Statistik Penjualan", href: "/seller/analytics", icon: "analytics" },
    { name: "Pengaturan Toko", href: "/seller/settings", icon: "settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-[#EAE5E0] flex flex-col py-6 px-4 z-40 overflow-y-auto">
      {/* Brand Header */}
      <Link href="/" className="mb-6 px-4 flex items-center gap-2 hover:opacity-90 transition">
        <div className="flex flex-col gap-0.5 w-4 flex-shrink-0">
          <span className="h-0.5 w-full bg-[#1D4ED8] rounded-sm"></span>
          <span className="h-0.5 w-full bg-[#8E8680] rounded-sm"></span>
        </div>
        <span className="font-headline text-lg font-bold text-[#1F1B18]">Pelataran UMKM</span>
      </Link>

      {/* Merchant Profile Card */}
      <div className="bg-[#F5F3F0] rounded-xl p-4 mb-6 flex items-center gap-3 border border-[#EAE5E0]">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D5CFC9] flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop" 
            alt="Merchant Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="overflow-hidden">
          <h3 className="font-headline text-xs font-bold text-[#1F1B18] truncate">Toko Maju Jaya</h3>
          <p className="text-[10px] text-[#8E8680] font-semibold">Verified Merchant</p>
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
                  : "text-[#5C5550] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-[#EAE5E0] pt-4 space-y-1">
        <Link
          href="/seller/help"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-[#5C5550] hover:bg-[#F5F3F0] hover:text-[#1F1B18] transition"
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
