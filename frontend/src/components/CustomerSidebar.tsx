"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Biodata", href: "/account/profile", icon: "person" },
    { name: "Alamat", href: "/account/address", icon: "location_on" },
    { name: "Pesanan Saya", href: "/account/orders", icon: "receipt" },
    { name: "Keamanan", href: "/account/security", icon: "shield" },
  ];

  return (
    <aside className="space-y-6">
      <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-6">
        {/* User details header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-surface-container-high">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="User Profile large" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-headline font-bold text-on-surface text-base leading-tight">Siti Rahayu</h3>
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
          
          <Link
            href="/masuk"
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider text-error hover:bg-error-container/20 transition"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
