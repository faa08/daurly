import { supabase } from "./supabase";
import { productService } from "./productService";
import { apiFetch } from "@/lib/api-client";

export interface UpdateSellerInput {
  nm_store?: string;
  deskripsi?: string;
  logo_toko?: string;
  no_telp?: string;
  addr?: string;
  nama_bank?: string;
  no_rek?: string;
  atas_nama_rek?: string;
  is_verified?: boolean;
  nama_pemilik?: string;
}

export interface Seller {
  id_seller: string;
  id_user: string;
  nm_store: string;
  deskripsi: string;
  logo_toko: string;
  email: string;
  no_telp: string;
  addr: string;
  nama_bank: string;
  no_rek: string;
  atas_nama_rek: string;
  created_at: string;
  is_verified?: boolean;
  users?: {
    nama_lengkap: string;
  };
}

export interface StoreStats {
  productCount: number;
  followerCount: number;
  avgRating: number;
  reviewCount: number;
  totalSold: number;
  joinedAt: string;
}

const IKUT_TOKO_KEY = "pelum_ikut_toko";

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

function errorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    return e.message || e.details || e.hint || fallbackForObject(err);
  }
  return String(err);
}

function fallbackForObject(err: object): string {
  try {
    return JSON.stringify(err);
  } catch {
    return "Terjadi kesalahan database.";
  }
}

function formatDbError(err: unknown, fallback: string): string {
  const msg = errorToMessage(err) || fallback;
  if (msg.includes("row-level security") || msg.includes("RLS")) {
    return "Akses database ditolak (RLS). Jalankan bagian RLS/MIGRASI di db.sql di Supabase SQL Editor.";
  }
  if (msg.includes("Invalid API key") || msg.includes("invalid api key")) {
    return "API key tidak valid. Pastikan URL dan anon key di .env.local dari project Supabase yang sama.";
  }
  if (msg.includes("23505") || msg.includes("duplicate")) {
    return "Email atau username toko sudah terdaftar. Coba lagi.";
  }
  if (msg.includes("could not find") || msg.includes("pgrst205") || msg.includes("ikut_toko")) {
    return "Tabel pengikut toko belum dibuat. Jalankan bagian MIGRASI ikut_toko di db.sql di Supabase SQL Editor.";
  }
  return msg;
}

/** Slug URL toko dari nama toko — dipakai di /toko/[slug] */
export function storeNameToSlug(nm_store: string): string {
  return nm_store
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Email unik per toko — hindari bentrok UNIQUE constraint di users/seller */
export function generateStoreEmail(storeName: string): string {
  const slug =
    storeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9.]/g, "")
      .replace(/\.+/g, ".")
      .replace(/^\.+|\.+$/g, "") || "toko";
  const suffix =
    typeof crypto !== "undefined"
      ? crypto.randomUUID().replace(/-/g, "").substring(0, 8)
      : Date.now().toString(36);
  return `${slug}.${suffix}@daurly.id`;
}

/** Insert toko langsung via anon key (cocok jika RLS users/seller sudah dimatikan) */
async function createStoreDirect(
  nm_store: string,
  email: string,
  no_telp: string,
  deskripsi: string,
  addr: string,
  nama_bank: string,
  no_rek: string,
  atas_nama_rek: string,
  is_verified: boolean,
  nama_pemilik?: string,
  logo_toko?: string
): Promise<Seller> {
  let id_user = "";

  const { data: existingUser, error: findUserError } = await supabase
    .from("users")
    .select("id_user, role")
    .eq("email", email)
    .maybeSingle();

  if (findUserError) throw findUserError;

  if (existingUser) {
    id_user = existingUser.id_user;
    const updates: Record<string, string> = {};
    if (existingUser.role !== "seller" && existingUser.role !== "admin") {
      updates.role = "seller";
    }
    if (nama_pemilik) updates.nama_lengkap = nama_pemilik;
    if (Object.keys(updates).length > 0) {
      const { error: updateRoleError } = await supabase
        .from("users")
        .update(updates)
        .eq("id_user", id_user);
      if (updateRoleError) throw updateRoleError;
    }
  } else {
    const generatedId =
      typeof crypto !== "undefined" ? crypto.randomUUID() : `u-${Math.random().toString(36).substring(2, 11)}`;
    const generatedUsername = `${email.split("@")[0]}_${Math.random().toString(36).substring(2, 6)}`;
    const { error: createUserError } = await supabase.from("users").insert({
      id_user: generatedId,
      username: generatedUsername,
      email,
      nama_lengkap: nama_pemilik || nm_store,
      no_telp,
      password: "no-password-plain",
      role: "seller",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    });
    if (createUserError) throw createUserError;
    id_user = generatedId;
  }

  const { data: existingSeller } = await supabase
    .from("seller")
    .select("id_seller")
    .eq("id_user", id_user)
    .maybeSingle();

  if (existingSeller) {
    throw new Error("Pengguna ini sudah memiliki toko.");
  }

  const id_seller =
    typeof crypto !== "undefined" ? crypto.randomUUID() : `s-${Math.random().toString(36).substring(2, 11)}`;
  const defaultLogo =
    "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop";

  const { error: insertStoreError } = await supabase.from("seller").insert({
    id_seller,
    id_user,
    nm_store,
    deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
    logo_toko: logo_toko || defaultLogo,
    email,
    no_telp,
    addr: addr || "Indonesia",
    nama_bank,
    no_rek,
    atas_nama_rek,
    is_verified,
  });

  if (insertStoreError) throw insertStoreError;

  return {
    id_seller,
    id_user,
    nm_store,
    deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
    logo_toko: logo_toko || defaultLogo,
    email,
    no_telp,
    addr: addr || "Indonesia",
    nama_bank,
    no_rek,
    atas_nama_rek,
    created_at: new Date().toISOString(),
    is_verified,
  };
}

export const sellerService = {
  // Retrieve seller profile by user ID
  async getSellerByUserId(userId: string): Promise<Seller | null> {
    console.log("Calling sellerService.getSellerByUserId for:", userId);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      return sellers.find((s: any) => s.id_user === userId) || null;
    }

    try {
      const { data, error } = await supabase
        .from("seller")
        .select("*")
        .eq("id_user", userId)
        .single();

      if (error) {
        console.error("Supabase get seller error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("sellerService getSellerByUserId failed:", err);
      return null;
    }
  },

  // Get all sellers/stores (for superadmin management)
  async getSellers(): Promise<Seller[]> {
    console.log("Calling sellerService.getSellers");

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      const storedUsers = localStorage.getItem("pelum_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      return sellers.map((s: any) => {
        const foundUser = users.find((u: any) => u.id_user === s.id_user);
        return {
          ...s,
          users: foundUser ? { nama_lengkap: foundUser.nama_lengkap } : { nama_lengkap: "Tanpa Nama" }
        };
      });
    }

    try {
      const { data, error } = await supabase
        .from("seller")
        .select(`*, users(nama_lengkap)`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data;
      }

      if (error) {
        console.warn("getSellers direct failed:", errorToMessage(error));
        throw new Error(formatDbError(error, "Gagal memuat daftar toko"));
      }
      return [];
    } catch (err) {
      console.error("sellerService getSellers failed:", err);
      throw err;
    }
  },

  async searchStores(query: string, limit = 5): Promise<(Seller & { slug: string })[]> {
    const q = query.trim();
    if (!q) return [];

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers: Seller[] = stored ? JSON.parse(stored) : [];
      const lower = q.toLowerCase();
      return sellers
        .filter(
          (s) =>
            s.nm_store?.toLowerCase().includes(lower) ||
            (s.deskripsi && s.deskripsi.toLowerCase().includes(lower))
        )
        .slice(0, limit)
        .map((s) => ({ ...s, slug: storeNameToSlug(s.nm_store) }));
    }

    try {
      const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
      const { data, error } = await supabase
        .from("seller")
        .select(`*, users(nama_lengkap)`)
        .eq("is_verified", true)
        .or(`nm_store.ilike.${pattern},deskripsi.ilike.${pattern}`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map((s) => ({
        ...(s as Seller),
        slug: storeNameToSlug((s as Seller).nm_store),
      }));
    } catch (err) {
      console.error("sellerService.searchStores failed:", err);
      return [];
    }
  },

  // Get seller by ID or slug/name
  async getSellerByIdOrSlug(idOrSlug: string): Promise<Seller | null> {
    console.log("Calling sellerService.getSellerByIdOrSlug:", idOrSlug);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      return (
        sellers.find(
          (s: any) =>
            s.id_seller === idOrSlug ||
            storeNameToSlug(s.nm_store || "") === idOrSlug
        ) || null
      );
    }

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      if (isUuid) {
        const { data, error } = await supabase
          .from("seller")
          .select("*")
          .eq("id_seller", idOrSlug)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      // Slug lookup strategy:
      // storeNameToSlug() is a lossy function (strips non-word chars, lowercases, etc.)
      // so we cannot reliably reverse it via SQL. Instead, fetch all sellers and
      // compare slugs client-side using the same function.
      const { data: allSellers, error } = await supabase
        .from("seller")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getSellerByIdOrSlug: failed to fetch sellers:", error.message);
        throw error;
      }

      if (!allSellers || allSellers.length === 0) {
        console.warn("getSellerByIdOrSlug: no sellers found in database");
        return null;
      }

      // Find exact slug match
      const match = allSellers.find(
        (s) => storeNameToSlug(s.nm_store || "") === idOrSlug
      );

      if (match) return match;

      // Fallback: try partial name match (handles edge cases)
      const slugLower = idOrSlug.toLowerCase();
      const partialMatch = allSellers.find(
        (s) => (s.nm_store || "").toLowerCase().replace(/\s+/g, "-") === slugLower
      );

      if (partialMatch) return partialMatch;

      console.warn(
        `getSellerByIdOrSlug: no seller matched slug "${idOrSlug}". ` +
        `Available slugs: ${allSellers.map((s) => storeNameToSlug(s.nm_store || "")).join(", ")}`
      );
      return null;
    } catch (err) {
      console.error("sellerService.getSellerByIdOrSlug failed:", err);
      return null;
    }
  },

  // Admin: Create a new store/toko
  async createStore(
    nm_store: string,
    email: string,
    no_telp: string,
    deskripsi: string,
    addr: string,
    nama_bank: string,
    no_rek: string,
    atas_nama_rek: string,
    is_verified: boolean = true,
    nama_pemilik?: string,
    logo_toko?: string
  ): Promise<Seller | null> {
    console.log("Calling sellerService.createStore for:", nm_store);

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      let foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        const generatedUsername = email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 4);
        foundUser = {
          id_user: `u-${Math.random().toString(36).substr(2, 9)}`,
          username: generatedUsername,
          email: email,
          nama_lengkap: nama_pemilik || nm_store,
          no_telp: no_telp || "",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
          role: "seller",
          created_at: new Date().toISOString()
        };
        users.push(foundUser);
        localStorage.setItem("pelum_users", JSON.stringify(users));
      } else {
        foundUser.role = "seller";
        if (nama_pemilik) foundUser.nama_lengkap = nama_pemilik;
        localStorage.setItem("pelum_users", JSON.stringify(users));
      }
      const id_user = foundUser.id_user;

      const storedSellers = localStorage.getItem("pelum_sellers");
      const sellers = storedSellers ? JSON.parse(storedSellers) : [];
      
      if (sellers.some((s: any) => s.id_user === id_user)) {
        console.error("User with this email is already a seller.");
        return null;
      }

      const newStore: Seller = {
        id_seller: `s-${Math.random().toString(36).substr(2, 9)}`,
        id_user,
        nm_store,
        deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
        logo_toko: logo_toko || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
        email,
        no_telp,
        addr: addr || "Indonesia",
        nama_bank,
        no_rek,
        atas_nama_rek,
        created_at: new Date().toISOString(),
        is_verified
      };

      sellers.push(newStore);
      localStorage.setItem("pelum_sellers", JSON.stringify(sellers));
      return newStore;
    }

    try {
      // Langsung ke Supabase (anon key) — jalan jika RLS users/seller sudah dimatikan
      return await createStoreDirect(
        nm_store,
        email,
        no_telp,
        deskripsi,
        addr,
        nama_bank,
        no_rek,
        atas_nama_rek,
        is_verified,
        nama_pemilik,
        logo_toko
      );
    } catch (directErr: unknown) {
      const directMsg = errorToMessage(directErr);
      console.warn("createStore direct failed, trying API:", directMsg);

      try {
        const apiRes = await apiFetch("/api/admin/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nm_store,
            email,
            no_telp,
            deskripsi,
            addr,
            nama_bank,
            no_rek,
            atas_nama_rek,
            is_verified,
            nama_pemilik,
            logo_toko,
          }),
        });

        const apiData = await apiRes.json();
        if (apiRes.ok) {
          return apiData as Seller;
        }

        const apiErr = (apiData as { error?: string }).error || "Gagal membuat toko baru.";
        throw new Error(formatDbError(directErr, directMsg) || apiErr);
      } catch (err: unknown) {
        console.error("sellerService.createStore failed:", errorToMessage(err));
        throw new Error(formatDbError(err, formatDbError(directErr, "Gagal membuat toko baru.")));
      }
    }
  },

  // Admin: Verify/Unverify a seller
  async verifySeller(id: string, is_verified: boolean = true): Promise<boolean> {
    console.log(`Calling sellerService.verifySeller for ${id} to ${is_verified}`);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      if (stored) {
        const sellers = JSON.parse(stored) as Seller[];
        const idx = sellers.findIndex(s => s.id_seller === id);
        if (idx !== -1) {
          sellers[idx].is_verified = is_verified;
          localStorage.setItem("pelum_sellers", JSON.stringify(sellers));
          return true;
        }
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("seller")
        .update({ is_verified })
        .eq("id_seller", id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("sellerService.verifySeller failed:", err);
      return false;
    }
  },

  // Admin: Update seller/store data
  async updateSeller(id: string, data: UpdateSellerInput): Promise<boolean> {
    console.log("Calling sellerService.updateSeller for:", id);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      if (!stored) return false;

      const sellers = JSON.parse(stored) as Seller[];
      const idx = sellers.findIndex((s) => s.id_seller === id);
      if (idx === -1) return false;

      const { nama_pemilik, ...sellerFields } = data;
      sellers[idx] = { ...sellers[idx], ...sellerFields };
      localStorage.setItem("pelum_sellers", JSON.stringify(sellers));

      if (nama_pemilik && sellers[idx].id_user) {
        const storedUsers = localStorage.getItem("pelum_users");
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userIdx = users.findIndex((u: { id_user: string }) => u.id_user === sellers[idx].id_user);
          if (userIdx !== -1) {
            users[userIdx].nama_lengkap = nama_pemilik;
            localStorage.setItem("pelum_users", JSON.stringify(users));
          }
        }
      }
      return true;
    }

    try {
      const { nama_pemilik, ...sellerFields } = data;
      if (Object.keys(sellerFields).length > 0) {
        const { error } = await supabase.from("seller").update(sellerFields).eq("id_seller", id);
        if (error) throw error;
      }

      if (nama_pemilik) {
        const seller = await this.getSellerByIdOrSlug(id);
        if (seller?.id_user) {
          const { error: userError } = await supabase
            .from("users")
            .update({ nama_lengkap: nama_pemilik })
            .eq("id_user", seller.id_user);
          if (userError) throw userError;
        }
      }
      return true;
    } catch (err) {
      console.error("sellerService.updateSeller failed:", err);
      return false;
    }
  },

  // Admin: Delete a seller and all related products
  async deleteSeller(id: string): Promise<boolean> {
    console.log("Calling sellerService.deleteSeller for:", id);

    const productsDeleted = await productService.deleteProductsBySeller(id);
    if (!productsDeleted) {
      console.error("Failed to delete products for seller:", id);
      return false;
    }

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      if (stored) {
        const sellers = JSON.parse(stored) as Seller[];
        const updated = sellers.filter((s) => s.id_seller !== id);
        localStorage.setItem("pelum_sellers", JSON.stringify(updated));
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase.from("seller").delete().eq("id_seller", id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("sellerService.deleteSeller failed:", err);
      return false;
    }
  },

  async getStoreStats(sellerId: string): Promise<StoreStats> {
    const empty: StoreStats = {
      productCount: 0,
      followerCount: 0,
      avgRating: 0,
      reviewCount: 0,
      totalSold: 0,
      joinedAt: "",
    };

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      const products = stored ? (JSON.parse(stored) as { id_seller?: string }[]) : [];
      const follows = JSON.parse(localStorage.getItem(IKUT_TOKO_KEY) || "[]") as { id_user: string; id_seller: string }[];
      return {
        ...empty,
        productCount: products.filter((p) => p.id_seller === sellerId).length,
        followerCount: follows.filter((f) => f.id_seller === sellerId).length,
      };
    }

    try {
      const [productRes, followerRes, reviewRes, sellerRes, orderRes] = await Promise.all([
        supabase.from("produk").select("id_produk", { count: "exact", head: true }).eq("id_seller", sellerId),
        supabase.from("ikut_toko").select("*", { count: "exact", head: true }).eq("id_seller", sellerId),
        supabase.from("review_toko").select("rating").eq("id_seller", sellerId),
        supabase.from("seller").select("created_at").eq("id_seller", sellerId).maybeSingle(),
        supabase.from("order").select("id_order").eq("id_seller", sellerId).eq("stat_order", "selesai"),
      ]);

      const ratings = (reviewRes.data || []).map((r) => Number(r.rating));
      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0;

      let totalSold = 0;
      const orderIds = (orderRes.data || []).map((o) => o.id_order);
      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from("order_item")
          .select("qty_orderitem")
          .in("id_order", orderIds);
        totalSold = (items || []).reduce((sum, item) => sum + Number(item.qty_orderitem), 0);
      }

      return {
        productCount: productRes.count ?? 0,
        followerCount: followerRes.count ?? 0,
        avgRating,
        reviewCount: ratings.length,
        totalSold,
        joinedAt: (sellerRes.data?.created_at as string) || "",
      };
    } catch (err) {
      console.error("sellerService.getStoreStats failed:", err);
      return empty;
    }
  },

  async isFollowingStore(userId: string, sellerId: string): Promise<boolean> {
    if (isPlaceholder()) {
      const follows = JSON.parse(localStorage.getItem(IKUT_TOKO_KEY) || "[]") as { id_user: string; id_seller: string }[];
      return follows.some((f) => f.id_user === userId && f.id_seller === sellerId);
    }

    try {
      const res = await apiFetch(
        `/api/toko/follow?userId=${encodeURIComponent(userId)}&sellerId=${encodeURIComponent(sellerId)}`
      );
      const data = await res.json();
      if (!res.ok) return false;
      return !!data.following;
    } catch (err) {
      console.error("sellerService.isFollowingStore failed:", err);
      return false;
    }
  },

  async followStore(userId: string, sellerId: string): Promise<{ ok: boolean; error?: string }> {
    if (isPlaceholder()) {
      const follows = JSON.parse(localStorage.getItem(IKUT_TOKO_KEY) || "[]") as { id_user: string; id_seller: string }[];
      if (!follows.some((f) => f.id_user === userId && f.id_seller === sellerId)) {
        follows.push({ id_user: userId, id_seller: sellerId });
        localStorage.setItem(IKUT_TOKO_KEY, JSON.stringify(follows));
      }
      return { ok: true };
    }

    try {
      const res = await apiFetch("/api/toko/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sellerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Gagal mengikuti toko." };
      }
      return { ok: true };
    } catch (err) {
      console.error("sellerService.followStore failed:", err);
      return { ok: false, error: "Gagal menghubungi server." };
    }
  },

  async unfollowStore(userId: string, sellerId: string): Promise<{ ok: boolean; error?: string }> {
    if (isPlaceholder()) {
      const follows = JSON.parse(localStorage.getItem(IKUT_TOKO_KEY) || "[]") as { id_user: string; id_seller: string }[];
      localStorage.setItem(
        IKUT_TOKO_KEY,
        JSON.stringify(follows.filter((f) => !(f.id_user === userId && f.id_seller === sellerId)))
      );
      return { ok: true };
    }

    try {
      const res = await apiFetch(
        `/api/toko/follow?userId=${encodeURIComponent(userId)}&sellerId=${encodeURIComponent(sellerId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Gagal berhenti mengikuti toko." };
      }
      return { ok: true };
    } catch (err) {
      console.error("sellerService.unfollowStore failed:", err);
      return { ok: false, error: "Gagal menghubungi server." };
    }
  },
};
