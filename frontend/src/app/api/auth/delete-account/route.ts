import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const userId = auth.ctx.user.id_user;
  const { client: admin, error: adminErr } = createSupabaseAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: adminErr || "Service role tidak tersedia." },
      { status: 503 }
    );
  }

  try {
    // 1. Delete user from public.users table (this will cascade delete addresses, carts, etc.)
    const { error: dbError } = await admin
      .from("users")
      .delete()
      .eq("id_user", userId);

    if (dbError) {
      console.error("Failed to delete user profile from DB:", dbError);
      return NextResponse.json(
        { error: `Gagal menghapus data profil: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 2. Delete user from Supabase Auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Failed to delete user from Supabase Auth:", authError);
      return NextResponse.json(
        { error: `Gagal menghapus kredensial login: ${authError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus akun." },
      { status: 500 }
    );
  }
}
