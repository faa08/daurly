"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { authService } from "@/backend/authService";
import AdminChatNotificationAlert from "@/components/AdminChatNotificationAlert";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      const user = await authService.refreshSession();
      if (cancelled) return;
      if (!user || user.role !== "admin") {
        router.replace("/masuk?msg=admin_only&redirect=/admin/dashboard");
        return;
      }
      setReady(true);
    }

    verifyAdmin();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FCFCFA] text-[#5C5550] text-sm font-semibold">
        Memverifikasi sesi superadmin...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FCFCFA]">
      <AdminChatNotificationAlert />
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop lg:hidden"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar mobileOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="admin-mobile-bar lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#EAE5E0] bg-white"
            aria-label="Buka menu"
          >
            <span className="material-symbols-outlined text-[22px] text-[#1F1B18]">menu</span>
          </button>
          <span className="font-bold text-sm text-[#1F1B18] truncate">Panel Superadmin</span>
        </header>

        <main className="admin-main-content ml-0 lg:ml-72 flex-1 p-4 md:p-6 lg:p-8 min-h-screen min-w-0">
          <div className="max-w-[1200px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
