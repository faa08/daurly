"use client";

import React, { useState, useEffect } from "react";
import { authService } from "@/backend/authService";
import { supabase } from "@/backend/supabase";
import { apiFetch } from "@/lib/api-client";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function CustomerSecurityPage() {
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
  }, []);

  const handleDeleteAccount = () => {
    setDeleteConfirmText("");
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") return;
    if (!user) return;
    setDeleteLoading(true);

    try {
      if (!isPlaceholder()) {
        const res = await apiFetch("/api/auth/delete-account", {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Gagal menghapus akun.");
        }
      }
      authService.logout();
      window.location.href = "/";
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menghapus akun. Coba lagi.");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const maskedEmail = user?.email
    ? user.email.replace(/^(.{1})(.*)(@.*)$/, (_, f, m, d) => `${f}.${"*".repeat(8)}${d}`)
    : "–";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Keamanan Akun</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Lindungi akun Anda dengan mengatur keamanan tambahan dan memperbarui kata sandi secara berkala.
        </p>
      </header>

      {/* Verifikasi Kontak */}
      <section className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">verified_user</span>
          Verifikasi Kontak
        </h3>

        <div className="space-y-3 text-xs font-body">
          {/* Email */}
          <div className="flex justify-between items-center py-1">
            <div>
              <p className="font-bold text-secondary">Email</p>
              <p className="font-semibold text-on-surface">{maskedEmail}</p>
            </div>
            <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded">
              Terverifikasi
            </span>
          </div>
        </div>
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

      {/* Modal Hapus Akun */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left border border-surface-container">
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline font-bold text-lg">Hapus Akun Permanen</h3>
            </div>
            
            <p className="text-xs text-[#5C5550] font-semibold leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Semua data pesanan, transaksi, wishlist, dan biodata profil Anda akan dihapus secara permanen dari sistem Pelataran UMKM.
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                Ketik <span className="text-red-600 font-extrabold">HAPUS</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-3 py-2 border border-surface-container rounded text-sm focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 border border-surface-container text-[#5C5550] font-bold rounded-lg hover:bg-surface-container transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                disabled={deleteConfirmText !== "HAPUS" || deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus Permanen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
