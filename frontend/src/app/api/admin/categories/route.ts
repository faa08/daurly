import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { client: supabaseAdmin, error: adminErr } = createSupabaseAdmin();
  if (adminErr || !supabaseAdmin) {
    return NextResponse.json(
      { error: adminErr || "Gagal menginisialisasi admin client" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "init") {
      const defaults = ["Fashion Pria", "Tekstil", "Aksesoris", "Kuliner"];
      const payloads = defaults.map((name) => ({ nama_kategori: name }));
      const { error: insertErr } = await supabaseAdmin.from("kategori").insert(payloads);
      if (insertErr) throw insertErr;
      return NextResponse.json({ success: true });
    }

    if (action === "add") {
      const { name } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
      }
      const { error: insertErr } = await supabaseAdmin
        .from("kategori")
        .insert({ nama_kategori: name.trim() });
      if (insertErr) throw insertErr;
      return NextResponse.json({ success: true });
    }

    if (action === "edit") {
      const { id, name } = body;
      if (!id || !name || !name.trim()) {
        return NextResponse.json({ error: "ID dan nama kategori wajib diisi" }, { status: 400 });
      }
      const { error: updateErr } = await supabaseAdmin
        .from("kategori")
        .update({ nama_kategori: name.trim() })
        .eq("id_kategori", id);
      if (updateErr) throw updateErr;
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "ID kategori wajib diisi" }, { status: 400 });
      }

      // Check count of products referencing this category
      const { count, error: countErr } = await supabaseAdmin
        .from("produk")
        .select("*", { count: "exact", head: true })
        .eq("id_kategori", id);
      if (countErr) throw countErr;

      if (count && count > 0) {
        return NextResponse.json(
          { error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${count} produk.` },
          { status: 400 }
        );
      }

      const { error: deleteErr } = await supabaseAdmin
        .from("kategori")
        .delete()
        .eq("id_kategori", id);
      if (deleteErr) throw deleteErr;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    console.error("API admin categories POST failed:", err);
    return NextResponse.json({ error: err.message || "Gagal memproses data" }, { status: 500 });
  }
}
