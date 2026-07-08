"use client";

import Link from "next/link";
import { ChevronRight, RotateCcw } from "lucide-react";
import { RETURN_EVIDENCE_GUIDE, RETURN_EVIDENCE_NOTE } from "@/lib/returnConstants";

export default function KebijakanReturnPage() {
  return (
    <div className="bg-surface-container-low py-10">
      <div className="max-w-[1100px] mx-auto w-full px-6">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/bantuan" className="hover:text-primary transition">Pusat Bantuan</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Kebijakan Return</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <RotateCcw size={20} className="text-orange-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface">Kebijakan Return</h1>
          </div>
          <p className="text-secondary text-sm max-w-2xl leading-relaxed">
            Return diajukan dari tab <strong>Selesai</strong> di Pesanan Saya, lalu diproses lewat{" "}
            <strong>chat admin</strong> — bukan langsung ke perajin/penjual.
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-on-surface mb-4">Alur pengajuan</h2>
            <ol className="text-sm text-secondary space-y-2 list-decimal list-inside">
              <li>Pesanan status <strong>Selesai</strong> (Anda atau admin menandai selesai).</li>
              <li>Klik <strong>Ajukan Return</strong> pada pesanan terkait.</li>
              <li>Isi alasan return — panduan bukti tampil di popup.</li>
              <li>Anda diarahkan ke <strong>Chat Return</strong> dengan admin platform.</li>
              <li>Kirim foto/video bukti melalui chat sesuai checklist di bawah.</li>
            </ol>
            <p className="mt-4 text-xs">
              <Link href="/account/orders" className="text-primary font-bold hover:underline">
                Buka Pesanan Saya →
              </Link>
            </p>
          </section>

          <section className="bg-white border border-orange-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-on-surface mb-5">Bukti yang wajib disiapkan</h2>
            <div className="space-y-5">
              {RETURN_EVIDENCE_GUIDE.map((section) => (
                <div key={section.title}>
                  <p className={`text-sm font-bold mb-2 ${section.highlight ? "text-orange-700" : "text-on-surface"}`}>
                    {section.highlight && "★ "}
                    {section.title}
                  </p>
                  <ul className="list-disc list-inside text-sm text-secondary space-y-1 pl-1">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-orange-800/90 border-t border-orange-200 pt-4 leading-relaxed">
              {RETURN_EVIDENCE_NOTE}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
