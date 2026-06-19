"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  cartCount?: number;
  showProfile?: boolean;
  isMinimalist?: boolean; // Used for login / minimalist pages
}

export default function Header({
  cartCount = 0,
  showProfile = false,
  isMinimalist = false,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-surface-container-highest py-4 px-6 md:px-12 flex items-center justify-between z-40 sticky top-0 shadow-sm">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
        <span className="material-symbols-outlined text-primary text-3xl font-semibold">storefront</span>
        <span className="font-headline text-2xl font-bold text-[#212121]">Pelataran UMKM</span>
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
          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-secondary text-sm">
            <Link href="/" className="hover:text-primary transition">Home Page</Link>
            <span className="opacity-30">|</span>
            <Link href="/seller/dashboard" className="hover:text-primary transition">Portal Seller</Link>
            <span className="opacity-30">|</span>
            <Link href="/admin/dashboard" className="hover:text-primary transition">Portal Admin</Link>
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-6">
            {/* Cart Icon */}
            <Link href="/account/orders" className="relative p-1 text-on-surface hover:text-primary transition flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-primary-container">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-container text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Button */}
            <button className="p-1 text-on-surface hover:text-primary transition" suppressHydrationWarning>
              <span className="material-symbols-outlined text-2xl text-primary-container">notifications</span>
            </button>

            <div className="h-6 w-px bg-surface-container-highest"></div>

            {/* Profile Avatar vs Login/Register Buttons */}
            {showProfile ? (
              <Link href="/account/profile" className="flex items-center gap-2 hover:opacity-90 transition">
                <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden border border-surface-container-high">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" 
                    alt="User Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-xs font-bold text-on-surface hidden md:inline">Siti Rahayu</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 text-xs font-bold text-secondary uppercase tracking-wider">
                <Link href="/daftar" className="hover:text-primary transition">Daftar</Link>
                <Link href="/masuk" className="hover:text-primary transition">Login</Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
