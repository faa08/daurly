"use client";

import React, { useState, useEffect } from "react";
import { systemSettingsService } from "@/backend/systemSettingsService";
import { Loader2, Construction, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminMaintenancePage() {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const val = await systemSettingsService.getMaintenanceMode();
        setMaintenance(val);
      } catch (err) {
        console.error("Gagal memuat status maintenance:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    const targetValue = !maintenance;
    try {
      const ok = await systemSettingsService.setMaintenanceMode(targetValue);
      if (ok) {
        setMaintenance(targetValue);
        alert(
          targetValue
            ? "Mode pemeliharaan berhasil diaktifkan. Akses publik ke website sekarang ditutup."
            : "Mode pemeliharaan berhasil dinonaktifkan. Website sekarang kembali aktif publik."
        );
      } else {
        alert("Gagal mengubah mode pemeliharaan. Coba lagi atau periksa koneksi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat memperbarui status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm font-semibold text-[#8E8680] gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#16A34A]" />
        Memuat status mode pemeliharaan...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Mode Pemeliharaan (Maintenance)</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Kendalikan aksesibilitas publik untuk seluruh platform Daurly selama pembaruan sistem berlangsung.
        </p>
      </header>

      {/* Main Control Card */}
      <div className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F5F3F0] pb-6 gap-4">
          <div className="space-y-1">
            <h3 className="font-headline font-bold text-lg text-[#1F1B18]">Status Pemeliharaan</h3>
            <p className="text-xs text-[#5C5550]">
              Aktifkan untuk memblokir kunjungan pembeli & penjual biasa, menyisakan akses hanya untuk admin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              maintenance 
                ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]" 
                : "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
            }`}>
              {maintenance ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Sedang Aktif (Maintenance Mode)</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Situs Online (Normal Mode)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informational Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          <div className="bg-[#FAF9F6] border border-[#EAE5E0] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#E8600A]">
              <Construction className="w-5 h-5" />
              <span className="text-sm font-bold font-headline">Jika Diaktifkan (ON)</span>
            </div>
            <ul className="text-xs text-[#5C5550] space-y-2 list-disc list-inside leading-relaxed">
              <li>Pengunjung umum dan pembeli akan dialihkan ke halaman pemeliharaan.</li>
              <li>Penjual (seller) tidak dapat mengelola toko atau mengakses halaman penjual.</li>
              <li>
                <strong>Admin</strong> tetap dapat mengakses dashboard admin untuk monitoring atau mematikan maintenance.
              </li>
              <li>Logo platform dan keterangan perbaikan akan ditampilkan secara rapi.</li>
            </ul>
          </div>

          <div className="bg-[#FAF9F6] border border-[#EAE5E0] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#16A34A]">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-bold font-headline">Keamanan & Persistensi</span>
            </div>
            <p className="text-xs text-[#5C5550] leading-relaxed">
              Pengaturan ini disimpan langsung ke dalam database utama secara real-time. Jika Anda mengaktifkannya, pastikan untuk mematikannya kembali setelah proses perbaikan fitur selesai agar Toko Daur Ulang dapat berjualan kembali secara normal.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end border-t border-[#F5F3F0] pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={handleToggle}
            className={`px-6 py-3 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-md ${
              maintenance
                ? "bg-[#16A34A] hover:bg-[#15803D] text-white"
                : "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : maintenance ? (
              <span>Matikan Mode Pemeliharaan</span>
            ) : (
              <span>Nyalain Mode Pemeliharaan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
