"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/backend/supabase";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function AdminCouponsPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discount_type: "percentage",
    value: "",
    max_discount: "",
    min_purchase: "",
    is_active: true
  });

  const fetchVouchers = async () => {
    if (isPlaceholder()) return;
    setLoadingVouchers(true);
    try {
      const { data, error } = await supabase
        .from("voucher")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setVouchers(data || []);
    } catch (err) {
      console.error("fetchVouchers failed:", err);
    } finally {
      setLoadingVouchers(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlaceholder()) {
      alert("Database placeholder aktif. Konfigurasi tidak dapat disimpan.");
      return;
    }
    if (!newVoucher.code.trim() || !newVoucher.value) return;

    try {
      const payload = {
        code: newVoucher.code.trim().toUpperCase(),
        discount_type: newVoucher.discount_type,
        value: Number(newVoucher.value),
        max_discount: newVoucher.max_discount ? Number(newVoucher.max_discount) : 0,
        min_purchase: newVoucher.min_purchase ? Number(newVoucher.min_purchase) : 0,
        is_active: newVoucher.is_active,
      };

      const { error } = await supabase.from("voucher").insert(payload);
      if (error) throw error;

      alert("Voucher berhasil ditambahkan!");
      setShowAddForm(false);
      setNewVoucher({ code: "", discount_type: "percentage", value: "", max_discount: "", min_purchase: "", is_active: true });
      fetchVouchers();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menambah voucher: ${err.message}`);
    }
  };

  const handleToggleVoucher = async (id: string, currentStatus: boolean) => {
    if (isPlaceholder()) return;
    try {
      const { error } = await supabase
        .from("voucher")
        .update({ is_active: !currentStatus })
        .eq("id_voucher", id);
      if (error) throw error;
      fetchVouchers();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal merubah status: ${err.message}`);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (isPlaceholder()) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus voucher ini?");
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("voucher")
        .delete()
        .eq("id_voucher", id);
      if (error) throw error;
      fetchVouchers();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menghapus voucher: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Kupon & Diskon</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Manajemen voucher promosi, potongan harga, dan kupon belanja platform Daurly.
        </p>
      </header>

      {/* Main Section */}
      <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <div className="flex justify-between items-center border-b border-[#F5F3F0] pb-4">
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">Daftar Kupon & Voucher</h3>
            <p className="font-body text-xs text-[#3E3834] mt-0.5">
              Buat, edit, dan nonaktifkan kupon diskon untuk transaksi pembeli.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-lg hover:bg-zinc-700 transition flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            {showAddForm ? "Batal" : "Tambah Voucher"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-[#FCFCFA] border border-surface-container p-6 rounded-xl space-y-4 text-xs">
            <h4 className="font-headline font-bold text-sm text-on-surface">Tambah Voucher Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kode Voucher</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MERDEKA10"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary uppercase font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Tipe Diskon</label>
                <select
                  value={newVoucher.discount_type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_type: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-semibold"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                  Nilai Diskon ({newVoucher.discount_type === "percentage" ? "%" : "Rp"})
                </label>
                <input
                  type="number"
                  required
                  placeholder={newVoucher.discount_type === "percentage" ? "10" : "50000"}
                  value={newVoucher.value}
                  onChange={(e) => setNewVoucher({ ...newVoucher, value: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Min. Pembelian (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newVoucher.min_purchase}
                  onChange={(e) => setNewVoucher({ ...newVoucher, min_purchase: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                  Maks. Diskon (Rp, Opsional)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  disabled={newVoucher.discount_type === "fixed"}
                  value={newVoucher.max_discount}
                  onChange={(e) => setNewVoucher({ ...newVoucher, max_discount: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-bold disabled:opacity-50"
                />
              </div>
              <div className="flex items-end pb-1">
                <button
                  type="button"
                  onClick={handleAddVoucher}
                  className="w-full h-[38px] bg-[#1F1B18] text-white font-bold text-xs rounded hover:bg-[#3E3834] transition"
                >
                  Simpan Voucher
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border border-surface-container rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#F5F3F0] font-bold text-[#3E3834] uppercase tracking-wider">
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Nilai</th>
                <th className="px-6 py-4">Min. Belanja</th>
                <th className="px-6 py-4">Maks. Potongan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0] font-semibold text-[#1F1B18]">
              {loadingVouchers ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#8E8680]">
                    Memuat data kupon...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#8E8680]">
                    Belum ada kupon aktif. Klik &quot;Tambah Voucher&quot; di atas.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id_voucher} className="hover:bg-surface-container-low/20 transition">
                    <td className="px-6 py-4 font-bold text-blue-600 text-sm uppercase">{v.code}</td>
                    <td className="px-6 py-4 capitalize">{v.discount_type === "percentage" ? "Persentase" : "Nominal Tetap"}</td>
                    <td className="px-6 py-4 font-bold">
                      {v.discount_type === "percentage" ? `${v.value}%` : `Rp ${Number(v.value).toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-6 py-4">Rp {Number(v.min_purchase).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">
                      {v.discount_type === "fixed" ? "-" : Number(v.max_discount) > 0 ? `Rp ${Number(v.max_discount).toLocaleString("id-ID")}` : "Tanpa Batas"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVoucher(v.id_voucher, v.is_active)}
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border transition ${
                          v.is_active
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {v.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteVoucher(v.id_voucher)}
                        className="text-[#8E8680] hover:text-red-600 transition p-1 hover:bg-[#F5F3F0] rounded"
                        title="Hapus Voucher"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
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
