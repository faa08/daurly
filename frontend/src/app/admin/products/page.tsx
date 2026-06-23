"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { sellerService, Seller } from "@/backend/sellerService";
import { productService, Product } from "@/backend/productService";
import { supabase } from "@/backend/supabase";

export default function AdminProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<{ id_kategori: string; nama_kategori: string }[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedSellerFilter, setSelectedSellerFilter] = useState("");

  // Modal & Edit states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductSellerId, setNewProductSellerId] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductBrandName, setNewProductBrandName] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductWeight, setNewProductWeight] = useState("");
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const loadData = async () => {
    // 1. Auth check
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/masuk");
      return;
    }
    setUser(currentUser);

    // 2. Fetch products, categories, and sellers
    const allProducts = await productService.getProducts();
    setProducts(allProducts);

    const allCategories = await productService.getCategories();
    setCategories(allCategories);
    if (allCategories.length > 0) {
      setNewProductCategory(allCategories[0].id_kategori);
    }

    const allSellers = await sellerService.getSellers();
    setSellers(allSellers);
    if (allSellers.length > 0) {
      setNewProductSellerId(allSellers[0].id_seller);
      setNewProductBrandName(allSellers[0].nm_store);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Nama Brand field automatically when Toko changes in add product modal
  useEffect(() => {
    if (newProductSellerId) {
      const selected = sellers.find(s => s.id_seller === newProductSellerId);
      if (selected) {
        setNewProductBrandName(selected.nm_store);
      }
    }
  }, [newProductSellerId, sellers]);

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductStock("");
    setNewProductDescription("");
    setNewProductImage("");
    setNewProductCode("");
    setNewProductWeight("");
    setUploadProgress(null);
    setUseManualUrl(false);
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setNewProductName(p.nama_produk);
    setNewProductSellerId(p.id_seller);
    const foundCat = categories.find(c => c.nama_kategori === p.category);
    setNewProductCategory(foundCat ? foundCat.id_kategori : "");
    setNewProductBrandName(p.nama_brand || "");
    setNewProductCode(p.kode_produk || "");
    setNewProductPrice(p.harga.toString());
    setNewProductStock(p.stok.toString());
    setNewProductDescription(p.desc);
    setNewProductImage(p.img);
    setNewProductWeight(p.berat ? p.berat.toString() : "0");
    setShowAddModal(true);
  };

  const handleDelete = async (sku: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${name}?`)) {
      const success = await productService.deleteProduct(sku);
      if (success) {
        alert(`Produk ${name} berhasil dihapus!`);
        loadData();
      } else {
        alert("Gagal menghapus produk.");
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar! Maksimal adalah 2MB.");
        return;
      }

      setUploadProgress(0);
      setNewProductImage("");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      let uploadedUrl = "";
      try {
        setUploadProgress(20);
        const { data, error } = await supabase.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
        setUploadProgress(80);

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          uploadedUrl = publicUrlData.publicUrl;
        } else {
          throw new Error("Gagal mendapatkan public URL.");
        }

        setUploadProgress(100);
        setNewProductImage(uploadedUrl);
      } catch (err) {
        console.warn("Gagal mengunggah ke Supabase Storage, menggunakan mode fallback base64...", err);
        setUploadProgress(50);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setNewProductImage(event.target.result as string);
            setUploadProgress(100);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductSellerId) {
      alert("Error: Silakan pilih Toko terlebih dahulu.");
      return;
    }

    if (editingProduct) {
      const success = await productService.updateProduct(
        editingProduct.id_produk,
        newProductName,
        newProductCategory || null,
        parseFloat(newProductPrice) || 0,
        parseInt(newProductStock) || 0,
        newProductDescription || "Deskripsi produk baru",
        newProductImage || undefined,
        (parseInt(newProductStock) || 0) > 0 ? "Aktif" : "Stok Habis",
        newProductBrandName,
        newProductCode || undefined,
        parseInt(newProductWeight) || 0
      );

      if (success) {
        alert("Produk berhasil diupdate!");
        loadData();
        handleCloseModal();
      } else {
        alert("Gagal mengupdate produk.");
      }
    } else {
      const newProduct = await productService.addProduct(
        newProductSellerId,
        newProductName,
        newProductCategory || null,
        parseFloat(newProductPrice) || 0,
        parseInt(newProductStock) || 0,
        newProductDescription || "Deskripsi produk baru",
        newProductImage || undefined,
        (parseInt(newProductStock) || 0) > 0 ? "Aktif" : "Stok Habis",
        newProductBrandName,
        newProductCode || undefined,
        parseInt(newProductWeight) || 0
      );

      if (newProduct) {
        alert("Produk berhasil ditambahkan!");
        loadData();
        handleCloseModal();
      } else {
        alert("Gagal menambahkan produk.");
      }
    }
  };

  const getSellerName = (sellerId: string) => {
    const s = sellers.find((item) => item.id_seller === sellerId);
    return s ? s.nm_store : "Toko Tidak Diketahui";
  };

  // Filter products based on search term, category filter, and seller filter
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
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Produk</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Kelola katalog produk dari seluruh mitra UMKM di satu dashboard superadmin.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1D4ED8] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Produk Baru
        </button>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Total Produk</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">{products.length}</h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Aktif</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1D4ED8] flex items-center justify-between">
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
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Stok Habis</p>
          <h3 className="font-headline text-2xl font-extrabold text-red-600">
            {products.filter(p => p.stok === 0 || p.status === "Stok Habis").length}
          </h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Toko Terdaftar</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">{sellers.length}</h3>
        </div>
      </section>

      {/* Filter and controls */}
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
            className="w-full pl-12 pr-4 py-2.5 rounded border border-[#D5CFC9] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition text-xs font-body text-[#1F1B18]"
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

      {/* Product List Table */}
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
                <tr key={p.sku} className="hover:bg-[#F5F3F0]/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0 border border-[#EAE5E0]">
                        <img src={p.img || "/product-keramik.png"} alt={p.nama_produk} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1F1B18] leading-snug">{p.nama_produk}</p>
                        <p className="text-[10px] text-[#8E8680] font-bold mt-0.5">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#5C5550] font-semibold">{getSellerName(p.id_seller)}</td>
                  <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{p.nama_brand || "UMKM Lokal"}</td>
                  <td className="px-6 py-4 text-xs text-[#5C5550] font-mono">{p.kode_produk || "-"}</td>
                  <td className="px-6 py-4 text-xs text-[#8E8680] font-semibold">{p.sku}</td>
                  <td className="px-6 py-4 font-bold text-sm text-[#1F1B18]">Rp {p.harga.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-[#1F1B18]">{p.stok}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${p.status === "Aktif" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 hover:bg-[#F5F3F0] rounded text-[#8E8680] hover:text-[#1F1B18] transition"
                        title="Edit Produk"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(p.sku, p.nama_produk)}
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

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#F5F3F0]/40 border-t border-[#EAE5E0] flex items-center justify-between text-xs font-semibold text-[#8E8680]">
          <p>
            {products.length > 0 
              ? `Menampilkan 1-${filteredProducts.length} dari ${products.length} produk`
              : "Tidak ada produk"
            }
          </p>
        </div>
      </section>

      {/* Stateful Add/Edit Product Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5E0] rounded-xl max-w-lg w-full overflow-hidden shadow-xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[#EAE5E0] flex justify-between items-center bg-[#F5F3F0]/50">
              <h3 className="font-headline font-bold text-base text-[#1F1B18]">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-[#8E8680] hover:text-[#1F1B18] transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-semibold text-xs text-[#5C5550]">
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Nama Produk</label>
                <input 
                  type="text" 
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Kemeja Batik Klasik..." 
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Toko Mitra</label>
                  <select 
                    value={newProductSellerId}
                    onChange={(e) => setNewProductSellerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none text-xs font-semibold text-[#1F1B18]"
                  >
                    {sellers.map((s) => (
                      <option key={s.id_seller} value={s.id_seller}>
                        {s.nm_store}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Kategori</label>
                  <select 
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none text-xs font-semibold text-[#1F1B18]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id_kategori} value={cat.id_kategori}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Nama Brand (Tampil di Web)</label>
                  <input 
                    type="text" 
                    required
                    value={newProductBrandName}
                    onChange={(e) => setNewProductBrandName(e.target.value)}
                    placeholder="Nama Brand..." 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Kode Produk (Internal)</label>
                  <input 
                    type="text" 
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    placeholder="Kosongkan untuk auto-generate" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Harga (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="150000" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Jumlah Stok</label>
                  <input 
                    type="number" 
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="10" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Berat (Gram)</label>
                  <input 
                    type="number" 
                    required
                    value={newProductWeight}
                    onChange={(e) => setNewProductWeight(e.target.value)}
                    placeholder="500" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Gambar Produk</label>
                {useManualUrl ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      placeholder="https://example.com/image.jpg" 
                      className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                    />
                    <button
                      type="button"
                      onClick={() => setUseManualUrl(false)}
                      className="text-[10px] text-[#1D4ED8] font-bold hover:underline"
                    >
                      ← Unggah File Gambar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border border-dashed border-[#D5CFC9] rounded-lg p-6 flex flex-col items-center justify-center bg-[#FCFCFA] relative cursor-pointer hover:bg-[#F5F3F0]/50 transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleImageUpload}
                      />
                      
                      {uploadProgress === null && !newProductImage && (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-[#8E8680] text-[32px] mb-1">
                            add_photo_alternate
                          </span>
                          <p className="text-xs font-bold text-[#1F1B18]">Pilih atau Tarik Foto Produk</p>
                          <p className="text-[10px] text-[#8E8680] mt-1">Maks. 2MB (Format: JPG, PNG, WEBP)</p>
                        </div>
                      )}

                      {uploadProgress !== null && uploadProgress < 100 && (
                        <div className="w-full text-center space-y-2">
                          <p className="text-xs font-bold text-[#1D4ED8]">Mengunggah: {uploadProgress}%</p>
                          <div className="w-full h-1.5 bg-[#EAE5E0] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1D4ED8] transition-all duration-100" 
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {newProductImage && uploadProgress === 100 && (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-[11px] font-bold text-green-600">✓ Gambar Siap Digunakan</p>
                          <div className="w-20 h-20 rounded border border-[#EAE5E0] overflow-hidden bg-[#F5F3F0]">
                            <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewProductImage("");
                              setUploadProgress(null);
                            }}
                            className="text-[10px] text-red-600 font-bold hover:underline"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseManualUrl(true)}
                      className="text-[10px] text-[#8E8680] font-semibold hover:underline"
                    >
                      Masukkan URL Gambar Secara Manual
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Deskripsi Produk</label>
                <textarea 
                  required
                  rows={3}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="Tulis spesifikasi, ukuran, dan deskripsi produk..." 
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EAE5E0]">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#D5CFC9] text-[#5C5550] hover:bg-[#F5F3F0] text-xs font-bold rounded transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded hover:bg-blue-700 transition"
                >
                  {editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
