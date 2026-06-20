"use client";

import React from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FCFCFA]">
      {/* Superadmin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="ml-72 flex-1 p-8 min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
