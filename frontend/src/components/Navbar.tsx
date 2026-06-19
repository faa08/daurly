"use client";

import { ShoppingCart, Bell } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
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

          <button className="nav-bell-btn" id="notif-btn" title="Notifikasi">
            <Bell size={18} className="nav-icon-orange" />
          </button>

          <div className="nav-separator" />

          <Link href="/daftar" className="nav-auth-link" id="register-btn">
            Daftar
          </Link>
          <Link href="/masuk" className="nav-auth-link" id="login-btn">
            Login
          </Link>

          <div className="nav-profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-icon">👤</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
