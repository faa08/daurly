import { supabase } from "./supabase";

export interface Product {
  id_produk: string;
  id_seller: string;
  nama_produk: string;
  sku: string;
  category: string;
  categorySlug?: string;
  slug?: string;
  harga: number;
  stok: number;
  status: "Aktif" | "Stok Habis" | "Dalam Review";
  img: string;
  desc: string;
  created_at: string;
  nama_brand?: string;
  kode_produk?: string;
  variants?: { label: string; values: string[] }[];
  berat?: number;
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
};

export const productService = {
  // Get all categories
  async getCategories(): Promise<{ id_kategori: string; nama_kategori: string }[]> {
    console.log("Calling productService.getCategories");

    if (isPlaceholder()) {
      return [
        { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
        { id_kategori: "cat-2", nama_kategori: "Tekstil" },
        { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
        { id_kategori: "cat-4", nama_kategori: "Kuliner" }
      ];
    }

    try {
      const { data, error } = await supabase
        .from("kategori")
        .select("*")
        .order("nama_kategori", { ascending: true });

      if (error) {
        console.error("Supabase get categories error:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [
          { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
          { id_kategori: "cat-2", nama_kategori: "Tekstil" },
          { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
          { id_kategori: "cat-4", nama_kategori: "Kuliner" }
        ];
      }

      return data;
    } catch (err) {
      console.error("productService getCategories failed:", err);
      return [];
    }
  },

  // Get all products
  async getProducts(): Promise<Product[]> {
    console.log("Calling productService.getProducts");

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from("produk")
        .select("*, kategori(id_kategori, nama_kategori)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase get products error:", error);
        return [];
      }

      return (data || []).map((p: any) => {
        const rawKategori = Array.isArray(p.kategori) ? p.kategori[0] : p.kategori;
        const catName = rawKategori?.nama_kategori || "UMKM Lokal";
        const catSlug = rawKategori?.nama_kategori ? rawKategori.nama_kategori.toLowerCase() : "kerajinan";

        return {
          id_produk: p.id_produk,
          id_seller: p.id_seller,
          nama_produk: p.nama_produk,
          sku: p.slug ? `SKU-${p.slug.substr(0, 4).toUpperCase()}` : `SKU-${p.id_produk.substr(0, 4).toUpperCase()}`,
          category: catName,
          categorySlug: catSlug,
          slug: p.slug || p.id_produk,
          harga: Number(p.harga),
          stok: p.produk_stock,
          status: p.produk_stock > 0 ? "Aktif" : "Stok Habis",
          img: p.img || "/product-keramik.png",
          desc: p.desc || "",
          created_at: p.created_at,
          nama_brand: p.nama_brand,
          kode_produk: p.kode_produk,
          berat: p.berat || 0
        };
      });
    } catch (err) {
      console.error("productService getProducts failed:", err);
      return [];
    }
  },

  // Get products by seller ID
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    console.log("Calling productService.getProductsBySeller for seller ID:", sellerId);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        return products.filter(p => p.id_seller === sellerId);
      }
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("produk")
        .select("*, kategori(id_kategori, nama_kategori)")
        .eq("id_seller", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase get products by seller error:", error);
        return [];
      }

      return (data || []).map((p: any) => {
        const rawKategori = Array.isArray(p.kategori) ? p.kategori[0] : p.kategori;
        const catName = rawKategori?.nama_kategori || "UMKM Lokal";
        const catSlug = rawKategori?.nama_kategori ? rawKategori.nama_kategori.toLowerCase() : "kerajinan";

        return {
          id_produk: p.id_produk,
          id_seller: p.id_seller,
          nama_produk: p.nama_produk,
          sku: p.slug ? `SKU-${p.slug.substr(0, 4).toUpperCase()}` : `SKU-${p.id_produk.substr(0, 4).toUpperCase()}`,
          category: catName,
          categorySlug: catSlug,
          slug: p.slug || p.id_produk,
          harga: Number(p.harga),
          stok: p.produk_stock,
          status: p.produk_stock > 0 ? "Aktif" : "Stok Habis",
          img: p.img || "/product-keramik.png",
          desc: p.desc || "",
          created_at: p.created_at,
          nama_brand: p.nama_brand,
          kode_produk: p.kode_produk,
          berat: p.berat || 0
        };
      });
    } catch (err) {
      console.error("productService getProductsBySeller failed:", err);
      return [];
    }
  },

  // Add / Publish product
  async addProduct(
    sellerId: string,
    nama_produk: string,
    id_kategori: string | null,
    harga: number,
    stok: number,
    desc: string,
    img?: string,
    status: "Aktif" | "Stok Habis" | "Dalam Review" = "Aktif",
    nama_brand?: string,
    kode_produk?: string,
    berat?: number
  ): Promise<Product | null> {
    console.log("Calling productService.addProduct for product:", nama_produk);

    const generatedId = typeof crypto !== "undefined" ? crypto.randomUUID() : `p-${Math.random().toString(36).substr(2, 9)}`;
    const productSlug = `${slugify(nama_produk)}-${generatedId.substr(0, 4)}`;
    const finalKodeProduk = kode_produk || `PRD-${generatedId.substr(0, 8).toUpperCase()}`;

    // Resolve category name from id_kategori
    let catName = "UMKM Lokal";
    if (id_kategori) {
      const mockCats = [
        { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
        { id_kategori: "cat-2", nama_kategori: "Tekstil" },
        { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
        { id_kategori: "cat-4", nama_kategori: "Kuliner" }
      ];
      const foundMock = mockCats.find(c => c.id_kategori === id_kategori);
      if (foundMock) {
        catName = foundMock.nama_kategori;
      } else if (!isPlaceholder()) {
        try {
          const { data: catData } = await supabase
            .from("kategori")
            .select("nama_kategori")
            .eq("id_kategori", id_kategori)
            .maybeSingle();
          if (catData) {
            catName = catData.nama_kategori;
          }
        } catch (e) {
          console.error("Error resolving category name:", e);
        }
      }
    }

    const newProduct: Product = {
      id_produk: generatedId,
      id_seller: sellerId,
      nama_produk,
      sku: `SKU-${generatedId.substr(0, 4).toUpperCase()}`,
      category: catName,
      harga,
      stok,
      status,
      img: img || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop",
      desc: desc || "Deskripsi produk baru",
      created_at: new Date().toISOString(),
      nama_brand: nama_brand || "UMKM Lokal",
      kode_produk: finalKodeProduk,
      berat: berat || 0
    };

    if (isPlaceholder()) {
      console.warn("Using fallback local storage add product");
      const stored = localStorage.getItem("pelum_products");
      const products = stored ? JSON.parse(stored) : [];
      products.push(newProduct);
      localStorage.setItem("pelum_products", JSON.stringify(products));
      return newProduct;
    }

    const dbCategoryId = id_kategori && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_kategori)
      ? id_kategori
      : null;

    try {
      const { error } = await supabase
        .from("produk")
        .insert({
          id_produk: newProduct.id_produk,
          id_seller: newProduct.id_seller,
          id_kategori: dbCategoryId,
          nama_produk: newProduct.nama_produk,
          slug: productSlug,
          desc: newProduct.desc,
          harga: newProduct.harga,
          produk_stock: newProduct.stok,
          stat_produk: newProduct.stok > 0 ? "tersedia" : "tidak tersedia",
          img: newProduct.img,
          nama_brand: newProduct.nama_brand,
          kode_produk: newProduct.kode_produk,
          berat: newProduct.berat
        });

      if (error) {
        console.error("Supabase insert product error:", error);
        return null;
      }

      return newProduct;
    } catch (err) {
      console.error("productService addProduct failed:", err);
      return null;
    }
  },

  // Update product details
  async updateProduct(
    id_produk: string,
    nama_produk: string,
    id_kategori: string | null,
    harga: number,
    stok: number,
    desc: string,
    img?: string,
    status: "Aktif" | "Stok Habis" | "Dalam Review" = "Aktif",
    nama_brand?: string,
    kode_produk?: string,
    berat?: number
  ): Promise<boolean> {
    console.log("Calling productService.updateProduct for ID:", id_produk);

    if (isPlaceholder()) {
      console.warn("Using fallback local storage update product");
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const idx = products.findIndex(p => p.id_produk === id_produk);
        if (idx !== -1) {
          let catName = "UMKM Lokal";
          if (id_kategori) {
            const mockCats = [
              { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
              { id_kategori: "cat-2", nama_kategori: "Tekstil" },
              { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
              { id_kategori: "cat-4", nama_kategori: "Kuliner" }
            ];
            const foundMock = mockCats.find(c => c.id_kategori === id_kategori);
            if (foundMock) catName = foundMock.nama_kategori;
          }

          products[idx] = {
            ...products[idx],
            nama_produk,
            category: catName,
            harga,
            stok,
            status,
            img: img || products[idx].img,
            desc,
            nama_brand: nama_brand || products[idx].nama_brand,
            kode_produk: kode_produk || products[idx].kode_produk,
            berat: berat || 0
          };
          localStorage.setItem("pelum_products", JSON.stringify(products));
          return true;
        }
      }
      return false;
    }

    const dbCategoryId = id_kategori && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_kategori)
      ? id_kategori
      : null;

    try {
      const { error } = await supabase
        .from("produk")
        .update({
          nama_produk,
          id_kategori: dbCategoryId,
          harga,
          produk_stock: stok,
          stat_produk: stok > 0 ? "tersedia" : "tidak tersedia",
          img,
          desc,
          nama_brand,
          kode_produk,
          berat,
          updated_at: new Date().toISOString()
        })
        .eq("id_produk", id_produk);

      if (error) {
        console.error("Supabase update product error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("productService.updateProduct failed:", err);
      return false;
    }
  },

  // Delete product
  async deleteProduct(sku: string): Promise<boolean> {
    console.log("Calling productService.deleteProduct for SKU / slug suffix:", sku);

    if (isPlaceholder()) {
      console.warn("Using fallback local storage delete product");
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const updated = products.filter(p => p.sku !== sku);
        localStorage.setItem("pelum_products", JSON.stringify(updated));
        return true;
      }
      return false;
    }

    try {
      // Find the product by parsing SKU or deleting matching record.
      // Since SKU is mapped from slug/ID, let's query all products, find the matching one, and delete by id_produk.
      const { data: allProducts, error: fetchErr } = await supabase
        .from("produk")
        .select("id_produk, slug");

      if (fetchErr) {
        console.error("Supabase fetch for delete error:", fetchErr);
        return false;
      }

      const productToDelete = (allProducts || []).find((p: any) => {
        const mappedSku = p.slug ? `SKU-${p.slug.substr(0, 4).toUpperCase()}` : `SKU-${p.id_produk.substr(0, 4).toUpperCase()}`;
        return mappedSku === sku;
      });

      if (!productToDelete) {
        console.error("Product with matching SKU not found for deletion:", sku);
        return false;
      }

      const { error } = await supabase
        .from("produk")
        .delete()
        .eq("id_produk", productToDelete.id_produk);

      if (error) {
        console.error("Supabase delete product error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("productService deleteProduct failed:", err);
      return false;
    }
  },

  // Get product by Slug or UUID ID
  async getProductBySlugOrId(slugOrId: string): Promise<any | null> {
    console.log("Calling productService.getProductBySlugOrId:", slugOrId);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      const products = stored ? JSON.parse(stored) : [];
      const item = products.find((p: any) => p.id_produk === slugOrId || p.slug === slugOrId || p.sku === slugOrId);
      if (item) {
        return {
          ...item,
          // Attach mock seller
          seller: {
            id_seller: item.id_seller,
            nm_store: "Toko Mitra UMKM",
            logo_toko: "",
            is_verified: true
          }
        };
      }
      return null;
    }

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      
      let query = supabase
        .from("produk")
        .select(`
          *,
          seller ( id_seller, nm_store, logo_toko, is_verified ),
          kategori ( id_kategori, nama_kategori )
        `);

      if (isUuid) {
        query = query.eq("id_produk", slugOrId);
      } else {
        query = query.eq("slug", slugOrId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("productService.getProductBySlugOrId failed:", err);
      return null;
    }
  },

  // Get all reviews for a product
  async getProductReviews(productId: string): Promise<any[]> {
    if (isPlaceholder()) {
      const reviews = JSON.parse(localStorage.getItem(`pelum_reviews_${productId}`) || "[]");
      return reviews;
    }

    try {
      const { data, error } = await supabase
        .from("review")
        .select(`
          id_review, rating, komentar, foto_review, created_at,
          users ( nama_lengkap, username, avatar )
        `)
        .eq("id_produk", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((r: any) => {
        const user = Array.isArray(r.users) ? r.users[0] : r.users;
        return {
          id: r.id_review,
          name: user?.nama_lengkap || user?.username || "Pembeli",
          avatar: (user?.nama_lengkap || user?.username || "P").substring(0, 2).toUpperCase(),
          time: new Date(r.created_at).toLocaleDateString("id-ID"),
          rating: r.rating,
          text: r.komentar,
          image: r.foto_review
        };
      });
    } catch (err) {
      console.error("productService.getProductReviews failed:", err);
      return [];
    }
  },

  // Submit product review
  async submitReview(
    userId: string,
    productId: string,
    rating: number,
    comment: string,
    photoReview?: string
  ): Promise<boolean> {
    if (isPlaceholder()) {
      const key = `pelum_reviews_${productId}`;
      const reviews = JSON.parse(localStorage.getItem(key) || "[]");
      
      // Get user name
      const users = JSON.parse(localStorage.getItem("pelum_users") || "[]");
      const user = users.find((u: any) => u.id_user === userId);
      const name = user ? (user.nama_lengkap || user.username) : "Siti Rahayu";
      
      reviews.unshift({
        id: Math.random().toString(36).substring(2, 9),
        name,
        avatar: name.substring(0, 2).toUpperCase(),
        time: "Baru saja",
        rating,
        text: comment,
        image: photoReview || null
      });
      localStorage.setItem(key, JSON.stringify(reviews));
      return true;
    }

    try {
      const { error } = await supabase
        .from("review")
        .insert({
          id_user: userId,
          id_produk: productId,
          rating,
          komentar: comment,
          foto_review: photoReview || null
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("productService.submitReview failed:", err);
      return false;
    }
  },

  // Update product stock
  async updateProductStock(productId: string, newStock: number): Promise<boolean> {
    console.log(`Calling productService.updateProductStock for product ${productId} to ${newStock}`);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const idx = products.findIndex(p => p.id_produk === productId);
        if (idx !== -1) {
          products[idx].stok = newStock;
          products[idx].status = newStock > 0 ? "Aktif" : "Stok Habis";
          localStorage.setItem("pelum_products", JSON.stringify(products));
          return true;
        }
      }
      return false;
    }

    try {
      const stat_produk = newStock > 0 ? "tersedia" : "tidak tersedia";
      const { error } = await supabase
        .from("produk")
        .update({
          produk_stock: newStock,
          stat_produk: stat_produk,
          updated_at: new Date().toISOString()
        })
        .eq("id_produk", productId);

      if (error) {
        console.error("Supabase update stock error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("productService.updateProductStock failed:", err);
      return false;
    }
  }
};
