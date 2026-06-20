"use client";

import React, { useState } from "react";

export default function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [fullname, setFullname] = useState("Siti Rahayu");
  const [birthdate, setBirthdate] = useState("15 Mei 1995");
  const [gender, setGender] = useState("Perempuan");
  const [phone, setPhone] = useState("+62 812 3456 7890");

  const recentOrders = [
    {
      item: "Kain Batik Tulis Solo Premium",
      invoice: "INV/20231024/MP/123",
      price: 450000,
      status: "Selesai",
    },
    {
      item: "Set Kerajinan Kayu Jati",
      invoice: "INV/20231022/MP/456",
      price: 125000,
      status: "Dikirim",
    }
  ];

  const wishlists = [
    { name: "Tas Rotan Modern", price: 210000, img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200&auto=format&fit=crop" },
    { name: "Lilin Aromaterapi Kayu Manis", price: 45000, img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200&auto=format&fit=crop" },
    { name: "Kopi Arabika Gayo 250g", price: 65000, img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=200&auto=format&fit=crop" },
    { name: "Dompet Kulit Ukir", price: 320000, img: "https://images.unsplash.com/photo-1627124765950-2a3b0b8d278b?q=80&w=200&auto=format&fit=crop" },
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Profil Berhasil Diperbarui!");
  };

  return (
    <div className="space-y-8">
      {/* User Header Details card */}
      <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-surface-container-high bg-zinc-200">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" alt="Customer Profile Large" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <h2 className="font-headline font-bold text-2xl text-on-surface leading-tight">{fullname}</h2>
            <p className="font-body text-xs text-secondary">siti.rahayu@email.com &bull; Joined Jan 2023</p>
            <div className="flex gap-3 pt-2">
              <span className="text-[10px] font-bold text-secondary bg-surface-container px-2 py-0.5 rounded border border-surface-container-high">
                Poin Saya: 1,250 pts
              </span>
              <span className="text-[10px] font-bold text-primary bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Voucher: 4 Tersedia
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          {isEditing ? "Batal Edit" : "Edit Profil"}
        </button>
      </section>

      {/* Basic info vs Recent orders split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Informasi Dasar */}
        <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-base text-on-surface border-b border-surface-container pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">person</span>
            Informasi Dasar
          </h3>
          
          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Tanggal Lahir</label>
                <input 
                  type="text" 
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Jenis Kelamin</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-semibold text-secondary"
                >
                  <option>Perempuan</option>
                  <option>Laki-laki</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nomor HP</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
              >
                Simpan Perubahan
              </button>
            </form>
          ) : (
            <div className="space-y-3 font-body text-xs">
              <div className="grid grid-cols-3 py-1">
                <span className="font-bold text-secondary">Nama Lengkap</span>
                <span className="col-span-2 text-on-surface font-semibold">{fullname}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-t border-surface-container">
                <span className="font-bold text-secondary">Tanggal Lahir</span>
                <span className="col-span-2 text-on-surface font-semibold">{birthdate}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-t border-surface-container">
                <span className="font-bold text-secondary">Jenis Kelamin</span>
                <span className="col-span-2 text-on-surface font-semibold">{gender}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-t border-surface-container">
                <span className="font-bold text-secondary">Nomor HP</span>
                <span className="col-span-2 text-on-surface font-semibold">{phone}</span>
              </div>
            </div>
          )}
        </section>

        {/* Pesanan Terakhir */}
        <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container pb-2">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              Pesanan Terakhir
            </h3>
            <button className="text-primary font-bold text-xs hover:underline">Lihat Semua</button>
          </div>

          <div className="space-y-3">
            {recentOrders.map((ord, idx) => (
              <div key={idx} className="p-4 border border-surface-container rounded-lg bg-surface-container-low/20 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-semibold text-xs text-on-surface leading-tight">{ord.item}</p>
                  <p className="text-[10px] text-secondary font-semibold">{ord.invoice}</p>
                  <p className="font-bold text-xs text-primary mt-1">Rp {ord.price.toLocaleString("id-ID")}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${ord.status === "Selesai" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Wishlist Terbaru */}
      <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-surface-container pb-2">
          <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">favorite</span>
            Wishlist Terbaru
          </h3>
          <button className="text-primary font-bold text-xs hover:underline">Lihat Wishlist</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlists.map((w, idx) => (
            <div key={idx} className="border border-surface-container rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div className="h-32 bg-surface-container overflow-hidden">
                <img src={w.img} alt={w.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-semibold text-xs text-on-surface line-clamp-1">{w.name}</h4>
                <p className="font-extrabold text-xs text-primary">Rp {w.price.toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
