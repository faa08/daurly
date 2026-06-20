"use client";

import React from "react";
import CustomerSidebar from "@/components/CustomerSidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      {/* Global Top Navigation Bar */}
      <Header cartCount={1} showProfile={true} />

      {/* Main Content viewport grid */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Column (Customer Sidebar Menu Component) */}
        <CustomerSidebar />

        {/* Right Column (Inner Page content) */}
        <section className="md:col-span-3">
          {children}
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
