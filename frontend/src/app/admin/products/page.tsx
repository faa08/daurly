"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { sellerService, Seller } from "@/backend/sellerService";
import { productService, Product } from "@/backend/productService";
import { parseProductImg } from "@/lib/productUi";
import DraftResumeBanner from "@/components/admin/DraftResumeBanner";
import {
  ADMIN_DRAFT_KEYS,
  clearAdminDraft,
  hasAdminDraft,
  loadAdminDraft,
} from "@/lib/adminDrafts";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<{ id_kategori: string; nama_kategori: string }[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedSellerFilter, setSelectedSellerFilter] = useState("");

  const [showNewDraftBanner, setShowNewDraftBanner] = useState(false);
  const [newDraftSavedAt, setNewDraftSavedAt] = useState<number | undefined>();
  const [editDrafts, setEditDrafts] = useState<{ id: string; name: string; savedAt: number }[]>([]);

  const refreshDraftBanners = (productList: Product[]) => {
    if (hasAdminDraft(ADMIN_DRAFT_KEYS.productNew)) {
      const draft = loadAdminDraft<{ productName?: string }>(ADMIN_DRAFT_KEYS.productNew);
      setShowNewDraftBanner(true);
      setNewDraftSavedAt(draft?.savedAt);
    } else {
      setShowNewDraftBanner(false);
      setNewDraftSavedAt(undefined);
    }

    const edits: { id: string; name: string; savedAt: number }[] = [];
    for (const p of productList) {
      const key = ADMIN_DRAFT_KEYS.productEdit(p.id_produk);
      if (hasAdminDraft(key)) {
        const draft = loadAdminDraft<{ productName?: string }>(key);
        if (draft?.savedAt) {
          edits.push({
            id: p.id_produk,
            name: draft.productName?.trim() || p.nama_produk,
            savedAt: draft.savedAt,
          });
        }
      }
    }
    setEditDrafts(edits);
  };

  const loadData = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/masuk");
      return;
    }

    const allProducts = await productService.getProducts({ limit: 500, includeImages: true });
    setProducts(allProducts);
    refreshDraftBanners(allProducts);

    const allCategories = await productService.getCategories();
    setCategories(allCategories);

    const allSellers = await sellerService.getSellers();
    setSellers(allSellers);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (hasAdminDraft(ADMIN_DRAFT_KEYS.productNew)) {
      const draft = loadAdminDraft<{ productName?: string }>(ADMIN_DRAFT_KEYS.productNew);
      setShowNewDraftBanner(true);
      setNewDraftSavedAt(draft?.savedAt);
    }
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${name}?`)) {
      const success = await productService.deleteProduct(id);
      if (success) {
        alert(`Produk ${name} berhasil dihapus!`);
        loadData();
      } else {
        alert("Gagal menghapus produk.");
      }
    }
  };

  const getSellerName = (sellerId: string) => {
    const s = sellers.find((item) => item.id_seller === sellerId);
    return s ? s.nm_store : "Toko Tidak Diketahui";
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nama_brand && p.nama_brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.kode_produk && p.kode_produk.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === "" || p.category === selectedCategoryFilter;
    const matchesSeller = selectedSellerFilter === "" || p.id_seller === selectedSellerFilter;

    return matchesSearch && matchesCategory && matchesSeller;
  });

  return (
    <div className="space-y-8 relative">
      {showNewDraftBanner && (
        <DraftResumeBanner
          href="/admin/products/new"
          label="tambah produk"
          savedAt={newDraftSavedAt}
          onDiscard={() => {
            clearAdminDraft(ADMIN_DRAFT_KEYS.productNew);
            setShowNewDraftBanner(false);
            setNewDraftSavedAt(undefined);
          }}
        />
      )}

      {editDrafts.map((d) => (
        <DraftResumeBanner
          key={d.id}
          href={`/admin/products/${d.id}/edit`}
          label={`edit produk "${d.name}"`}
          savedAt={d.savedAt}
          onDiscard={() => {
            clearAdminDraft(ADMIN_DRAFT_KEYS.productEdit(d.id));
            setEditDrafts((prev) => prev.filter((x) => x.id !== d.id));
          }}
        />
      ))}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Produk</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Kelola katalog produk dari seluruh mitra daur ulang di satu dashboard superadmin.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Produk Baru
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Total Produk</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">{products.length}</h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Aktif</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#16A34A] flex items-center justify-between">
            {products.filter((p) => p.status === "Aktif").length}
            {products.length > 0 ? (
              <span className="text-[10px] bg-green-50 border border-green-200 text-green-600 px-2 py-0.5 rounded uppercase">
                {Math.round((products.filter((p) => p.status === "Aktif").length / products.length) * 100)}%
              </span>
            ) : (
              <span className="text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded uppercase">
                0%
              </span>
            )}
          </h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Stok Habis</p>
          <h3 className="font-headline text-2xl font-extrabold text-red-600">
            {products.filter((p) => p.stok === 0 || p.status === "Stok Habis").length}
          </h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Toko Terdaftar</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">{sellers.length}</h3>
        </div>
      </section>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama produk, SKU, brand, atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded border border-[#D5CFC9] bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition text-xs font-body text-[#1F1B18]"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedSellerFilter}
            onChange={(e) => setSelectedSellerFilter(e.target.value)}
            className="px-4 py-2.5 rounded border border-[#D5CFC9] bg-white text-xs font-semibold text-[#5C5550] focus:outline-none"
          >
            <option value="">Semua Toko</option>
            {sellers.map((s) => (
              <option key={s.id_seller} value={s.id_seller}>
                {s.nm_store}
              </option>
            ))}
          </select>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded border border-[#D5CFC9] bg-white text-xs font-semibold text-[#5C5550] focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id_kategori} value={cat.nama_kategori}>
                {cat.nama_kategori}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Info Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Toko</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Brand (Frontend)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Kode Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Harga</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Stok</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E0]">
              {filteredProducts.map((p) => (
                <tr key={p.id_produk} className="hover:bg-[#F5F3F0]/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0 border border-[#EAE5E0]">
                        <img src={parseProductImg(p.img)} alt={p.nama_produk} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1F1B18] leading-snug">{p.nama_produk}</p>
                        <p className="text-[10px] text-[#8E8680] font-bold mt-0.5">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#5C5550] font-semibold">{getSellerName(p.id_seller)}</td>
                  <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{p.nama_brand || "Daur Ulang Lokal"}</td>
                  <td className="px-6 py-4 text-xs text-[#5C5550] font-mono">{p.kode_produk || "-"}</td>
                  <td className="px-6 py-4 text-xs text-[#8E8680] font-semibold">{p.sku}</td>
                  <td className="px-6 py-4 font-bold text-sm text-[#1F1B18]">Rp {p.harga.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-[#1F1B18]">{p.stok}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        p.status === "Aktif"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id_produk}/edit`}
                        className="p-1.5 hover:bg-[#F5F3F0] rounded text-[#8E8680] hover:text-[#1F1B18] transition"
                        title="Edit Produk"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id_produk, p.nama_produk)}
                        className="p-1.5 hover:bg-red-50 rounded text-[#8E8680] hover:text-red-600 transition"
                        title="Hapus Produk"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#8E8680] text-sm font-medium">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-[#F5F3F0]/40 border-t border-[#EAE5E0] flex items-center justify-between text-xs font-semibold text-[#8E8680]">
          <p>
            {products.length > 0
              ? `Menampilkan 1-${filteredProducts.length} dari ${products.length} produk`
              : "Tidak ada produk"}
          </p>
        </div>
      </section>
    </div>
  );
}
