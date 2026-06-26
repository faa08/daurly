import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { generateStoreEmail } from "@/backend/sellerService";

type UserRow = { id_user: string; role: string };
type SellerRow = { id_seller: string };

export async function GET() {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "Supabase admin tidak dikonfigurasi." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("seller")
    .select(`*, users(nama_lengkap)`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "Supabase admin tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const nm_store = String(body.nm_store || "").trim();
    const nama_pemilik = String(body.nama_pemilik || "").trim();
    const email = body.email?.trim() || generateStoreEmail(nm_store);
    const no_telp = String(body.no_telp || "");
    const deskripsi = String(body.deskripsi || "");
    const addr = String(body.addr || "Indonesia");
    const nama_bank = String(body.nama_bank || "");
    const no_rek = String(body.no_rek || "");
    const atas_nama_rek = String(body.atas_nama_rek || "");
    const is_verified = body.is_verified !== false;
    const logo_toko = body.logo_toko as string | undefined;

    if (!nm_store || !nama_pemilik) {
      return NextResponse.json(
        { error: "Nama toko dan nama pemilik wajib diisi." },
        { status: 400 }
      );
    }

    let id_user = "";

    const { data: existingUser, error: findUserError } = await admin
      .from("users")
      .select("id_user, role")
      .eq("email", email)
      .maybeSingle<UserRow>();

    if (findUserError) throw findUserError;

    if (existingUser) {
      id_user = existingUser.id_user;
      const updates: Record<string, string> = {};
      if (existingUser.role !== "seller" && existingUser.role !== "admin") {
        updates.role = "seller";
      }
      if (nama_pemilik) updates.nama_lengkap = nama_pemilik;
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await admin
          .from("users")
          .update(updates)
          .eq("id_user", id_user);
        if (updateError) throw updateError;
      }
    } else {
      const generatedId = crypto.randomUUID();
      const generatedUsername = `${email.split("@")[0]}_${Math.random().toString(36).substring(2, 6)}`;
      const { error: createUserError } = await admin.from("users").insert({
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

    const { data: existingSeller } = await admin
      .from("seller")
      .select("id_seller")
      .eq("id_user", id_user)
      .maybeSingle<SellerRow>();

    if (existingSeller) {
      return NextResponse.json(
        { error: "Pengguna ini sudah memiliki toko." },
        { status: 409 }
      );
    }

    const id_seller = crypto.randomUUID();
    const defaultLogo =
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop";

    const { error: insertStoreError } = await admin.from("seller").insert({
      id_seller,
      id_user,
      nm_store,
      deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
      logo_toko: logo_toko || defaultLogo,
      email,
      no_telp,
      addr,
      nama_bank,
      no_rek,
      atas_nama_rek,
      is_verified,
    });

    if (insertStoreError) throw insertStoreError;

    return NextResponse.json({
      id_seller,
      id_user,
      nm_store,
      deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
      logo_toko: logo_toko || defaultLogo,
      email,
      no_telp,
      addr,
      nama_bank,
      no_rek,
      atas_nama_rek,
      created_at: new Date().toISOString(),
      is_verified,
      users: { nama_lengkap: nama_pemilik },
    });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    console.error("API admin/stores POST failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal membuat toko baru." },
      { status: 500 }
    );
  }
}
