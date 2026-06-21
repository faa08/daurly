"use client";

import React, { useState } from "react";

const INITIAL_PRODUCTS = [
  {
    sku: "SKU-8821",
    nama: "Mangkuk Keramik Motif Megamendung Handmade",
    kategori: "Kerajinan",
    harga: 125000,
    stok: 45,
    status: "Aktif",
    img: "/product-keramik.png",
  },
  {
    sku: "SKU-4912",
    nama: "Kopi Toraja Arabika 250g Premium Roasted",
    kategori: "Kuliner",
    harga: 85000,
    stok: 120,
    status: "Aktif",
    img: "/product-kopi.png",
  },
  {
    sku: "SKU-7731",
    nama: "Dompet Kulit Sapi Asli Handmade Cognac Brown",
    kategori: "Fashion Pria",
    harga: 210000,
    stok: 0,
    status: "Stok Habis",
    img: "/product-dompet.png",
  }
];

export default function SellerProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Fashion Pria");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);

  const handleDelete = (sku: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${name}?`)) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      nama: newProductName,
      kategori: newProductCategory,
      harga: parseFloat(newProductPrice) || 0,
      stok: parseInt(newProductStock) || 0,
      status: (parseInt(newProductStock) || 0) > 0 ? "Aktif" : "Stok Habis",
      img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=100&auto=format&fit=crop",
    };
    
    setProducts((prev) => [newProduct, ...prev]);
    setShowAddModal(false);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductStock("");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Produk Saya</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Kelola dan pantau seluruh katalog produk Anda di satu tempat.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Produk Baru
        </button>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-secondary tracking-wider">Total Produk</p>
          <h3 className="font-headline text-2xl font-extrabold text-on-surface">{products.length}</h3>
        </div>
        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-secondary tracking-wider">Aktif</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1E40AF] flex items-center justify-between">
            {products.filter(p => p.status === "Aktif").length}
            {products.length > 0 ? (
              <span className="text-[10px] bg-green-50 border border-green-200 text-green-600 px-2 py-0.5 rounded uppercase">
                {Math.round((products.filter(p => p.status === "Aktif").length / products.length) * 100)}%
              </span>
            ) : (
              <span className="text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded uppercase">0%</span>
            )}
          </h3>
        </div>
        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-secondary tracking-wider">Stok Habis</p>
          <h3 className="font-headline text-2xl font-extrabold text-error">
            {products.filter(p => p.stok === 0 || p.status === "Stok Habis").length}
          </h3>
        </div>
        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-secondary tracking-wider">Dalam Review</p>
          <h3 className="font-headline text-2xl font-extrabold text-secondary">
            {products.filter(p => p.status === "Dalam Review").length}
          </h3>
        </div>
      </section>

      {/* Filter and controls */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama produk atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded border border-surface-container-highest bg-white focus:outline-none focus:ring-2 focus:ring-primary transition text-xs font-body"
          />
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2.5 rounded border border-surface-container-highest bg-white text-xs font-semibold text-secondary focus:outline-none">
            <option>Semua Kategori</option>
          </select>
          <select className="px-4 py-2.5 rounded border border-surface-container-highest bg-white text-xs font-semibold text-secondary focus:outline-none">
            <option>Urutkan: Terbaru</option>
          </select>
        </div>
      </section>

      {/* Product List Table */}
      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Info Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Harga</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Stok</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredProducts.map((p) => (
                <tr key={p.sku} className="hover:bg-surface-container-low/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container rounded overflow-hidden">
                        <img src={p.img} alt={p.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface leading-snug">{p.nama}</p>
                        <p className="text-[10px] text-secondary font-medium mt-0.5">{p.kategori}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-secondary font-semibold">{p.sku}</td>
                  <td className="px-6 py-4 font-bold text-sm text-on-surface">Rp {p.harga.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-on-surface">{p.stok}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${p.status === "Aktif" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => alert(`Edit SKU: ${p.sku}`)}
                        className="p-1.5 hover:bg-surface-container rounded text-secondary hover:text-on-surface transition"
                        title="Edit Produk"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(p.sku, p.nama)}
                        className="p-1.5 hover:bg-error-container/30 rounded text-secondary hover:text-error transition"
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
                  <td colSpan={6} className="py-8 text-center text-secondary text-sm">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low/40 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-secondary">
          <p>
            {products.length > 0 
              ? `Menampilkan 1-${filteredProducts.length} dari ${products.length} produk`
              : "Tidak ada produk"
            }
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">1</button>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">2</button>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">3</button>
            <span className="px-2 self-center">...</span>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">13</button>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stateful Add Product Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-surface-container-high rounded-xl max-w-lg w-full overflow-hidden shadow-xl animate-scale-in">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/50">
              <h3 className="font-headline font-bold text-base text-on-surface">Tambah Produk Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-secondary hover:text-on-surface transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nama Produk</label>
                <input 
                  type="text" 
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Kemeja Batik Klasik..." 
                  className="w-full px-4 py-2 border border-surface-container-highest rounded bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Kategori</label>
                  <select 
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-surface-container-highest rounded bg-white focus:outline-none text-xs font-semibold text-secondary"
                  >
                    <option>Fashion Pria</option>
                    <option>Tekstil</option>
                    <option>Aksesoris</option>
                    <option>Kuliner</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Harga (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="150000" 
                    className="w-full px-4 py-2 border border-surface-container-highest rounded bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Jumlah Stok</label>
                <input 
                  type="number" 
                  required
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                  placeholder="10" 
                  className="w-full px-4 py-2 border border-surface-container-highest rounded bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-surface-container-highest text-secondary hover:bg-surface-container text-xs font-bold rounded transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:brightness-95 transition"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
