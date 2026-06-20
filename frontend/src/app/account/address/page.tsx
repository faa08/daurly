"use client";

import React, { useState } from "react";

export default function CustomerAddressPage() {
  const [addresses, setAddresses] = useState([
    {
      id: "1",
      label: "Alamat Rumah",
      isPrimary: true,
      recipient: "Budi Santoso",
      phone: "+62 812-3456-7890",
      fullAddress: "Jl. Kebon Jeruk No. 45, RT 005/RW 002, Kel. Palmerah, Kec. Palmerah, Kota Jakarta Barat, DKI Jakarta, 11480"
    },
    {
      id: "2",
      label: "Alamat Kantor",
      isPrimary: false,
      recipient: "Budi Santoso",
      phone: "+62 812-3456-7890",
      fullAddress: "Menara UMKM Digital, Lt. 12, Jl. Jend. Sudirman Kav. 52-53, Senayan, Kec. Kebayoran Baru, Jakarta Selatan, DKI Jakarta, 12190"
    }
  ]);

  const handleSetPrimary = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
      }))
    );
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus alamat ${label}?`)) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Daftar Alamat</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Atur alamat pengiriman untuk memudahkan proses belanja Anda.
          </p>
        </div>
        <button 
          onClick={() => alert("Membuka form Tambah Alamat Baru...")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Tambah Alamat Baru
        </button>
      </header>

      {/* Address cards */}
      <section className="space-y-6">
        {addresses.map((addr) => (
          <div 
            key={addr.id} 
            className={`bg-white border rounded-xl p-6 shadow-sm relative space-y-4 transition ${addr.isPrimary ? "border-primary ring-1 ring-primary" : "border-surface-container"}`}
          >
            {addr.isPrimary && (
              <span className="absolute top-4 right-4 bg-primary text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                Utama
              </span>
            )}
            
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  {addr.label === "Alamat Rumah" ? "home" : "work"}
                </span>
                {addr.label}
              </h3>
              <p className="text-xs font-bold text-on-surface">
                {addr.recipient} <span className="font-semibold text-secondary">({addr.phone})</span>
              </p>
              <p className="text-xs text-secondary font-medium leading-relaxed max-w-3xl">
                {addr.fullAddress}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold pt-2 border-t border-surface-container/60">
              <button 
                onClick={() => alert(`Ubah alamat: ${addr.label}`)}
                className="text-primary hover:underline"
              >
                Ubah
              </button>
              <span className="text-surface-dim font-light">|</span>
              <button 
                onClick={() => alert("Membuka pinpoint di peta...")}
                className="text-secondary hover:text-on-surface hover:underline"
              >
                Lihat di Peta
              </button>
              {!addr.isPrimary && (
                <>
                  <span className="text-surface-dim font-light">|</span>
                  <button 
                    onClick={() => handleSetPrimary(addr.id)}
                    className="text-primary hover:underline"
                  >
                    Jadikan Utama
                  </button>
                  <span className="text-surface-dim font-light">|</span>
                  <button 
                    onClick={() => handleDelete(addr.id, addr.label)}
                    className="text-error hover:underline"
                  >
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Add New Helpers Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Add new placeholder card */}
        <div 
          onClick={() => alert("Membuka form Tambah Alamat Baru...")}
          className="border-2 border-dashed border-surface-container rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:bg-white hover:border-primary/40 transition shadow-sm"
        >
          <div className="w-12 h-12 bg-primary-container/10 border border-primary-container/20 rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl font-bold">add_location_alt</span>
          </div>
          <h4 className="font-headline font-bold text-sm text-on-surface">Tambah Baru</h4>
          <p className="text-xs text-secondary font-medium leading-relaxed max-w-xs">
            Kirim pesanan ke keluarga atau teman dengan menambahkan alamat mereka.
          </p>
        </div>

        {/* Pinpoint banner card */}
        <div className="bg-white border border-surface-container rounded-xl overflow-hidden flex shadow-sm">
          <div className="p-6 flex flex-col justify-between flex-1 gap-4">
            <h4 className="font-headline font-bold text-sm text-on-surface leading-snug">Pinpoint Lokasi</h4>
            <p className="text-xs text-secondary font-medium leading-relaxed">
              Gunakan GPS untuk akurasi alamat yang lebih baik.
            </p>
            <button 
              onClick={() => alert("Mengakses GPS/Pinpoint...")}
              className="w-fit px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
            >
              Pinpoint Sekarang
            </button>
          </div>
          <div className="w-1/3 bg-zinc-100 flex items-center justify-center border-l border-surface-container relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=300&auto=format&fit=crop')` }}></div>
            <span className="material-symbols-outlined text-3xl text-primary relative z-10 font-bold">my_location</span>
          </div>
        </div>

      </section>

      {/* Privacy warning */}
      <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3 border border-surface-container text-xs text-secondary font-medium">
        <span className="material-symbols-outlined text-primary">shield</span>
        <span>Privasi Anda adalah prioritas kami. Informasi alamat hanya akan dibagikan kepada mitra logistik terpilih saat Anda melakukan transaksi.</span>
      </div>

    </div>
  );
}
