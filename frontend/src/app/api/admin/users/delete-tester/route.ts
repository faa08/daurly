import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "ID pengguna diperlukan." }, { status: 400 });
    }

    const { client: admin, error: adminErr } = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: adminErr || "Service role tidak tersedia." },
        { status: 503 }
      );
    }

    // 1. Fetch user to verify they have the 'tester' role
    const { data: userProfile, error: selectErr } = await admin
      .from("users")
      .select("role")
      .eq("id_user", userId)
      .maybeSingle();

    if (selectErr || !userProfile) {
      return NextResponse.json(
        { error: selectErr?.message || "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    if (userProfile.role !== "tester") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya akun dengan peran 'tester' yang dapat dihapus." },
        { status: 403 }
      );
    }

    // 2. Delete user from public.users table (this will cascade delete addresses, carts, etc.)
    const { error: dbError } = await admin
      .from("users")
      .delete()
      .eq("id_user", userId);

    if (dbError) {
      console.error("Failed to delete user profile from DB by admin:", dbError);
      return NextResponse.json(
        { error: `Gagal menghapus data profil: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 3. Delete user from Supabase Auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Failed to delete user from Supabase Auth by admin:", authError);
      return NextResponse.json(
        { error: `Gagal menghapus kredensial login: ${authError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin delete tester error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus akun." },
      { status: 500 }
    );
  }
}
