"use client";

import React, { useState, useEffect } from "react";

interface VerificationStore {
  id: string;
  name: string;
  owner: string;
  nib: string; // Nomor telepon atau NIB jika ada kolum baru
  category: string;
  dateApplied: string;
  documentName: string;
  status: "Pending" | "Disetujui" | "Ditolak";
}

export default function AdminVerificationPage() {
  const [stores, setStores] = useState<VerificationStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Pending" | "Disetujui" | "Ditolak">("Semua");

  // Simulation loading data from Database
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mocking empty state initially
      setStores([]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  /* 
    ==========================================================================
    BACKEND INTEGRATION GUIDE (SUPABASE)
    ==========================================================================
    Untuk menyambungkan dengan Supabase (tabel seller + users), gunakan query berikut:

    import { createClient } from "@supabase/supabase-js";
    const supabase = createClient("SUPABASE_URL", "SUPABASE_ANON_KEY");

    const fetchVerificationQueue = async () => {
      try {
        setIsLoading(true);
        // Mengambil data pendaftaran toko baru (seller belum diverifikasi)
        const { data, error } = await supabase
          .from("seller")
          .select(`
            id_seller,
            nm_store,
            created_at,
            img_ktp,
            no_telp,
            users (
              nama_lengkap
            )
          `)
          .eq("is_verified", false);

        if (error) throw error;

        // Transformasi format data ke state frontend
        const formatted: VerificationStore[] = (data || []).map((s: any) => ({
          id: s.id_seller,
          name: s.nm_store,
          owner: s.users?.nama_lengkap || "Tanpa Nama",
          nib: s.no_telp || "-", // Menampilkan telepon sebagai kontak/legalitas di UI
          category: "UMKM Lokal",
          dateApplied: new Date(s.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }),
          documentName: s.img_ktp || "KTP_Dokumen.jpg",
          status: "Pending" // Karena belum terverifikasi
        }));

        setStores(formatted);
      } catch (err) {
        console.error("Gagal mengambil antrian verifikasi:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Fungsi Aksi Persetujuan (Approve/Reject)
    const handleApproveReject = async (id: string, isApprove: boolean) => {
      try {
        const { error } = await supabase
          .from("seller")
          .update({ is_verified: isApprove })
          .eq("id_seller", id);

        if (error) throw error;
        
        // Refresh data setelah update
        alert(`Toko berhasil ${isApprove ? "disetujui" : "ditolak"}`);
        // fetchVerificationQueue();
      } catch (err) {
        console.error("Gagal memproses verifikasi:", err);
      }
    };
  */

  const totalPending = stores.filter(s => s.status === "Pending").length;
  const totalApproved = stores.filter(s => s.status === "Disetujui").length;
  const totalRejected = stores.filter(s => s.status === "Ditolak").length;

  const handleAction = (id: string, approve: boolean) => {
    setStores(prev => 
      prev.map(store => {
        if (store.id === id) {
          return { ...store, status: approve ? "Disetujui" : "Ditolak" };
        }
        return store;
      })
    );
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || store.owner.toLowerCase().includes(searchTerm.toLowerCase()) || store.nib.includes(searchTerm);
    const matchesStatus = statusFilter === "Semua" || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Verifikasi Pendaftaran Toko</h2>
          <p className="font-body text-body-md text-[#3E3834] mt-1">
            Review dokumen legalitas NIB (Nomor Induk Berusaha) / KTP UMKM baru untuk menyetujui pembukaan toko mereka di Pelataran UMKM.
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Menunggu Verifikasi</p>
            <h3 className="font-headline text-lg font-extrabold text-red-600">{totalPending} Toko</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-xl font-bold">hourglass_empty</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Telah Disetujui</p>
            <h3 className="font-headline text-lg font-extrabold text-green-700">{totalApproved} Toko</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
            <span className="material-symbols-outlined text-xl font-bold">check_circle</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Telah Ditolak</p>
            <h3 className="font-headline text-lg font-extrabold text-[#5C5550]">{totalRejected} Toko</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-[#5C5550]">
            <span className="material-symbols-outlined text-xl font-bold">cancel</span>
          </div>
        </div>
      </section>

      {/* Controls Container */}
      <section className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="w-full md:max-w-sm relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-[#3E3834] text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Cari toko, nama pemilik..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-[#D5CFC9] bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary font-body"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(["Semua", "Pending", "Disetujui", "Ditolak"] as const).map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition select-none whitespace-nowrap ${
                  statusFilter === status 
                    ? "bg-[#1D4ED8] text-white" 
                    : "bg-[#F5F3F0] text-[#3E3834] hover:bg-[#EBE8E4]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Queue List Table */}
        <div className="overflow-x-auto rounded-lg bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#F5F3F0] text-[#1F1B18] font-bold text-xs uppercase">
                <th className="px-6 py-4">Toko / Pemilik</th>
                <th className="px-6 py-4">Kontak / NIB</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal Pengajuan</th>
                <th className="px-6 py-4">Dokumen Pendukung</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0]">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-[#F5F3F0] rounded w-2/3"></div>
                        <div className="h-3 bg-[#F5F3F0] rounded w-1/2"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-[#F5F3F0] rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F3F0] rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-[#F5F3F0] rounded w-12 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-[#F5F3F0] rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredStores.length === 0 ? (
                // Beautiful Empty State
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-[#3E3834]">fact_check</span>
                      <h5 className="font-headline font-bold text-sm text-[#1F1B18]">Belum Ada Pengajuan Verifikasi</h5>
                      <p className="text-xs text-[#3E3834] max-w-sm">
                        Antrian verifikasi kosong. Pengajuan pendaftaran toko baru dari penjual (seller) akan muncul di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-surface-container-low/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm text-on-surface">{store.name}</p>
                        <p className="text-[10px] text-[#3E3834] font-semibold">Owner: {store.owner}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-on-surface">{store.nib}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#3E3834]">{store.category}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#3E3834]">{store.dateApplied}</td>
                    <td className="px-6 py-4 text-xs">
                      <button 
                        onClick={() => alert(`Membuka dokumen legalitas: ${store.documentName}`)}
                        className="text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">image</span>
                        Dokumen_Bukti.jpg
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        store.status === "Pending" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : store.status === "Disetujui" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {store.status}
                      </span>
                    </td>
                    
                    {/* Action buttons */}
                    <td className="px-6 py-4">
                      {store.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleAction(store.id, true)}
                            className="bg-green-600 text-white font-bold text-[10px] px-3 py-1 rounded hover:brightness-95 transition"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => handleAction(store.id, false)}
                            className="bg-zinc-800 text-white font-bold text-[10px] px-3 py-1 rounded hover:bg-zinc-700 transition"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <p className="text-center text-[10px] font-bold text-[#5C5550] tracking-wider">
                          SELESAI
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
