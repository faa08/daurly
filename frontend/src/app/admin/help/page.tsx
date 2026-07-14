"use client";

import React, { useState } from "react";
import { authService } from "@/backend/authService";
import { supportService } from "@/backend/supportService";

export default function AdminHelpPage() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "Bagaimana cara melakukan verifikasi toko secara manual?",
      a: "Buka menu 'Verifikasi Toko' di sidebar, pilih toko yang berstatus 'Pending', periksa kesesuaian Nomor Induk Berusaha (NIB) dengan dokumen yang diunggah, lalu klik tombol 'Setujui' atau 'Tolak'."
    },
    {
      q: "Bagaimana cara memblokir toko yang melanggar aturan?",
      a: "Buka menu 'Manajemen Toko', cari nama toko yang bersangkutan, klik ikon opsi/aksi, lalu pilih 'Blokir Toko'. Toko yang diblokir tidak akan bisa menjual produknya lagi sampai blokir dibuka."
    },
    {
      q: "Di mana saya bisa melihat seluruh log aktivitas sistem?",
      a: "Log aktivitas sistem dapat dilihat pada bagian bawah 'Pengaturan Sistem' di tab Log Keamanan, atau dengan mengakses file ekspor log mingguan di dashboard utama."
    }
  ];

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    const userId = user ? user.id_user : null;
    const success = await supportService.createSupportTicket(userId, ticketSubject, ticketMessage);
    if (success) {
      alert("Tiket Bantuan Admin Berhasil Terkirim!");
      setTicketSubject("");
      setTicketMessage("");
    } else {
      alert("Gagal mengirim tiket bantuan. Silakan coba lagi.");
    }
  };

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pusat Bantuan Superadmin</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Dapatkan panduan operasional sistem dan hubungi tim teknis developer Daurly.
        </p>
      </header>

      {/* Search FAQ */}
      <section className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
        <h3 className="font-headline font-bold text-lg text-on-surface">Cari Panduan Operasional</h3>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-[#3E3834] text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Ketik kata kunci pertanyaan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-surface-container bg-[#F5F5F5] rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary font-body"
          />
        </div>
      </section>

      {/* FAQ Accordion list */}
      <section className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 space-y-4">
        <h3 className="font-headline font-bold text-lg text-on-surface">Pertanyaan Umum (FAQ) Admin</h3>
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <p className="text-xs text-[#3E3834] font-medium">Tidak ada hasil FAQ yang cocok.</p>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <details key={idx} className="group rounded-lg p-4 bg-surface-container-low/20 hover:bg-surface-container-low/40 transition cursor-pointer select-none">
                <summary className="font-bold text-sm text-on-surface flex justify-between items-center outline-none list-none">
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[#3E3834] group-open:rotate-180 transition duration-200">expand_more</span>
                </summary>
                <p className="text-xs text-[#3E3834] leading-relaxed font-medium mt-3 border-t border-[#F5F3F0] pt-3">
                  {faq.a}
                </p>
              </details>
            ))
          )}
        </div>
      </section>

      {/* Contact technical support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Form */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
          <h3 className="font-headline font-bold text-lg text-on-surface">Kirim Tiket ke Technical Support</h3>
          <form onSubmit={handleSendTicket} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">Subjek Masalah</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Gagal koneksi database payment gateway"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-body focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">Deskripsi Masalah</label>
              <textarea 
                rows={4}
                required
                placeholder="Jelaskan kendala teknis secara rinci di sini..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-body focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
            >
              Kirim Tiket Bantuan
            </button>
          </form>
        </section>

        {/* Contact Information */}
        <section className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-headline font-bold text-lg text-on-surface">Kontak Developer</h3>
            <p className="text-xs text-[#3E3834] leading-relaxed font-medium">Hubungi hotline developer jika terjadi kendala sistem kritis/down.</p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span className="font-semibold text-on-surface">linkproductive@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-lg">support_agent</span>
                <span className="font-semibold text-on-surface">Chat Admin (widget CS di pojok kanan bawah)</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <span className="font-semibold text-[#3E3834] font-medium">Senin - Jumat, 09:00 - 17:00 WIB</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F0FDF4] p-4 rounded-lg text-xs text-[#15803D] font-medium leading-relaxed mt-4">
            <strong>Catatan Keamanan:</strong> Jangan pernah membagikan kata sandi root server atau API private key kepada siapapun.
          </div>
        </section>
      </div>
    </div>
  );
}
