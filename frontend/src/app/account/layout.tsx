"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CustomerSidebar from "@/components/CustomerSidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function getAccountPageTitle(pathname: string): string {
  if (pathname.startsWith("/account/profile")) return "Biodata";
  if (pathname.startsWith("/account/address")) return "Alamat";
  if (pathname.startsWith("/account/orders")) return "Pesanan Saya";
  if (pathname.startsWith("/account/security")) return "Keamanan";
  if (pathname.startsWith("/account/wishlist")) return "Wishlist";
  return "Akun Saya";
}

export default function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = getAccountPageTitle(pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Header showProfile={true} />

      {sidebarOpen && (
        <button
          type="button"
          className="account-sidebar-backdrop md:hidden"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <CustomerSidebar
          mobileOpen={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />

        <section className="md:col-span-3 min-w-0">
          <header className="account-mobile-bar md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#EAE5E0] bg-white shrink-0"
              aria-label="Buka menu akun"
            >
              <span className="material-symbols-outlined text-[22px] text-[#1F1B18]">menu</span>
            </button>
            <span className="font-bold text-sm text-[#1F1B18] truncate">{pageTitle}</span>
          </header>

          {children}
        </section>
      </main>

      <Footer />
    </div>
  );
}
