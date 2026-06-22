import { supabase } from "./supabase";

export interface ProductVariant {
  label: string;
  values: string[];
}

export interface Product {
  id_produk: string;
  id_seller: string;
  nama_produk: string;
  sku: string;
  slug?: string;
  category: string;
  harga: number;
  stok: number;
  status: "Aktif" | "Stok Habis" | "Dalam Review";
  img: string;
  desc: string;
  colors?: string[];
  sizes?: string[];
  variants?: ProductVariant[];
  created_at: string;
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

const parseDescription = (rawDesc: string) => {
  let desc = rawDesc || "";
  let colors: string[] = [];
  let sizes: string[] = [];
  let variants: ProductVariant[] = [];
  try {
    if (rawDesc && rawDesc.trim().startsWith("{")) {
      const parsed = JSON.parse(rawDesc);
      desc = parsed.mainDesc || "";
      colors = parsed.colors || [];
      sizes = parsed.sizes || [];
      variants = parsed.variants || [];
      
      // Fallback conversion for compatibility with old format
      if (variants.length === 0) {
        if (colors.length > 0) {
          variants.push({ label: "Warna", values: colors });
        }
        if (sizes.length > 0) {
          variants.push({ label: "Ukuran", values: sizes });
        }
      }
    }
  } catch (e) {
    // Keep raw
  }
  return { desc, colors, sizes, variants };
};

export const productService = {
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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase get products error:", error);
        return [];
      }

      return (data || []).map((p: any) => {
        const parsed = parseDescription(p.desc);
        return {
          id_produk: p.id_produk,
          id_seller: p.id_seller,
          nama_produk: p.nama_produk,
          sku: p.slug ? `SKU-${p.slug.substr(0, 4).toUpperCase()}` : `SKU-${p.id_produk.substr(0, 4).toUpperCase()}`,
          slug: p.slug || p.id_produk,
          category: p.category || "UMKM Lokal",
          harga: Number(p.harga),
          stok: p.produk_stock,
          status: p.produk_stock > 0 ? "Aktif" : "Stok Habis",
          img: p.img || "/product-keramik.png",
          desc: parsed.desc,
          colors: parsed.colors,
          sizes: parsed.sizes,
          variants: parsed.variants,
          created_at: p.created_at
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
        .select("*")
        .eq("id_seller", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase get products by seller error:", error);
        return [];
      }

      return (data || []).map((p: any) => {
        const parsed = parseDescription(p.desc);
        return {
          id_produk: p.id_produk,
          id_seller: p.id_seller,
          nama_produk: p.nama_produk,
          sku: p.slug ? `SKU-${p.slug.substr(0, 4).toUpperCase()}` : `SKU-${p.id_produk.substr(0, 4).toUpperCase()}`,
          slug: p.slug || p.id_produk,
          category: p.category || "UMKM Lokal",
          harga: Number(p.harga),
          stok: p.produk_stock,
          status: p.produk_stock > 0 ? "Aktif" : "Stok Habis",
          img: p.img || "/product-keramik.png",
          desc: parsed.desc,
          colors: parsed.colors,
          sizes: parsed.sizes,
          variants: parsed.variants,
          created_at: p.created_at
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
    category: string,
    harga: number,
    stok: number,
    desc: string,
    status: "Aktif" | "Stok Habis" | "Dalam Review" = "Aktif",
    img?: string,
    colors?: string[],
    sizes?: string[],
    variants?: ProductVariant[]
  ): Promise<Product | null> {
    console.log("Calling productService.addProduct for product:", nama_produk);

    const generatedId = typeof crypto !== "undefined" ? crypto.randomUUID() : `p-${Math.random().toString(36).substr(2, 9)}`;
    const productSlug = `${slugify(nama_produk)}-${generatedId.substr(0, 4)}`;

    const newProduct: Product = {
      id_produk: generatedId,
      id_seller: sellerId,
      nama_produk,
      sku: `SKU-${generatedId.substr(0, 4).toUpperCase()}`,
      slug: productSlug,
      category,
      harga,
      stok,
      status,
      img: img || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop",
      desc,
      colors: colors || [],
      sizes: sizes || [],
      variants: variants || [],
      created_at: new Date().toISOString()
    };

    const dbDesc = JSON.stringify({
      mainDesc: desc,
      colors: colors || [],
      sizes: sizes || [],
      variants: variants || []
    });

    if (isPlaceholder()) {
      console.warn("Using fallback local storage add product");
      const stored = localStorage.getItem("pelum_products");
      const products = stored ? JSON.parse(stored) : [];
      products.push(newProduct);
      localStorage.setItem("pelum_products", JSON.stringify(products));
      return newProduct;
    }

    try {
      const { error } = await supabase
        .from("produk")
        .insert({
          id_produk: newProduct.id_produk,
          id_seller: newProduct.id_seller,
          nama_produk: newProduct.nama_produk,
          slug: productSlug,
          desc: dbDesc,
          harga: newProduct.harga,
          produk_stock: newProduct.stok,
          stat_produk: newProduct.stok > 0 ? "tersedia" : "tidak tersedia",
          img: newProduct.img
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
  }
};
