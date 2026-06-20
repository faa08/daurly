"use client";

import React, { useState } from "react";

export default function SellerHelpPage() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "Bagaimana cara mencairkan saldo hasil penjualan toko?",
      a: "Buka menu 'Statistik Penjualan' atau 'Dompet Toko' (jika diaktifkan), klik tombol 'Tarik Saldo', masukkan rekening bank tujuan dan nominal pencairan. Proses pencairan dana membutuhkan waktu 1-2 hari kerja bank."
    },
    {
      q: "Mengapa produk baru yang saya tambahkan statusnya 'Dalam Review'?",
      a: "Setiap produk baru yang didaftarkan oleh seller harus melewati proses verifikasi otomatis dan manual oleh tim admin untuk memastikan produk mematuhi syarat ketentuan platform (bukan barang terlarang). Review biasanya memakan waktu maksimal 24 jam."
    },
    {
      q: "Bagaimana cara menentukan jangkauan kurir pengiriman?",
      a: "Masuk ke menu 'Pengaturan Toko', pilih tab 'Kurir Pengiriman'. Centang ekspedisi lokal yang ingin Anda aktifkan (JNE, J&T, Pos Indonesia, GoSend, dll.), lalu klik 'Simpan Perubahan'."
    },
    {
      q: "Bagaimana jika pembeli meminta pengembalian barang (retur)?",
      a: "Jika pembeli mengajukan retur, Anda akan menerima notifikasi di menu 'Pesanan'. Anda dapat berdiskusi dengan pembeli melalui fitur chat untuk menyepakati solusi pengembalian dana atau tukar barang sebelum menyetujui pengajuan tersebut."
    }
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tiket Bantuan Seller Terkirim!\nSubjek: ${ticketSubject}\nPesan: ${ticketMessage}`);
    setTicketSubject("");
    setTicketMessage("");
  };

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pusat Bantuan Mitra UMKM</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Temukan jawaban atas kendala operasional toko Anda atau hubungi Customer Support Pelataran UMKM.
        </p>
      </header>

      {/* Search FAQ */}
      <section className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-on-surface">Cari Panduan Penjualan</h3>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-secondary text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Cari solusi kendala stok, penarikan dana, kurir..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-surface-container bg-[#F5F5F5] rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary font-body"
          />
        </div>
      </section>

      {/* FAQ Accordion list */}
      <section className="bg-white border border-surface-container rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="font-headline font-bold text-lg text-on-surface">Pertanyaan Umum (FAQ) Seller</h3>
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <p className="text-xs text-secondary font-medium">Tidak ada hasil FAQ yang cocok.</p>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <details key={idx} className="group border border-surface-container rounded-lg p-4 bg-surface-container-low/20 transition cursor-pointer select-none">
                <summary className="font-bold text-sm text-on-surface flex justify-between items-center outline-none list-none">
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-secondary group-open:rotate-180 transition duration-200">expand_more</span>
                </summary>
                <p className="text-xs text-secondary leading-relaxed font-medium mt-3 border-t border-surface-container pt-3">
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
        <section className="lg:col-span-2 bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-lg text-on-surface">Hubungi Customer Service</h3>
          <form onSubmit={handleSendTicket} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">Subjek Masalah</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Saldo penjualan belum masuk ke rekening bank"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-body focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">Isi Pesan Bantuan</label>
              <textarea 
                rows={4}
                required
                placeholder="Ceritakan detail kendala yang dialami toko Anda, sebutkan No. Transaksi jika berkaitan dengan pesanan..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-body focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2 bg-[#ff6f00] text-white font-bold text-xs rounded hover:brightness-95 transition"
            >
              Kirim Pesan Bantuan
            </button>
          </form>
        </section>

        {/* Contact Information */}
        <section className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-headline font-bold text-lg text-on-surface">Hubungi Kami</h3>
            <p className="text-xs text-secondary leading-relaxed font-medium">Tim customer support kami siap membantu menjawab pertanyaan operasional Anda.</p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span className="font-semibold text-on-surface">merchant-care@pelataranumkm.id</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-lg">call</span>
                <span className="font-semibold text-on-surface">+62 812-9876-5432 (WA)</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <span className="font-semibold text-secondary font-medium">Senin - Sabtu, 08:00 - 20:00 WIB</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EFF6FF] border border-orange-100 p-4 rounded-lg text-xs text-[#1E40AF] font-medium leading-relaxed mt-4">
            <strong>Tips:</strong> Cantumkan bukti screenshot error atau resi pengiriman untuk mempercepat tim kami memproses tiket bantuan Anda.
          </div>
        </section>
      </div>
    </div>
  );
}
