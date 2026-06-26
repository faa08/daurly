import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type CartRow = {
  id_cart_item: string;
  id_cart: string;
  id_produk: string;
  qty_cartitem: number;
  added_at: string;
  produk: {
    nama_produk: string;
    harga: number;
    img: string;
    slug?: string;
    id_seller: string;
    berat: number;
    seller: { nm_store: string } | { nm_store: string }[] | null;
  } | null;
};

function mapCartItems(data: CartRow[]) {
  return (data || []).map((item) => ({
    id_cart_item: item.id_cart_item,
    id_cart: item.id_cart,
    id_produk: item.id_produk,
    qty_cartitem: item.qty_cartitem,
    added_at: item.added_at,
    produk: item.produk
      ? {
          nama_produk: item.produk.nama_produk,
          harga: Number(item.produk.harga),
          img: item.produk.img,
          slug: item.produk.slug,
          id_seller: item.produk.id_seller,
          berat: item.produk.berat || 0,
          nm_store: Array.isArray(item.produk.seller)
            ? item.produk.seller[0]?.nm_store
            : item.produk.seller?.nm_store,
        }
      : undefined,
  }));
}

async function getOrCreateCartId(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>["client"]>,
  userId: string
): Promise<string> {
  const { data: cart, error: selectError } = await admin
    .from("cart")
    .select("id_cart")
    .eq("id_user", userId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (cart?.id_cart) return cart.id_cart;

  const { data: newCart, error: insertError } = await admin
    .from("cart")
    .insert({ id_user: userId })
    .select("id_cart")
    .single();

  if (insertError) throw insertError;
  return newCart.id_cart;
}

const CART_SELECT = `
  id_cart_item, id_cart, id_produk, qty_cartitem, added_at,
  produk (
    nama_produk, harga, img, slug, id_seller, berat,
    seller ( nm_store )
  )
`;

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId wajib." }, { status: 400 });
  }

  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: configError || "Database admin tidak dikonfigurasi." },
      { status: 503 }
    );
  }

  try {
    const cartId = await getOrCreateCartId(admin, userId);
    const { data, error } = await admin
      .from("cart_item")
      .select(CART_SELECT)
      .eq("id_cart", cartId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: mapCartItems((data || []) as unknown as CartRow[]) });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    console.error("API cart GET failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal memuat keranjang." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: configError || "Database admin tidak dikonfigurasi." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "add") {
      const userId = String(body.userId || "");
      const productId = String(body.productId || "");
      const qty = Math.max(1, Number(body.qty) || 1);
      const setQty = Boolean(body.setQty);
      if (!userId || !productId) {
        return NextResponse.json({ error: "userId dan productId wajib." }, { status: 400 });
      }

      const { data: userRow, error: userErr } = await admin
        .from("users")
        .select("id_user")
        .eq("id_user", userId)
        .maybeSingle();
      if (userErr) throw userErr;
      if (!userRow) {
        return NextResponse.json(
          { error: "Akun tidak ditemukan. Silakan keluar lalu masuk kembali." },
          { status: 400 }
        );
      }

      const { data: productRow, error: productErr } = await admin
        .from("produk")
        .select("id_produk, produk_stock, stat_produk")
        .eq("id_produk", productId)
        .maybeSingle();
      if (productErr) throw productErr;
      if (!productRow) {
        return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
      }
      if (Number(productRow.produk_stock) < qty) {
        return NextResponse.json(
          { error: `Stok tidak mencukupi (tersisa ${productRow.produk_stock}).` },
          { status: 400 }
        );
      }

      const cartId = await getOrCreateCartId(admin, userId);
      const { data: existing, error: findError } = await admin
        .from("cart_item")
        .select("id_cart_item, qty_cartitem")
        .eq("id_cart", cartId)
        .eq("id_produk", productId)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        const newQty = setQty ? qty : existing.qty_cartitem + qty;
        const { error } = await admin
          .from("cart_item")
          .update({ qty_cartitem: newQty })
          .eq("id_cart_item", existing.id_cart_item);
        if (error) throw error;
        return NextResponse.json({ ok: true, id_cart_item: existing.id_cart_item });
      }

      const { data: inserted, error: insertError } = await admin
        .from("cart_item")
        .insert({
          id_cart: cartId,
          id_produk: productId,
          qty_cartitem: qty,
        })
        .select("id_cart_item")
        .single();

      if (insertError) throw insertError;
      return NextResponse.json({ ok: true, id_cart_item: inserted.id_cart_item });
    }

    if (action === "update") {
      const cartItemId = String(body.cartItemId || "");
      const qty = Math.max(1, Number(body.qty) || 1);
      if (!cartItemId) {
        return NextResponse.json({ error: "cartItemId wajib." }, { status: 400 });
      }

      const { error } = await admin
        .from("cart_item")
        .update({ qty_cartitem: qty })
        .eq("id_cart_item", cartItemId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "remove") {
      const cartItemId = String(body.cartItemId || "");
      if (!cartItemId) {
        return NextResponse.json({ error: "cartItemId wajib." }, { status: 400 });
      }

      const { error } = await admin.from("cart_item").delete().eq("id_cart_item", cartItemId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "clear") {
      const userId = String(body.userId || "");
      if (!userId) {
        return NextResponse.json({ error: "userId wajib." }, { status: 400 });
      }

      const cartId = await getOrCreateCartId(admin, userId);
      const { error } = await admin.from("cart_item").delete().eq("id_cart", cartId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action tidak dikenal." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    console.error("API cart POST failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Operasi keranjang gagal." },
      { status: 500 }
    );
  }
}
