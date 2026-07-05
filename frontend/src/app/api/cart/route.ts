import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth, denyForeignUser } from "@/lib/api-auth";import {
  applyInventoryDeduction,
  getStockForPicks,
  parseVariantRaw,
  picksEqual,
} from "@/lib/variantInventory";

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
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const queryUserId = request.nextUrl.searchParams.get("userId");
  const denied = denyForeignUser(auth.ctx, queryUserId);
  if (denied) return denied;

  const userId = auth.ctx.user.id_user;
  const admin = auth.ctx.admin;
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
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const bodyUserId = body.userId ? String(body.userId) : null;
    if (bodyUserId) {
      const denied = denyForeignUser(auth.ctx, bodyUserId);
      if (denied) return denied;
    }
    const userId = auth.ctx.user.id_user;
    if (action === "add") {
      const productId = String(body.productId || "");
      const qty = Math.max(1, Number(body.qty) || 1);
      const setQty = Boolean(body.setQty);
      const variantPicks = Array.isArray(body.variantPicks)
        ? body.variantPicks.map((n: unknown) => Number(n)).filter((n: number) => !Number.isNaN(n))
        : [];
      if (!productId) {
        return NextResponse.json({ error: "productId wajib." }, { status: 400 });
      }


      const { data: productRow, error: productErr } = await admin
        .from("produk")
        .select("id_produk, produk_stock, stat_produk, varian")
        .eq("id_produk", productId)
        .maybeSingle();
      if (productErr) throw productErr;
      if (!productRow) {
        return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
      }

      const { inventory } = parseVariantRaw(productRow.varian);
      const availableStock = getStockForPicks(
        inventory,
        variantPicks,
        Number(productRow.produk_stock)
      );
      if (availableStock < qty) {
        return NextResponse.json(
          { error: `Stok tidak mencukupi (tersisa ${availableStock}).` },
          { status: 400 }
        );
      }

      const cartId = await getOrCreateCartId(admin, userId);
      const { data: existingItems, error: findError } = await admin
        .from("cart_item")
        .select("id_cart_item, qty_cartitem, pilihan_varian")
        .eq("id_cart", cartId)
        .eq("id_produk", productId);

      if (findError) throw findError;

      const existing = (existingItems || []).find((row) => {
        const rowPicks = (row.pilihan_varian as { picks?: number[] } | null)?.picks;
        return picksEqual(
          rowPicks,
          variantPicks.length > 0 ? variantPicks : null
        );
      });

      if (existing) {
        const newQty = setQty ? qty : existing.qty_cartitem + qty;
        if (availableStock < newQty) {
          return NextResponse.json(
            { error: `Stok tidak mencukupi (tersisa ${availableStock}).` },
            { status: 400 }
          );
        }
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
          pilihan_varian: variantPicks.length > 0 ? { picks: variantPicks } : null,
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

      const { data: owned } = await admin
        .from("cart_item")
        .select("id_cart, cart!inner(id_user)")
        .eq("id_cart_item", cartItemId)
        .maybeSingle();
      const cartOwner = (owned?.cart as { id_user?: string } | { id_user?: string }[] | null);
      const ownerId = Array.isArray(cartOwner) ? cartOwner[0]?.id_user : cartOwner?.id_user;
      if (ownerId !== userId) {
        return NextResponse.json({ error: "Item keranjang tidak ditemukan." }, { status: 404 });
      }

      const { error } = await admin        .from("cart_item")
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

      const { data: owned } = await admin
        .from("cart_item")
        .select("id_cart, cart!inner(id_user)")
        .eq("id_cart_item", cartItemId)
        .maybeSingle();
      const cartOwner = (owned?.cart as { id_user?: string } | { id_user?: string }[] | null);
      const ownerId = Array.isArray(cartOwner) ? cartOwner[0]?.id_user : cartOwner?.id_user;
      if (ownerId !== userId) {
        return NextResponse.json({ error: "Item keranjang tidak ditemukan." }, { status: 404 });
      }

      const { error } = await admin.from("cart_item").delete().eq("id_cart_item", cartItemId);      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "clear") {
      const cartId = await getOrCreateCartId(admin, userId);      const { error } = await admin.from("cart_item").delete().eq("id_cart", cartId);
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
