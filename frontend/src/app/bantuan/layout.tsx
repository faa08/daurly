"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Headphones } from "lucide-react";
import Footer from "@/components/Footer";
import { useCustomerService } from "@/components/CustomerServiceProvider";
import { authService, USER_UPDATED_EVENT } from "@/backend/authService";
import { resolveAvatarUrl } from "@/lib/avatar";

const NAV_ITEMS = [
  { label: "Pusat Bantuan", href: "/bantuan" },
  { label: "Pembayaran & Pickup", href: "/bantuan/pembayaran" },
  { label: "Pengiriman & Chat", href: "/bantuan/info-pengiriman" },
  { label: "Kebijakan Return", href: "/bantuan/kebijakan-return" },
  { label: "Model Konsinyasi", href: "/bantuan/konsinyasi" },
  { label: "FAQ", href: "/bantuan/faq" },
  { label: "Syarat & Ketentuan", href: "/bantuan/syarat-ketentuan" },
];

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { open: openCustomerService } = useCustomerService();
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

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

  const headerName = currentUser?.nama_lengkap || currentUser?.username;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── CUSTOM CARE HEADER ── */}
      <header className="bg-white border-b border-[#EAE5E0] sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1200px] w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-secondary hover:text-primary transition"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="h-5 w-[1px] bg-[#EAE5E0]" />
            <Link href="/bantuan" className="flex items-center gap-2">
              <div className="logo-stripes-small">
                <span className="stripe-orange-small"></span>
                <span className="stripe-gray-small"></span>
              </div>
              <span className="logo-text-bold-small text-on-surface">Daurly</span>
              <span className="bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide">CARE</span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={openCustomerService}
              className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-[#16A34A] transition"
            >
              <Headphones size={15} />
              Customer Service
            </button>
            {currentUser && (
              <>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#EAE5E0] bg-[#E8E8E8] flex items-center justify-center shrink-0">
                  <img
                    src={resolveAvatarUrl(currentUser.avatar)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                {headerName && (
                  <span className="text-xs font-bold text-on-surface hidden sm:inline truncate max-w-[120px]">
                    {headerName}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HELP CENTER SUB-NAVBAR ── */}
      <div className="bg-white border-b border-[#EAE5E0] sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-6 h-12 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-bold transition-all relative py-3 h-full flex items-center whitespace-nowrap ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating widget di halaman bantuan memakai tombol CS global (pojok kanan bawah) */}
      <Footer />
    </div>
  );
}
