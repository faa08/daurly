"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { sellerService } from "@/backend/sellerService";
import { productService, Product } from "@/backend/productService";

export default function SellerProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Fashion Pria");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductVariants, setNewProductVariants] = useState<{ label: string; values: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSellerData = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/masuk");
      return;
    }
    setUser(currentUser);
    const currentSeller = await sellerService.getSellerByUserId(currentUser.id_user);
    if (!currentSeller) {
      alert("Anda belum mendaftar sebagai Seller! Silakan daftar terlebih dahulu.");
      router.push("/account/seller");
      return;
    }
    setSeller(currentSeller);
    const sellerProducts = await productService.getProductsBySeller(currentSeller.id_seller);
    setProducts(sellerProducts);
  };

  useEffect(() => {
    loadSellerData();
  }, []);

  const handleDelete = async (sku: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${name}?`)) {
      const success = await productService.deleteProduct(sku);
      if (success) {
        alert(`Produk ${name} berhasil dihapus!`);
        loadSellerData();
      } else {
        alert("Gagal menghapus produk.");
      }
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) {
      alert("Error: Data toko tidak ditemukan.");
      return;
    }
    
    // Map dynamic variants
    const variants = newProductVariants
      .map(v => ({
        label: v.label.trim(),
        values: v.values.split(",").map(val => val.trim()).filter(Boolean)
      }))
      .filter(v => v.label && v.values.length > 0);

    const newProduct = await productService.addProduct(
      seller.id_seller,
      newProductName,
      newProductCategory,
      parseFloat(newProductPrice) || 0,
      parseInt(newProductStock) || 0,
      "Deskripsi produk baru",
      (parseInt(newProductStock) || 0) > 0 ? "Aktif" : "Stok Habis",
      newProductImage,
      undefined,
      undefined,
      variants
    );

    if (newProduct) {
      alert("Produk berhasil ditambahkan!");
      loadSellerData();
      setShowAddModal(false);
      setNewProductName("");
      setNewProductPrice("");
      setNewProductStock("");
      setNewProductImage("");
      setNewProductVariants([]);
    } else {
      alert("Gagal menambahkan produk.");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                        <img src={p.img} alt={p.nama_produk} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface leading-snug">{p.nama_produk}</p>
                        <p className="text-[10px] text-secondary font-medium mt-0.5">{p.category}</p>
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
                        onClick={() => handleDelete(p.sku, p.nama_produk)}
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
              {/* Foto Produk */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Foto Produk</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-surface-container-highest rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low relative group">
                    {newProductImage ? (
                      <>
                        <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewProductImage("")}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <span className="material-symbols-outlined text-secondary text-xl">image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      id="upload-foto-produk"
                      className="hidden"
                    />
                    <label 
                      htmlFor="upload-foto-produk"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-surface-container-highest rounded text-xs font-bold text-secondary hover:bg-surface-container cursor-pointer transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      Pilih Foto Produk
                    </label>
                    <p className="text-[10px] text-secondary">Mendukung format JPG, PNG, atau WEBP. Maks 2MB.</p>
                  </div>
                </div>
              </div>

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

              {/* Varian Produk Dinamis */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                    Varian Produk (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewProductVariants([...newProductVariants, { label: "", values: "" }])}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline transition"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Tambah Varian
                  </button>
                </div>

                {newProductVariants.length === 0 ? (
                  <p className="text-[11px] text-secondary italic">
                    Belum ada varian produk. Tambahkan varian jika produk memiliki pilihan seperti Rasa, Kemasan, Ukuran, dll.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {newProductVariants.map((variant, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-surface-container-low p-3 rounded-lg border border-surface-container-high relative">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-secondary uppercase">Nama Varian</label>
                              <input
                                type="text"
                                value={variant.label}
                                required
                                onChange={(e) => {
                                  const updated = [...newProductVariants];
                                  updated[idx].label = e.target.value;
                                  setNewProductVariants(updated);
                                }}
                                placeholder="Contoh: Rasa, Ukuran, Kemasan"
                                className="w-full px-3 py-1.5 border border-surface-container-highest rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-secondary uppercase">Nilai Pilihan</label>
                              <input
                                type="text"
                                value={variant.values}
                                required
                                onChange={(e) => {
                                  const updated = [...newProductVariants];
                                  updated[idx].values = e.target.value;
                                  setNewProductVariants(updated);
                                }}
                                placeholder="Contoh: Pedas, Manis, Asin"
                                className="w-full px-3 py-1.5 border border-surface-container-highest rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                              />
                            </div>
                          </div>
                          <p className="text-[9px] text-secondary">Pisahkan nilai pilihan dengan koma.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newProductVariants.filter((_, i) => i !== idx);
                            setNewProductVariants(updated);
                          }}
                          className="p-1 hover:bg-error-container/30 rounded text-secondary hover:text-error transition self-center"
                          title="Hapus Varian"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
