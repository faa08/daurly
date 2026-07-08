"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authService } from "@/backend/authService";
import { systemSettingsService } from "@/backend/systemSettingsService";
import Link from "next/link";
import { Loader2, Construction } from "lucide-react";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkMaintenance() {
      try {
        const currentUser = authService.getCurrentUser();
        const userIsAdmin = currentUser?.role === "admin";
        setIsAdmin(userIsAdmin);

        const maintenanceActive = await systemSettingsService.getMaintenanceMode();
        if (active) {
          setIsMaintenance(maintenanceActive);
        }
      } catch (err) {
        console.error("Gagal memeriksa mode pemeliharaan:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkMaintenance();
    return () => {
      active = false;
    };
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-[#5C5550]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1D4ED8]" />
          <span className="text-sm font-semibold">Memuat halaman...</span>
        </div>
      </div>
    );
  }

  const isAllowedPath =
    pathname === "/masuk" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api");

  if (isMaintenance && !isAdmin && !isAllowedPath) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] text-[#1F1B18] px-6 py-12 select-none">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#EAE5E0] shadow-xl p-8 md:p-10 text-center flex flex-col items-center gap-6 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-[#1D4ED8] flex flex-col justify-center gap-1 p-1">
              <span className="h-1 bg-white rounded-full"></span>
              <span className="h-1 bg-white/60 rounded-full w-2/3"></span>
            </div>
            <span className="font-headline text-lg font-black text-[#1F1B18] tracking-tight">
              Daurly
            </span>
          </div>

          {/* Construction Icon */}
          <div className="w-16 h-16 rounded-full bg-[#FFF3ED] text-[#E8600A] flex items-center justify-center">
            <Construction className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-xl md:text-2xl font-black tracking-tight font-headline">
              Situs Sedang Diperbarui
            </h1>
            <p className="text-sm text-[#5C5550] leading-relaxed">
              Halo pembeli setia! Kami sedang melakukan pemeliharaan rutin untuk meningkatkan kenyamanan berbelanja Anda. Kami akan segera kembali!
            </p>
          </div>

          <div className="w-full h-px bg-[#EAE5E0]"></div>

          <div className="text-xs text-[#8E8680] leading-normal">
            Punya kendala mendesak? Hubungi kami di <br />
            <a href="mailto:linkproductive@gmail.com" className="font-bold text-[#1D4ED8] hover:underline">
              linkproductive@gmail.com
            </a>
          </div>

          <Link href="/masuk" className="text-[10px] text-[#8E8680]/30 hover:text-[#1D4ED8] transition-colors mt-2">
            Login sebagai Admin
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
