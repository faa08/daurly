"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { sellerService, Seller } from "@/backend/sellerService";
import { productService, Product, type ProductVariant, type ProductVariantOption } from "@/backend/productService";
import {
  buildAllPickCombinations,
  getCombinationLabel,
  inventoryFromMap,
  picksKey,
  syncInventoryMap,
  totalInventoryStock,
} from "@/lib/variantInventory";
import { supabase } from "@/backend/supabase";
import AdminFormShell from "@/components/admin/AdminFormShell";
import {
  ADMIN_DRAFT_KEYS,
  clearAdminDraft,
  loadAdminDraft,
  saveAdminDraft,
} from "@/lib/adminDrafts";

const MAX_PRODUCT_IMAGES = 30;

type VariantGroup = { label: string; options: { name: string; image: string; price: string }[] };

type ProductFormDraft = {
  productName: string;
  sellerId: string;
  category: string;
  brandName: string;
  code: string;
  price: string;
  description: string;
  images: string[];
  manualUrl: string;
  useManualUrl: boolean;
  variants: VariantGroup[];
  variantStockMap: Record<string, string>;
  variantPriceMap?: Record<string, string>;
  variantImageMap?: Record<string, string>;
};

const DEFAULT_VARIANTS: VariantGroup[] = [
  { label: "Motif", options: [{ name: "", image: "", price: "" }] },
  { label: "Ukuran", options: [{ name: "", image: "", price: "" }] },
];

export default function ProductForm({
  mode,
  productId,
}: {
  mode: "new" | "edit";
  productId?: string;
}) {
  const router = useRouter();
  const draftKey =
    mode === "new" ? ADMIN_DRAFT_KEYS.productNew : ADMIN_DRAFT_KEYS.productEdit(productId!);

  const [initialized, setInitialized] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<{ id_kategori: string; nama_kategori: string }[]>([]);

  const [productName, setProductName] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [category, setCategory] = useState("");
  const [brandName, setBrandName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [variants, setVariants] = useState<VariantGroup[]>(DEFAULT_VARIANTS);
  const [variantUploading, setVariantUploading] = useState<string | null>(null);
  const [variantStockMap, setVariantStockMap] = useState<Record<string, string>>({});
  const [variantPriceMap, setVariantPriceMap] = useState<Record<string, string>>({});
  const [variantImageMap, setVariantImageMap] = useState<Record<string, string>>({});
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  const saveDraftRef = useRef<() => void>(() => {});
  const skipDraftSave = useRef(false);

  function buildParsedVariants(): ProductVariant[] {
    return variants
      .filter((g) => g.label.trim())
      .map((g) => ({
        label: g.label.trim(),
        options: g.options
          .filter((o) => o.name.trim())
          .map((o) => {
            const opt: ProductVariantOption = { name: o.name.trim() };
            if (o.image.trim()) opt.image = o.image.trim();
            if (o.price.trim()) opt.price = parseFloat(o.price) || undefined;
            return opt;
          }),
      }))
      .filter((g) => g.options.length > 0);
  }

  const getDraftData = useCallback(
    (): ProductFormDraft => ({
      productName,
      sellerId,
      category,
      brandName,
      code,
      price,
      description,
      images,
      manualUrl,
      useManualUrl,
      variants,
      variantStockMap,
      variantPriceMap,
      variantImageMap,
    }),
    [
      productName,
      sellerId,
      category,
      brandName,
      code,
      price,
      description,
      images,
      manualUrl,
      useManualUrl,
      variants,
      variantStockMap,
      variantPriceMap,
      variantImageMap,
    ]
  );

  saveDraftRef.current = () => {
    if (skipDraftSave.current) return;
    const data = getDraftData();
    const hasContent =
      data.productName.trim() ||
      data.description.trim() ||
      data.images.length > 0 ||
      data.price.trim() ||
      Object.values(data.variantStockMap).some((v) => v.trim()) ||
      Object.values(data.variantPriceMap || {}).some((v) => v.trim()) ||
      Object.values(data.variantImageMap || {}).some((v) => v.trim());
    if (!hasContent) return;
    saveAdminDraft(draftKey, data);
    setDraftSavedAt(Date.now());
  };

  useEffect(() => {
    return () => {
      saveDraftRef.current();
    };
  }, []);

  function applyDraft(draft: ProductFormDraft & { savedAt: number }) {
    setProductName(draft.productName);
    setSellerId(draft.sellerId);
    setCategory(draft.category);
    setBrandName(draft.brandName);
    setCode(draft.code);
    setPrice(draft.price);
    setDescription(draft.description);
    setImages(draft.images);
    setManualUrl(draft.manualUrl);
    setUseManualUrl(draft.useManualUrl);
    setVariants(draft.variants);
    setVariantStockMap(draft.variantStockMap);
    setVariantPriceMap(draft.variantPriceMap || {});
    setVariantImageMap(draft.variantImageMap || {});
    setDraftSavedAt(draft.savedAt);
  }

  function populateFromProduct(
    product: Product,
    cats: { id_kategori: string; nama_kategori: string }[]
  ) {
    setEditingProduct(product);
    setProductName(product.nama_produk);
    setSellerId(product.id_seller);
    const foundCat = cats.find((c) => c.nama_kategori === product.category);
    setCategory(foundCat ? foundCat.id_kategori : "");
    setBrandName(product.nama_brand || "");
    setCode(product.kode_produk || "");
    setPrice(product.harga.toString());
    setDescription(product.desc);
    setImages(product.images || (product.img ? [product.img] : []));
    setVariants(
      product.variants && product.variants.length > 0
        ? product.variants.map((v) => ({
            label: v.label,
            options: v.options.map((o) => ({
              name: o.name,
              image: o.image || "",
              price: o.price != null ? String(o.price) : "",
            })),
          }))
        : DEFAULT_VARIANTS
    );
    if (product.variantInventory?.length) {
      const stockMap: Record<string, string> = {};
      const priceMap: Record<string, string> = {};
      const imageMap: Record<string, string> = {};
      for (const entry of product.variantInventory) {
        const key = picksKey(entry.picks);
        stockMap[key] = String(entry.stock);
        if (entry.price != null) {
          priceMap[key] = String(entry.price);
        }
        if (entry.image) {
          imageMap[key] = entry.image;
        }
      }
      setVariantStockMap(stockMap);
      setVariantPriceMap(priceMap);
      setVariantImageMap(imageMap);
    } else {
      setVariantStockMap({});
      setVariantPriceMap({});
      setVariantImageMap({});
    }
  }

  useEffect(() => {
    const groups = buildParsedVariants();
    if (groups.length === 0) {
      setVariantStockMap({});
      setVariantPriceMap({});
      setVariantImageMap({});
      return;
    }
    setVariantStockMap((prev) => syncInventoryMap(groups, prev));
    setVariantPriceMap((prev) => syncInventoryMap(groups, prev));
    setVariantImageMap((prev) => syncInventoryMap(groups, prev));
  }, [variants]);

  useEffect(() => {
    async function init() {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        router.push("/masuk");
        return;
      }

      const allCategories = await productService.getCategories();
      setCategories(allCategories);
      const allSellers = await sellerService.getSellers();
      setSellers(allSellers);

      const draft = loadAdminDraft<ProductFormDraft>(draftKey);
      if (draft) {
        applyDraft(draft);
        if (mode === "edit" && productId) {
          const full = await productService.getProductBySlugOrId(productId);
          if (full) setEditingProduct(full);
        }
      } else if (mode === "edit" && productId) {
        const full = await productService.getProductBySlugOrId(productId);
        if (full) {
          populateFromProduct(full, allCategories);
        } else {
          alert("Produk tidak ditemukan.");
          router.push("/admin/products");
          return;
        }
      } else {
        if (allCategories.length > 0) setCategory(allCategories[0].id_kategori);
        if (allSellers.length > 0) {
          setSellerId(allSellers[0].id_seller);
          setBrandName(allSellers[0].nm_store);
        }
      }

      setInitialized(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(() => saveDraftRef.current(), 1500);
    return () => clearTimeout(timer);
  }, [
    initialized,
    productName,
    sellerId,
    category,
    brandName,
    code,
    price,
    description,
    images,
    manualUrl,
    useManualUrl,
    variants,
    variantStockMap,
  ]);

  useEffect(() => {
    if (sellerId) {
      const selected = sellers.find((s) => s.id_seller === sellerId);
      if (selected) setBrandName(selected.nm_store);
    }
  }, [sellerId, sellers]);

  async function uploadImageFile(file: File): Promise<string> {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error(`Ukuran gambar ${file.name} terlalu besar! Maksimal 2MB.`);
    }

    const fileExt = file.name.split(".").pop();
    // eslint-disable-next-line react-hooks/purity -- this runs in an event handler, not during render
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
      throw new Error("Gagal mendapatkan URL gambar.");
    } catch (err) {
      console.warn("Upload storage gagal, pakai base64:", err);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string) || "");
        reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
        reader.readAsDataURL(file);
      });
    }
  }

  function setVariantOptionImage(gIdx: number, oIdx: number, image: string) {
    setVariants((prev) => {
      const next = [...prev];
      const opts = [...next[gIdx].options];
      opts[oIdx] = { ...opts[oIdx], image };
      next[gIdx] = { ...next[gIdx], options: opts };
      return next;
    });
  }

  async function handleVariantImageUpload(
    gIdx: number,
    oIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${gIdx}-${oIdx}`;
    setVariantUploading(key);
    try {
      const url = await uploadImageFile(file);
      setVariantOptionImage(gIdx, oIdx, url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto varian.");
    } finally {
      setVariantUploading(null);
      e.target.value = "";
    }
  }

  async function handleComboImageUpload(
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setVariantUploading(key);
    try {
      const url = await uploadImageFile(file);
      setVariantImageMap((prev) => ({ ...prev, [key]: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto variasi.");
    } finally {
      setVariantUploading(null);
      e.target.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (images.length + files.length > MAX_PRODUCT_IMAGES) {
        alert(`Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk.`);
        return;
      }

      setUploadProgress(0);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
          const uploadedUrl = await uploadImageFile(file);
          if (uploadedUrl) uploadedUrls.push(uploadedUrl);
        } catch (err) {
          alert(err instanceof Error ? err.message : `Gagal mengunggah ${file.name}`);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      setUploadProgress(null);
    }
  }

  function handleBack() {
    saveDraftRef.current();
    router.push("/admin/products");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sellerId) {
      alert("Error: Silakan pilih Toko terlebih dahulu.");
      return;
    }

    const imagesToSubmit = images.length > 0 ? images : undefined;
    const parsedVariants = buildParsedVariants();
    const variantInventory = buildAllPickCombinations(parsedVariants)
      .map((picks) => {
        const key = picksKey(picks);
        const stock = Math.max(0, parseInt(variantStockMap[key] || "0", 10) || 0);
        const priceVal = parseFloat(variantPriceMap[key]);
        const imageVal = variantImageMap[key]?.trim();
        return {
          picks,
          stock,
          ...(Number.isNaN(priceVal) ? {} : { price: priceVal }),
          ...(imageVal ? { image: imageVal } : {}),
        };
      })
      .filter((e) => e.stock > 0 || (e.price != null && e.price > 0) || e.image);

    const totalStock = totalInventoryStock(variantInventory);

    // Calculate dynamic base price: find minimum price in variants. Fallback to base price state.
    const optionPrices: number[] = [];
    variantInventory.forEach((e) => {
      if (e.price != null && e.price > 0) {
        optionPrices.push(e.price);
      }
    });
    const finalPrice = optionPrices.length > 0 ? Math.min(...optionPrices) : (parseFloat(price) || 0);

    const extras = { variants: parsedVariants, variantInventory };

    if (mode === "edit" && editingProduct) {
      const success = await productService.updateProduct(
        editingProduct.id_produk,
        productName,
        category || null,
        finalPrice,
        totalStock,
        description || "Deskripsi produk baru",
        imagesToSubmit,
        totalStock > 0 ? "Aktif" : "Stok Habis",
        brandName,
        code || undefined,
        extras
      );

      if (success) {
        skipDraftSave.current = true;
        clearAdminDraft(draftKey);
        alert("Produk berhasil diupdate!");
        router.push("/admin/products");
      } else {
        alert("Gagal mengupdate produk.");
      }
    } else {
      const newProduct = await productService.addProduct(
        sellerId,
        productName,
        category || null,
        finalPrice,
        totalStock,
        description || "Deskripsi produk baru",
        imagesToSubmit,
        totalStock > 0 ? "Aktif" : "Stok Habis",
        brandName,
        code || undefined,
        extras
      );

      if (newProduct) {
        skipDraftSave.current = true;
        clearAdminDraft(draftKey);
        alert("Produk berhasil ditambahkan!");
        router.push("/admin/products");
      } else {
        alert(
          "Gagal menambahkan produk. Pastikan toko sudah terdaftar, kategori valid, dan policy RLS di db.sql sudah dijalankan di Supabase."
        );
      }
    }
  }

  if (!initialized) {
    return (
      <div className="py-12 text-center text-sm text-[#8E8680] font-medium">Memuat formulir...</div>
    );
  }

  return (
    <AdminFormShell
      title={mode === "edit" ? "Edit Produk" : "Tambah Produk Baru"}
      backHref="/admin/products"
      onBack={handleBack}
      draftSavedAt={draftSavedAt}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 font-semibold text-xs text-[#5C5550]">
        <div className="space-y-1.5 text-left">
          <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Nama Produk</label>
          <input
            type="text"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Kemeja Batik Klasik..."
            className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Toko Mitra</label>
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
              Nama Brand (Tampil di Web)
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Nama Brand..."
              className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
              Kode Produk (Internal)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Kosongkan untuk auto-generate"
              className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
            />
          </div>
        </div>


        <div className="space-y-2 text-left">
          <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Gambar Produk</label>

          {uploadProgress !== null && (
            <div className="w-full text-center space-y-1 p-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
              <p className="text-[10px] font-bold text-[#1D4ED8]">Mengunggah Gambar: {uploadProgress}%</p>
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1D4ED8] transition-all duration-100"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-3 mb-2">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg border border-[#EAE5E0] overflow-hidden bg-[#F5F3F0] shadow-xs"
              >
                <img src={imgUrl} alt={`Gambar ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-[#1D4ED8] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    Utama
                  </span>
                )}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity duration-150">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) => {
                          const updated = [...prev];
                          const item = updated.splice(index, 1)[0];
                          return [item, ...updated];
                        });
                      }}
                      title="Jadikan Foto Utama"
                      className="p-1 bg-white hover:bg-blue-50 text-[#1D4ED8] rounded-full shadow-xs transition"
                    >
                      <span className="material-symbols-outlined text-[14px]">star</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== index))}
                    title="Hapus Gambar"
                    className="p-1 bg-white hover:bg-red-50 text-red-600 rounded-full shadow-xs transition"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {images.length < MAX_PRODUCT_IMAGES && !useManualUrl && (
              <div className="relative aspect-square border border-dashed border-[#D5CFC9] rounded-lg bg-[#FCFCFA] hover:bg-[#F5F3F0]/50 hover:border-[#1D4ED8] transition flex flex-col items-center justify-center cursor-pointer text-center p-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleImageUpload}
                />
                <span className="material-symbols-outlined text-[#8E8680] text-[22px] mb-0.5">
                  add_photo_alternate
                </span>
                <p className="text-[9px] font-bold text-[#1F1B18]">Tambah Foto</p>
                <p className="text-[7px] text-[#8E8680] mt-0.5">({images.length}/{MAX_PRODUCT_IMAGES})</p>
              </div>
            )}
          </div>

          {useManualUrl ? (
            <div className="space-y-2 border border-[#EAE5E0] rounded-lg p-3 bg-[#FCFCFA]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Masukkan URL gambar (https://...)"
                  className="flex-1 px-3 py-2 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!manualUrl.trim()) return;
                    if (images.length >= MAX_PRODUCT_IMAGES) {
                      alert(`Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk.`);
                      return;
                    }
                    setImages((prev) => [...prev, manualUrl.trim()]);
                    setManualUrl("");
                  }}
                  className="px-3 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded hover:bg-blue-700 transition"
                >
                  Tambah
                </button>
              </div>
              <button
                type="button"
                onClick={() => setUseManualUrl(false)}
                className="text-[10px] text-[#1D4ED8] font-bold hover:underline"
              >
                ← Gunakan Pengunggah File
              </button>
            </div>
          ) : (
            images.length < MAX_PRODUCT_IMAGES && (
              <button
                type="button"
                onClick={() => setUseManualUrl(true)}
                className="text-[10px] text-[#8E8680] font-semibold hover:underline mt-1"
              >
                Masukkan URL Gambar Secara Manual
              </button>
            )
          )}
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Deskripsi Produk</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tulis spesifikasi, ukuran, dan deskripsi produk..."
            className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
          />
        </div>

        <div className="space-y-4 text-left border border-[#EAE5E0] rounded-lg p-4 bg-[#FCFCFA]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#8E8680] font-bold">Varian Produk</p>
              <p className="text-[10px] text-[#8E8680] mt-0.5">
                Grup 1 (Motif/Warna) dan/atau Grup 2 (Ukuran/Jenis). Atur harga, stok, dan gambar pilihan dari foto utama pada tabel kombinasi di bawah.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setVariants((prev) => [...prev, { label: "", options: [{ name: "", image: "", price: "" }] }])
              }
              className="text-[10px] font-bold text-[#1D4ED8] hover:underline whitespace-nowrap"
            >
              + Grup Varian
            </button>
          </div>

          {variants.map((group, gIdx) => (
            <div key={gIdx} className="border border-[#EAE5E0] rounded-lg p-3 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={group.label}
                  onChange={(e) => {
                    const next = [...variants];
                    next[gIdx] = { ...next[gIdx], label: e.target.value };
                    setVariants(next);
                  }}
                  placeholder="Nama grup: Motif, Ukuran, Jenis..."
                  className="flex-1 px-3 py-2 border border-[#D5CFC9] rounded text-xs font-bold text-[#1F1B18]"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== gIdx))}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Hapus grup"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-[#8E8680] font-semibold uppercase">Pilihan</p>
                {group.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#FCFCFA] border border-[#EAE5E0]"
                  >
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => {
                        const next = [...variants];
                        const opts = [...next[gIdx].options];
                        opts[oIdx] = { ...opts[oIdx], name: e.target.value };
                        next[gIdx] = { ...next[gIdx], options: opts };
                        setVariants(next);
                      }}
                      placeholder="Nama (Batik Lace, 40x40...)"
                      className="flex-1 min-w-[120px] px-2.5 py-2 border border-[#D5CFC9] rounded text-xs"
                    />
                    {group.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...variants];
                          next[gIdx] = {
                            ...next[gIdx],
                            options: next[gIdx].options.filter((_, i) => i !== oIdx),
                          };
                          setVariants(next);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-auto"
                        title="Hapus pilihan"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const next = [...variants];
                    next[gIdx] = {
                      ...next[gIdx],
                      options: [...next[gIdx].options, { name: "", image: "", price: "" }],
                    };
                    setVariants(next);
                  }}
                  className="text-[10px] font-bold text-[#1D4ED8] hover:underline"
                >
                  + Tambah Pilihan
                </button>
              </div>
            </div>
          ))}
        </div>

        {buildAllPickCombinations(buildParsedVariants()).length > 0 && (
          <div className="space-y-3 text-left border border-[#EAE5E0] rounded-lg p-4 bg-[#FCFCFA]">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#8E8680] font-bold">
                Gambar, Stok & Harga per Kombinasi Varian
              </p>
              <p className="text-[10px] text-[#8E8680] mt-0.5">
                Isi foto, harga dan stok untuk tiap kombinasi varian. Total stok dihitung otomatis.
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {buildAllPickCombinations(buildParsedVariants()).map((picks) => {
                const key = picksKey(picks);
                const label = getCombinationLabel(buildParsedVariants(), picks);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white border border-[#EAE5E0]"
                  >
                    <span className="text-xs text-[#1F1B18] font-medium flex-1">{label}</span>
                    <div className="flex items-center gap-3">
                      {/* Image Preview */}
                      <div className="flex items-center gap-1">
                        <div
                          className={`relative w-8 h-8 flex-shrink-0 rounded border flex items-center justify-center overflow-hidden bg-[#F5F3F0] ${
                            variantImageMap[key] ? "border-[#1D4ED8]" : "border-[#D5CFC9]"
                          }`}
                        >
                          {variantImageMap[key] ? (
                            <img src={variantImageMap[key]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-[#8E8680]">
                              image
                            </span>
                          )}
                        </div>
                        {variantImageMap[key] && (
                          <button
                            type="button"
                            onClick={() => setVariantImageMap((prev) => ({ ...prev, [key]: "" }))}
                            className="text-[9px] text-red-600 font-bold hover:underline"
                            title="Hapus foto"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      {images.length > 0 && (
                        <select
                          value={variantImageMap[key] || ""}
                          onChange={(e) => {
                            setVariantImageMap((prev) => ({ ...prev, [key]: e.target.value }));
                          }}
                          className="text-[9px] px-1.5 py-1 border border-[#D5CFC9] rounded bg-white max-w-[80px]"
                        >
                          <option value="">Pilih foto...</option>
                          {images.map((img, imgIdx) => (
                            <option key={imgIdx} value={img}>
                              Foto {imgIdx + 1}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#8E8680] font-bold">Rp</span>
                        <input
                          type="number"
                          min={0}
                          value={variantPriceMap[key] ?? ""}
                          onChange={(e) =>
                            setVariantPriceMap((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder="Harga"
                          className="w-24 px-2.5 py-1.5 border border-[#D5CFC9] rounded text-xs text-right"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#8E8680] font-bold">Stok</span>
                        <input
                          type="number"
                          min={0}
                          value={variantStockMap[key] ?? ""}
                          onChange={(e) =>
                            setVariantStockMap((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder="0"
                          className="w-16 px-2.5 py-1.5 border border-[#D5CFC9] rounded text-xs text-right"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {inventoryFromMap(buildParsedVariants(), variantStockMap).length > 0 && (
              <p className="text-[10px] font-bold text-[#1D4ED8]">
                Total stok: {totalInventoryStock(inventoryFromMap(buildParsedVariants(), variantStockMap))}{" "}
                unit
              </p>
            )}
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-[#EAE5E0]">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 border border-[#D5CFC9] text-[#5C5550] hover:bg-[#F5F3F0] text-xs font-bold rounded transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded hover:bg-blue-700 transition"
          >
            {mode === "edit" ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </div>
      </form>
    </AdminFormShell>
  );
}
