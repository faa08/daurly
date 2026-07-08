"use client";

import Link from "next/link";

export default function AffiliatePage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Program Affiliate</h2>
        <p className="text-secondary mt-1 text-sm">
          Bagikan link produk daur ulang dan dapatkan komisi dari setiap transaksi berhasil.
        </p>
      </header>
      <div className="bg-white border border-surface-container rounded-xl p-8 shadow-sm space-y-4">
        <p className="text-sm text-secondary leading-relaxed">
          Fitur affiliate sedang dalam pengembangan. Saat ini kamu bisa mulai berbelanja dan
          mendukung perajin ramah lingkungan melalui marketplace Daurly.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-95"
        >
          Jelajahi Produk
        </Link>
      </div>
    </div>
  );
}
