"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { sellerService, Seller } from "@/backend/sellerService";
import DraftResumeBanner from "@/components/admin/DraftResumeBanner";
import {
  ADMIN_DRAFT_KEYS,
  clearAdminDraft,
  hasAdminDraft,
  loadAdminDraft,
} from "@/lib/adminDrafts";

interface Store {
  id: string;
  nama: string;
  pemilik: string;
  kategori: string;
  status: "Aktif" | "Nonaktif";
  logo: string;
}

export default function AdminStoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "info" | "error" | "success" }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [newDraftAt, setNewDraftAt] = useState<number | undefined>();
  const [editDrafts, setEditDrafts] = useState<{ id: string; name: string; savedAt: number }[]>([]);

  const formatSellers = (data: Seller[]): Store[] =>
    data.map((s) => ({
      id: s.id_seller,
      nama: s.nm_store,
      pemilik: s.users?.nama_lengkap || "Tanpa Nama",
      kategori: "Daur Ulang Lokal",
      status: s.is_verified ? "Aktif" : "Nonaktif",
      logo: s.logo_toko || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
    }));

  const refreshDraftBanners = (sellerList: Seller[]) => {
    if (hasAdminDraft(ADMIN_DRAFT_KEYS.storeNew)) {
      const d = loadAdminDraft<{ name?: string }>(ADMIN_DRAFT_KEYS.storeNew);
      setNewDraftAt(d?.savedAt);
    } else {
      setNewDraftAt(undefined);
    }

    const edits: { id: string; name: string; savedAt: number }[] = [];
    for (const s of sellerList) {
      const key = ADMIN_DRAFT_KEYS.storeEdit(s.id_seller);
      if (hasAdminDraft(key)) {
        const d = loadAdminDraft<{ name?: string }>(key);
        if (d?.savedAt) {
          edits.push({
            id: s.id_seller,
            name: d.name?.trim() || s.nm_store,
            savedAt: d.savedAt,
          });
        }
      }
    }
    setEditDrafts(edits);
  };

  const showToast = (message: string, type: "info" | "error" | "success" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await sellerService.getSellers();
      setStores(formatSellers(data));
      refreshDraftBanners(data);
    } catch (error) {
      console.error("Gagal memuat data toko:", error);
      showToast("Gagal memuat data toko.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteStore = async (id: string, name: string) => {
    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus toko "${name}"?\n\nSemua produk yang terkait dengan toko ini akan ikut terhapus permanen.`
    );
    if (!confirmed) return;

    const success = await sellerService.deleteSeller(id);
    if (success) {
      clearAdminDraft(ADMIN_DRAFT_KEYS.storeEdit(id));
      setStores((prev) => prev.filter((s) => s.id !== id));
      showToast(`Toko ${name} dan seluruh produknya berhasil dihapus.`, "success");
      refreshDraftBanners([]);
    } else {
      showToast(`Gagal menghapus toko ${name}.`, "error");
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStores = stores.length;
  const activeStoresCount = stores.filter((s) => s.status === "Aktif").length;
  const inactiveStoresCount = stores.filter((s) => s.status === "Nonaktif").length;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Manajemen Toko</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Kelola dan awasi seluruh ekosistem pedagang Daur Ulang Anda.
        </p>
      </header>

      {newDraftAt !== undefined && (
        <DraftResumeBanner
          href="/admin/stores/new"
          label="tambah toko"
          savedAt={newDraftAt}
          onDiscard={() => {
            clearAdminDraft(ADMIN_DRAFT_KEYS.storeNew);
            setNewDraftAt(undefined);
          }}
        />
      )}

      {editDrafts.map((d) => (
        <DraftResumeBanner
          key={d.id}
          href={`/admin/stores/${d.id}/edit`}
          label={`edit toko "${d.name}"`}
          savedAt={d.savedAt}
          onDiscard={() => {
            clearAdminDraft(ADMIN_DRAFT_KEYS.storeEdit(d.id));
            setEditDrafts((prev) => prev.filter((x) => x.id !== d.id));
          }}
        />
      ))}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Total Toko</p>
            <h3 className="font-headline text-3xl font-extrabold text-primary">{totalStores}</h3>
            <p className="text-xs text-[#3E3834] font-semibold">Toko terdaftar di sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">store</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Toko Aktif</p>
            <h3 className="font-headline text-3xl font-extrabold text-on-surface">{activeStoresCount}</h3>
            <p className="text-xs text-[#3E3834] font-semibold">Sedang beroperasi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Toko Nonaktif</p>
            <h3 className="font-headline text-3xl font-extrabold text-error">{inactiveStoresCount}</h3>
            <p className="text-xs text-error font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">pause_circle</span> Tidak ditampilkan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
            <span className="material-symbols-outlined font-bold">block</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3E3834]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama toko, pemilik, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded border border-[#D5CFC9] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition font-body text-body-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-[#F5F3F0] text-[#3E3834] font-semibold text-sm rounded-lg hover:bg-[#EBE8E4] transition">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          <Link
            href="/admin/stores/new"
            className="flex items-center gap-2 px-4 py-3 bg-[#16A34A] hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Toko Baru
          </Link>
        </div>
      </section>

      <section className="bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[#1F1B18]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nama Toko</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Pemilik</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0]">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F5F3F0]"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-[#F5F3F0] rounded w-28"></div>
                          <div className="h-2 bg-[#F5F3F0] rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6"><div className="h-3 bg-[#F5F3F0] rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-5 bg-[#F5F3F0] rounded-full w-14"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-[#F5F3F0] rounded w-16"></div></td>
                    <td className="px-6 py-6 text-right"><div className="w-24 h-6 bg-[#F5F3F0] rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-[#3E3834]">storefront</span>
                      <h5 className="font-headline font-bold text-sm text-[#1F1B18]">Belum Ada Toko Terdaftar</h5>
                      <p className="text-xs text-[#3E3834] max-w-sm">
                        Database merchant kosong. Tambahkan toko baru untuk memulai.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-surface-container-low/30 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F5F3F0] overflow-hidden">
                          <img src={store.logo} alt={store.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition">
                            {store.nama}
                          </p>
                          <p className="text-[10px] text-[#3E3834]">ID: {store.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">{store.pemilik}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-surface-container text-[#3E3834] rounded-full text-xs font-semibold">
                        {store.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-bold ${
                          store.status === "Aktif" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            store.status === "Aktif" ? "bg-green-600" : "bg-red-600"
                          }`}
                        ></span>
                        {store.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/stores/${store.id}/edit`}
                          className="p-2 hover:bg-surface-container text-[#3E3834] rounded transition"
                          title="Edit Toko"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteStore(store.id, store.nama)}
                          className="p-2 hover:bg-error-container/30 text-error rounded transition"
                          title="Hapus Toko"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-surface-container-low/40 flex items-center justify-between text-xs font-semibold text-[#3E3834]">
          <p>
            {isLoading
              ? "Memuat data..."
              : `Menampilkan 1-${filteredStores.length} dari ${stores.length} toko`}
          </p>
        </div>
      </section>

      <div className="fixed bottom-8 right-8 flex flex-col gap-3 pointer-events-none z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-surface-container-high p-4 rounded-xl shadow-lg flex items-center gap-3 wrapper"
          >
            <span
              className={`material-symbols-outlined ${
                toast.type === "error" ? "text-error" : toast.type === "success" ? "text-green-600" : "text-primary"
              }`}
            >
              {toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "info"}
            </span>
            <span className="font-body text-xs font-medium text-on-surface">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
