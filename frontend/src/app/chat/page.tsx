"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CustomerServiceChat } from "@/components/CustomerServiceProvider";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "ai";

  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Navbar hideCartAndChat />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F5F3F0] md:p-6 items-center">
        <div className="w-full h-full max-w-3xl flex flex-col bg-white md:rounded-2xl md:shadow-xl md:border md:border-[#EAE5E0] overflow-hidden">
          <CustomerServiceChat fullPage initialMode={initialMode} />
        </div>
      </main>
    </div>
  );
}

export default function CustomerServicePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center text-sm text-secondary">Memuat chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
