import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  try {
    const { data: payouts, error } = await admin
      .from("penarikan_komisi")
      .select("*")
      .eq("id_user", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ payouts });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Get payouts failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal memuat riwayat penarikan." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const namaBank = String(body.namaBank || "").trim();
    const noRek = String(body.noRek || "").trim();
    const atasNama = String(body.atasNama || "").trim();

    if (!amount || amount < 50000) {
      return NextResponse.json({ error: "Minimal penarikan adalah Rp50.000." }, { status: 400 });
    }
    if (!namaBank || !noRek || !atasNama) {
      return NextResponse.json({ error: "Informasi bank tidak lengkap." }, { status: 400 });
    }

    // 1. Hitung saldo aktif saat ini
    const { data: saldoRows, error: saldoErr } = await admin
      .from("saldo_affiliate")
      .select("jumlah, tipe, status")
      .eq("id_user", userId);

    if (saldoErr) throw saldoErr;

    let saldoAktif = 0;
    if (saldoRows) {
      for (const row of saldoRows) {
        const amt = Number(row.jumlah);
        if (row.tipe === "masuk") {
          if (row.status === "sukses") {
            saldoAktif += amt;
          }
        } else if (row.tipe === "keluar") {
          if (row.status === "sukses" || row.status === "pending") {
            saldoAktif -= amt;
          }
        }
      }
    }

    if (saldoAktif < amount) {
      return NextResponse.json(
        { error: `Saldo tidak mencukupi. Saldo aktif Anda: Rp${saldoAktif.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    // 2. Buat transaksi penarikan
    const idPenarikan = crypto.randomUUID();
    const { error: payoutErr } = await admin.from("penarikan_komisi").insert({
      id_penarikan: idPenarikan,
      id_user: userId,
      jumlah: amount,
      nama_bank: namaBank,
      no_rek: noRek,
      atas_nama: atasNama,
      status: "diajukan",
    });

    if (payoutErr) throw payoutErr;

    // 3. Cadangkan saldo di saldo_affiliate (tipe = keluar, status = pending)
    const { error: saldoInsertErr } = await admin.from("saldo_affiliate").insert({
      id_user: userId,
      jumlah: amount,
      tipe: "keluar",
      status: "pending",
      keterangan: `Penarikan saldo komisi ke ${namaBank} (${noRek}) a.n ${atasNama}`,
    });

    if (saldoInsertErr) {
      // Rollback jika insert saldo gagal
      await admin.from("penarikan_komisi").delete().eq("id_penarikan", idPenarikan);
      throw saldoInsertErr;
    }

    return NextResponse.json({ success: true, message: "Pengajuan penarikan dana berhasil diajukan." });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Payout request failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal memproses penarikan dana." },
      { status: 500 }
    );
  }
}
