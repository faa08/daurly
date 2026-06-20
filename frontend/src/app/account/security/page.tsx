"use client";

import React, { useState } from "react";

export default function CustomerSecurityPage() {
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: "1",
      device: "MacBook Pro",
      location: "Jakarta, Indonesia",
      info: "Chrome Browser",
      status: "Aktif Sekarang",
      isCurrent: true,
    },
    {
      id: "2",
      device: "iPhone 13",
      location: "Bandung, Indonesia",
      info: "Aplikasi Pelataran UMKM",
      status: "2 jam yang lalu",
      isCurrent: false,
    }
  ]);

  const handleLogoutSession = (id: string, device: string) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan sesi dari perangkat ${device}?`)) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleDeleteAccount = () => {
    const confirmText = prompt("Ketik HAPUS untuk mengonfirmasi penghapusan akun Anda secara permanen:");
    if (confirmText === "HAPUS") {
      alert("Akun Anda telah berhasil dijadwalkan untuk dihapus.");
    } else if (confirmText !== null) {
      alert("Konfirmasi tidak valid. Penghapusan dibatalkan.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Keamanan Akun</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Lindungi akun Anda dengan mengatur keamanan tambahan dan memperbarui kata sandi secara berkala.
        </p>
      </header>

      {/* Main security grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kata Sandi */}
        <section className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">lock</span>
              Kata Sandi
            </h3>
            <p className="text-xs text-secondary font-medium leading-relaxed">
              Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun dari akses yang tidak sah.
            </p>
            <p className="text-[10px] text-secondary font-bold pt-1">
              Terakhir diubah: 3 bulan yang lalu
            </p>
          </div>
          <button 
            onClick={() => alert("Membuka dialog Ganti Kata Sandi...")}
            className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
          >
            Ganti Kata Sandi
          </button>
        </section>

        {/* Verifikasi Kontak */}
        <section className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm">
          <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
            Verifikasi Kontak
          </h3>
          
          <div className="space-y-4 text-xs font-body">
            <div className="flex justify-between items-center py-1">
              <div>
                <p className="font-bold text-secondary">Email</p>
                <p className="font-semibold text-on-surface">budi.umkm@gmail.com</p>
              </div>
              <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Terverifikasi
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-t border-surface-container">
              <div>
                <p className="font-bold text-secondary">Nomor Telepon</p>
                <p className="font-semibold text-on-surface">0812 **** 5678</p>
              </div>
              <button 
                onClick={() => alert("Membuka form ubah nomor telepon...")}
                className="text-primary font-bold hover:underline"
              >
                Ubah
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Autentikasi 2 Faktor (2FA) */}
      <section className="bg-white border border-surface-container p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-2">
          <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">phone_android</span>
            Autentikasi Dua Faktor (2FA)
          </h3>
          <p className="text-xs text-secondary font-medium leading-relaxed max-w-xl">
            Tambahkan lapisan keamanan ekstra ke akun Anda. Setelah diaktifkan, Anda akan diminta memasukkan kode verifikasi setiap kali login.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-secondary pt-1">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-green-600">done</span> Keamanan berlapis</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-green-600">done</span> Notifikasi login baru</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-zinc-100 rounded border border-surface-container-high flex items-center justify-center relative">
            <div className="absolute inset-2 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=100&auto=format&fit=crop')` }}></div>
            {tfaEnabled && <span className="absolute inset-0 bg-green-500/20 backdrop-blur-xs flex items-center justify-center text-green-600 font-bold text-xs">ACTIVE</span>}
          </div>
          <button
            onClick={() => {
              setTfaEnabled(!tfaEnabled);
              alert(tfaEnabled ? "2FA Dinonaktifkan." : "2FA Diaktifkan! Pindai kode QR untuk mengonfigurasi.");
            }}
            className={`w-full py-2 border rounded font-bold text-xs transition ${tfaEnabled ? "bg-green-600 border-green-600 text-white" : "border-on-surface text-on-surface hover:bg-surface-container"}`}
          >
            {tfaEnabled ? "Matikan 2FA" : "Aktifkan 2FA"}
          </button>
        </div>
      </section>

      {/* Sesi Aktif */}
      <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">devices</span>
          Sesi Aktif
        </h3>
        <p className="text-xs text-secondary font-medium pb-2 border-b border-surface-container">
          Perangkat yang saat ini sedang login ke akun Anda.
        </p>

        <div className="divide-y divide-surface-container">
          {sessions.map((session) => (
            <div key={session.id} className="py-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">
                  {session.device === "MacBook Pro" ? "laptop" : "smartphone"}
                </span>
                <div>
                  <p className="font-bold text-on-surface">{session.device} &bull; {session.location}</p>
                  <p className="text-secondary font-semibold mt-0.5">
                    {session.info} &bull; <span className={session.isCurrent ? "text-green-600 font-bold" : ""}>{session.status}</span>
                  </p>
                </div>
              </div>
              
              {session.isCurrent ? (
                <span className="text-secondary font-bold">Perangkat Ini</span>
              ) : (
                <button
                  onClick={() => handleLogoutSession(session.id, session.device)}
                  className="text-error font-bold hover:underline"
                >
                  Keluar Sesi
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => alert("Menampilkan semua riwayat login...")}
          className="w-full text-center text-xs font-bold text-primary hover:underline pt-2"
        >
          Lihat Semua Riwayat Login
        </button>
      </section>

      {/* Hapus Akun */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="font-headline font-bold text-red-700 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Hapus Akun
          </h4>
          <p className="text-xs text-red-600 font-semibold leading-relaxed max-w-xl">
            Menghapus akun akan menghilangkan semua data pesanan, wishlist, dan profil Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-100 font-bold text-xs rounded transition whitespace-nowrap"
        >
          Hapus Akun Saya
        </button>
      </section>

    </div>
  );
}
