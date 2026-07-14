"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // Simpan di cookie selama 7 hari
      document.cookie = `daurly_affiliate_code=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      localStorage.setItem("daurly_affiliate_code", ref);

      // Kirim request ke backend untuk mencatat klik
      fetch("/api/affiliate/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref }),
      }).catch((err) => {
        console.error("Gagal mencatat rujukan klik affiliate:", err);
      });
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
