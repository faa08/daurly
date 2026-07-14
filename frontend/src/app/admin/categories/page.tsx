"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/backend/supabase";
import { apiFetch } from "@/lib/api-client";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    if (isPlaceholder()) {
      setCategories([
        { id_kategori: "cat-1", nama_kategori: "Fashion Pria", created_at: new Date().toISOString() },
        { id_kategori: "cat-2", nama_kategori: "Tekstil", created_at: new Date().toISOString() },
        { id_kategori: "cat-3", nama_kategori: "Aksesoris", created_at: new Date().toISOString() },
        { id_kategori: "cat-4", nama_kategori: "Kuliner", created_at: new Date().toISOString() },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kategori")
        .select("*")
        .order("nama_kategori", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("fetchCategories failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (isPlaceholder()) {
      const newCat = {
        id_kategori: `cat-${Date.now()}`,
        nama_kategori: newCatName.trim(),
        created_at: new Date().toISOString()
      };
      setCategories([...categories, newCat].sort((a,b) => a.nama_kategori.localeCompare(b.nama_kategori)));
      setNewCatName("");
      setShowAddForm(false);
      alert("Kategori baru ditambahkan (Mode Uji Coba)!");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", name: newCatName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah kategori");

      alert("Kategori berhasil ditambahkan!");
      setNewCatName("");
      setShowAddForm(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menambah kategori");
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    if (isPlaceholder()) {
      setCategories(
        categories.map((c) =>
          c.id_kategori === id ? { ...c, nama_kategori: editingName.trim() } : c
        ).sort((a,b) => a.nama_kategori.localeCompare(b.nama_kategori))
      );
      setEditingId(null);
      alert("Kategori berhasil diperbarui (Mode Uji Coba)!");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", id, name: editingName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui kategori");

      alert("Kategori berhasil diperbarui!");
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal memperbarui kategori");
    }
  };

  const handleArchive = async (id: string, name: string) => {
    const ok = window.confirm(`Apakah Anda yakin ingin mengarsipkan kategori "${name}"?`);
    if (!ok) return;

    if (isPlaceholder()) {
      setCategories(categories.map((c) => c.id_kategori === id ? { ...c, is_active: false } : c));
      alert("Kategori berhasil diarsipkan (Mode Uji Coba)!");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengarsipkan kategori");

      alert("Kategori berhasil diarsipkan!");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal mengarsipkan kategori");
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (isPlaceholder()) {
      setCategories(categories.map((c) => c.id_kategori === id ? { ...c, is_active: true } : c));
      alert("Kategori berhasil diaktifkan kembali (Mode Uji Coba)!");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengaktifkan kategori");

      alert("Kategori berhasil diaktifkan kembali!");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal mengaktifkan kategori");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(`Apakah Anda yakin ingin menghapus permanen kategori "${name}"?`);
    if (!ok) return;

    if (isPlaceholder()) {
      setCategories(categories.filter((c) => c.id_kategori !== id));
      alert("Kategori berhasil dihapus (Mode Uji Coba)!");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus kategori");

      alert("Kategori berhasil dihapus!");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menghapus kategori");
    }
  };

  const handleInitDefaultCategories = async () => {
    const defaults = ["Fashion Pria", "Tekstil", "Aksesoris", "Kuliner"];
    if (isPlaceholder()) {
      const mock = defaults.map((name, i) => ({
        id_kategori: `cat-${i + 1}`,
        nama_kategori: name,
        created_at: new Date().toISOString()
      }));
      setCategories(mock);
      alert("Kategori bawaan berhasil diinisialisasi (Mode Uji Coba)!");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal inisialisasi kategori");

      alert("4 Kategori bawaan berhasil diinisialisasi di database Supabase!");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal inisialisasi kategori");
      setLoading(false);
    }
  };

  // Helper to slugify category names for display/slug column
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Kategori Produk</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Kelola klasifikasi kategori produk yang terintegrasi secara real-time untuk pembeli dan penjual.
        </p>
      </header>

      {/* Main Table Card */}
      <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <div className="flex justify-between items-center border-b border-[#F5F3F0] pb-4">
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">Daftar Kategori</h3>
            <p className="font-body text-xs text-[#3E3834] mt-0.5">
              Tambah, edit, dan hapus kategori produk dengan proteksi integritas relasi produk.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {categories.length === 0 && !loading && (
              <button
                type="button"
                onClick={handleInitDefaultCategories}
                className="px-4 py-2 border-2 border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4] font-bold text-xs rounded-lg transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Inisialisasi Kategori Bawaan
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-lg hover:bg-zinc-700 transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {showAddForm ? "Batal" : "Tambah Kategori"}
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-[#FCFCFA] border border-surface-container p-6 rounded-xl flex flex-col md:flex-row gap-4 items-end text-xs">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Nama Kategori Baru</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kuliner Nusantara"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-semibold"
              />
            </div>
            <div className="w-full md:w-auto">
              <button
                type="submit"
                className="w-full h-[38px] px-6 bg-[#1F1B18] text-white font-bold text-xs rounded hover:bg-[#3E3834] transition"
              >
                Simpan Kategori
              </button>
            </div>
          </form>
        )}

        {/* Categories Table */}
        <div className="overflow-x-auto border border-surface-container rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#F5F3F0] font-bold text-[#3E3834] uppercase tracking-wider">
                <th className="px-6 py-4">Nama Kategori</th>
                <th className="px-6 py-4">Slug URL</th>
                <th className="px-6 py-4">ID Kategori</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0] font-semibold text-[#1F1B18]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8E8680]">
                    Memuat data kategori...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8E8680]">
                    Belum ada kategori terdaftar. Silakan tambah kategori baru.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const isEditing = editingId === cat.id_kategori;
                  return (
                    <tr key={cat.id_kategori} className="hover:bg-surface-container-low/20 transition">
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-1.5 border border-surface-container rounded text-xs focus:outline-none focus:border-primary font-bold"
                          />
                        ) : (
                          cat.nama_kategori
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary font-mono text-[11px]">
                        /kategori/{slugify(isEditing ? editingName : cat.nama_kategori)}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-[#8E8680] truncate max-w-[120px]" title={cat.id_kategori}>
                        {cat.id_kategori}
                      </td>
                      <td className="px-6 py-4 text-[#8E8680]">
                        {new Date(cat.created_at || "2026-07-04").toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {cat.is_active === false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            Diarsipkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#D2E3FC]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(cat.id_kategori)}
                                className="text-green-600 hover:text-green-800 transition p-1 hover:bg-green-50 rounded"
                                title="Simpan Perubahan"
                              >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                                title="Batal"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat.id_kategori, cat.nama_kategori)}
                                className="text-[#8E8680] hover:text-[#16A34A] transition p-1 hover:bg-[#F5F3F0] rounded"
                                title="Ubah Nama"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              {cat.is_active === false ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRestore(cat.id_kategori, cat.nama_kategori)}
                                    className="text-[#8E8680] hover:text-green-600 transition p-1 hover:bg-[#F5F3F0] rounded"
                                    title="Aktifkan Kembali Kategori"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">unarchive</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(cat.id_kategori, cat.nama_kategori)}
                                    className="text-[#8E8680] hover:text-red-600 transition p-1 hover:bg-[#F5F3F0] rounded"
                                    title="Hapus Kategori"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleArchive(cat.id_kategori, cat.nama_kategori)}
                                  className="text-[#8E8680] hover:text-amber-600 transition p-1 hover:bg-[#F5F3F0] rounded"
                                  title="Arsipkan Kategori"
                                >
                                  <span className="material-symbols-outlined text-[18px]">archive</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
