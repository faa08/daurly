"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import Footer from "@/components/Footer";

const NAV_ITEMS = [
  { label: "Pusat Bantuan", href: "/bantuan" },
  { label: "FAQ / Tanya Jawab", href: "/bantuan/faq" },
  { label: "Informasi Pengiriman", href: "/bantuan/info-pengiriman" },
  { label: "Syarat & Ketentuan", href: "/bantuan/syarat-ketentuan" },
];

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
              <span className="logo-text-bold-small text-on-surface">Pelataran</span>
              <span className="bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide">CARE</span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/chat"
              className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-[#1D4ED8] transition"
            >
              <Mail size={15} />
              Pesan Bantuan
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-950 flex items-center justify-center text-white text-xs font-bold border border-[#EAE5E0]">
              G
            </div>
            <span className="text-xs font-bold text-on-surface hidden sm:inline">game</span>
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

      {/* ── STICKY FLOATING CHAT WIDGET ── */}
      <div className="fixed bottom-6 right-6 z-40 max-w-[340px] w-full bg-white border border-primary/20 rounded-xl p-4 shadow-xl flex items-center justify-between gap-3 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-pale text-primary flex items-center justify-center flex-shrink-0 relative">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white absolute bottom-0 right-0 animate-ping" />
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white absolute bottom-0 right-0" />
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-[10px] text-secondary font-extrabold uppercase leading-none">Butuh Bantuan Lebih?</p>
            <p className="text-xs font-extrabold text-on-surface mt-1 leading-snug">Mulai chat dengan TANYA</p>
          </div>
        </div>
        <Link
          href="/chat"
          className="bg-primary text-white text-[11px] font-extrabold px-3 py-2 rounded-lg hover:brightness-95 active:scale-95 transition flex-shrink-0"
        >
          Mulai Chat
        </Link>
      </div>

      <Footer />
    </div>
  );
}
