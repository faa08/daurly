"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegisterSeller = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Pendaftaran Seller Berhasil! Selamat datang di Pelataran UMKM Seller.");
      router.push("/seller/products");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Gabung Sebagai Seller</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Buka toko Anda sekarang dan mulailah memasarkan produk lokal unggulan Anda ke seluruh Indonesia.
        </p>
      </header>

      {/* Main Promo Card */}
      <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm flex flex-col items-center text-center gap-6 max-w-2xl mx-auto py-12">
        <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-4xl">storefront</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-headline font-bold text-xl text-on-surface">
            Jual produk UMKM mu dengan menjadi seller
          </h3>
          <p className="text-xs text-secondary font-medium leading-relaxed max-w-md">
            Dapatkan kemudahan mengelola produk, memantau penjualan, dan berinteraksi langsung dengan pembeli melalui dashboard seller yang terintegrasi.
          </p>
        </div>

        <button 
          onClick={handleRegisterSeller}
          disabled={loading}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition flex items-center gap-2"
        >
          {loading ? (
            <span>Menyiapkan Toko...</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>Buka Toko</span>
            </>
          )}
        </button>
      </section>

      {/* Benefits Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="bg-white border border-surface-container p-5 rounded-xl space-y-2 text-center shadow-xs">
          <span className="material-symbols-outlined text-primary text-2xl">payments</span>
          <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">Komisi 0%</h4>
          <p className="text-[11px] text-secondary leading-relaxed font-medium">
            Semua hasil penjualan masuk ke rekening Anda tanpa potongan biaya admin yang memberatkan.
          </p>
        </div>

        <div className="bg-white border border-surface-container p-5 rounded-xl space-y-2 text-center shadow-xs">
          <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
          <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">Jangkauan Nasional</h4>
          <p className="text-[11px] text-secondary leading-relaxed font-medium">
            Pasarkan produk kerajinan dan kuliner Anda ke pembeli dari Sabang sampai Merauke.
          </p>
        </div>

        <div className="bg-white border border-surface-container p-5 rounded-xl space-y-2 text-center shadow-xs">
          <span className="material-symbols-outlined text-primary text-2xl">support_agent</span>
          <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">Pendampingan</h4>
          <p className="text-[11px] text-secondary leading-relaxed font-medium">
            Dapatkan dukungan pelatihan digital marketing gratis untuk mengembangkan bisnis Anda.
          </p>
        </div>
      </section>
    </div>
  );
}
