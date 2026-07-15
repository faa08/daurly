"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Trash2, Leaf, AlertTriangle, 
  CheckCircle2, XCircle, ArrowRight, Check,
  Sprout, Cloud, Wallet, Plus, X, Zap, HelpCircle,
  Coffee, Egg, FileText, Droplet, Box, Scissors,
  Hand
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <Trash2 size={24} />, title: "Kurangi Tumpukan Sampah", desc: "Hampir 50% sampah rumah tangga adalah organik. Dengan mengompos, kamu langsung mengurangi beban TPA secara drastis!", color: "text-blue-600 bg-blue-100" },
  { icon: <Sprout size={24} />, title: "Nutrisi Alami Tanaman", desc: "Kompos adalah \"superfood\" gratis. Bikin tanah gembur, akar sehat, dan daun lebih hijau tanpa bahan kimia buatan.", color: "text-green-600 bg-green-100" },
  { icon: <Cloud size={24} />, title: "Pangkas Emisi Gas Metana", desc: "Sisa makanan yang membusuk di TPA tanpa oksigen menghasilkan gas metana yang merusak ozon. Mengompos mencegah hal ini.", color: "text-amber-600 bg-amber-100" },
  { icon: <Wallet size={24} />, title: "Hemat Biaya Pupuk", desc: "Nggak perlu beli pupuk mahal-mahal. Bahan terbaik justru datang dari sisa sayuran di dapurmu sendiri!", color: "text-emerald-600 bg-emerald-100" },
];

const INGREDIENTS_GOOD = [
  { icon: <Leaf size={20} />, title: "Sisa Sayur & Kulit Buah", type: "Hijau - Sumber Nitrogen" },
  { icon: <Coffee size={20} />, title: "Ampas Kopi & Teh", type: "Hijau - Aroma & penyubur" },
  { icon: <Egg size={20} />, title: "Cangkang Telur", type: "Hijau - Remukkan dulu" },
  { icon: <Sprout size={20} />, title: "Daun Kering", type: "Cokelat - Sumber Karbon" },
  { icon: <FileText size={20} />, title: "Kardus/Kertas Polos", type: "Cokelat - Gunting kecil" },
  { icon: <Droplet size={20} />, title: "Air Secukupnya", type: "Menjaga kelembapan" },
];

const INGREDIENTS_BAD = [
  "Daging & Tulang Besar (Mengundang belatung dan bau)",
  "Produk Susu & Keju (Membuat kompos tengik)",
  "Makanan Berminyak/Bersantan (Menghambat udara)",
  "Kotoran Hewan Peliharaan (Bakteri berbahaya)",
];

const TOOLS = [
  { icon: <Box size={32} />, title: "Ember Berlubang", desc: "Sebagai rumah kompos, wajib ada sirkulasi udara." },
  { icon: <Scissors size={32} />, title: "Gunting / Pisau", desc: "Untuk mencacah sisa makanan jadi potongan kecil." },
  { icon: <Hand size={32} />, title: "Sarung Tangan", desc: "Menjaga tangan tetap bersih saat mengaduk kompos." },
];

const STEPS = [
  { title: "Kumpulkan Sisa Dapur", desc: "Simpan sisa sayur dan kulit buah di wadah kecil tertutup saat memasak.", tips: "Jangan tunggu berhari-hari agar tidak bau busuk sebelum masuk komposter." },
  { title: "Cacah Menjadi Kecil", desc: "Potong bahan organik menjadi ukuran 2-5 cm.", tips: "Semakin kecil potongannya, semakin cepat mikroba memakannya!" },
  { title: "Siapkan Lapisan Cokelat", desc: "Masukkan daun kering atau potongan kardus di dasar ember setebal 5 cm.", tips: "Ini berfungsi menyerap kelebihan air dari sisa makanan." },
  { title: "Masukkan Bahan ke Ember", desc: "Tumpuk bahan hijau di atas cokelat. Perbandingan ideal Cokelat : Hijau = 2 : 1.", tips: "Selalu tutup lapisan paling atas dengan bahan cokelat agar lalat tidak datang." },
  { title: "Jaga Kelembapan", desc: "Kompos harus lembap seperti spons yang diperas. Percikkan air jika terlalu kering.", tips: "Kalau terlalu becek, tambahkan sobekan kardus atau daun kering lagi." },
  { title: "Aduk Secara Berkala", desc: "Aduk tumpukan seminggu sekali untuk memberi jalan bagi oksigen.", tips: "Saat diaduk, kompos sehat akan terasa sedikit hangat (mikroba sedang aktif)." },
  { title: "Panen Emas Hitammu!", desc: "Dalam 4-8 minggu, bahan akan berubah wujud.", tips: "Ambil bagian bawah yang menghitam, sisakan bagian atas yang belum matang." },
];

const MISTAKES = [
  { wrong: "Kompos berbau busuk/menyengat.", right: "Terlalu basah dan kurang oksigen. Tambahkan banyak daun kering/kardus dan aduk rata." },
  { wrong: "Dikerubungi lalat buah (gurem).", right: "Sampah hijau terekspos. Selalu tutup bagian atas dengan lapisan daun kering atau kardus." },
  { wrong: "Ada banyak belatung besar (maggot).", right: "Wajar jika ada sisa protein, tapi hindari daging di awal. Maggot sebenarnya membantu proses." },
  { wrong: "Proses kompos berhenti/lama.", right: "Terlalu kering atau kurang sampah hijau. Tambahkan sedikit air dan kulit buah segar, lalu aduk." },
  { wrong: "Memasukkan ranting pohon besar.", right: "Ranting besar butuh bertahun-tahun hancur. Patahkan kecil-kecil atau gunakan daunnya saja." },
  { wrong: "Menggunakan ember plastik rapat.", right: "Mikroba butuh napas. Lubangi dinding dan dasar ember agar udara & air berlebih bisa keluar." },
  { wrong: "Membuang stiker buah (barcode).", right: "Stiker apel/jeruk berbahan plastik dan tidak hancur. Kelupas dulu sebelum buang kulitnya!" },
  { wrong: "Panik melihat jamur putih.", right: "Jangan panik! Jamur putih (aktinomiset) adalah tanda kompos sehat dan suhu ideal." },
];

const SIGNS = [
  "Warnanya coklat tua kehitaman (mirip tanah).",
  "Berbau harum seperti tanah basah sehabis hujan.",
  "Teksturnya remah, gembur, dan tidak lengket berair.",
  "Bentuk asli bahan sudah hilang (tidak ada kulit pisang dll).",
];

const FACTS = [
  "Mengompos adalah bentuk daur ulang paling alami, metode bumi sejak miliaran tahun.",
  "Keseimbangan daun kering (Karbon) dan sisa sayur (Nitrogen) adalah kunci sukses.",
  "1 sendok teh kompos matang mengandung lebih dari 1 miliar bakteri baik!",
  "Tanaman dengan kompos memiliki daya tahan jauh lebih kuat terhadap hama.",
  "Suhu di dalam tumpukan kompos sehat bisa mencapai 60°C! Membunuh bakteri jahat.",
  "San Francisco menekan sampah TPA hingga 80% berkat wajib kompos dari rumah.",
  "Ampas kopi adalah rahasia cacing tanah gemuk. Komposmu akan semakin subur.",
  "Tidak butuh halaman luas; mengompos bisa dilakukan di ember kecil di balkon apartemen!",
];

const FAQS = [
  { q: "Berapa lama kompos baru bisa dipakai?", a: "Tergantung ukuran potongan bahan dan intensitas pengadukan. Rata-rata 4 minggu (cepat) hingga 3 bulan (santai)." },
  { q: "Apakah ember kompos harus kena sinar matahari?", a: "Lebih baik di tempat teduh dengan sirkulasi udara baik (seperti teras belakang). Sinar matahari langsung bikin kompos kering kerontang." },
  { q: "Apakah saya perlu cairan bioaktivator (EM4)?", a: "Sifatnya opsional untuk mempercepat. Tanpa EM4 pun kompos tetap bisa matang karena mikroba alami sudah ada di udara dan bahan itu sendiri." },
  { q: "Bolehkah pakai wadah kardus saja?", a: "Bisa (metode Takakura kardus), tapi harus hati-hati bagian bawahnya tidak jebol kena lembap. Ember plastik bekas cat adalah termudah." },
  { q: "Apa bedanya kompos dengan pupuk kimia?", a: "Pupuk kimia memberi 'makanan instan' tapi merusak tanah jangka panjang. Kompos menyehatkan tanah, mempertahankan air, dan menjadi makanan perlahan." },
  { q: "Bagaimana cara pakai komposnya?", a: "Taburkan di atas tanah sekitar pangkal tanaman atau campurkan dengan media tanam sebelum menanam bibit baru." },
  { q: "Ada kecoa di dalam kompos saya?", a: "Komposmu mungkin terlalu kering atau ada banyak sisa makanan berminyak. Tambahkan air, aduk rata, dan tutup rapat embernya." },
  { q: "Apakah kulit jeruk boleh dimasukkan?", a: "Boleh, tapi potong sangat kecil. Minyak alami jeruk bisa memperlambat mikroba. Jangan jadikan kompos 100% isinya kulit jeruk saja." },
];

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-4">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#8B5CF6] shadow-lg shadow-purple-900/5' : 'border-surface-container bg-white hover:border-[#8B5CF6]/30'}`}>
            <button onClick={() => setOpenIdx(isOpen ? null : idx)} className="w-full text-left p-6 flex justify-between items-center gap-4 bg-white">
              <span className={`font-bold transition-colors ${isOpen ? 'text-[#8B5CF6]' : 'text-on-surface'}`}>{faq.q}</span>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-purple-100 text-[#8B5CF6]' : 'bg-surface-container-low text-secondary'}`}>
                {isOpen ? <X size={16} /> : <Plus size={16} />}
              </div>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-2 text-secondary leading-relaxed bg-white">
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CaraMembuatKomposPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#2D1B13] text-white pt-12 pb-32 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8B5CF6]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-100 hover:text-white transition group bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-sm tracking-widest mb-8 uppercase">
                <Sprout size={16} /> Edukasi Lanjutan
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Ubah Sisa Makanan<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6]">Jadi &quot;Emas Hitam&quot;</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-10 font-light">
                Jangan biarkan sisa makanan berujung di TPA. Sulap daun kering dan kulit buahmu menjadi pupuk kompos alami yang kaya nutrisi langsung dari rumah.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-[#8B5CF6] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#7C3AED] hover:-translate-y-1 transition-all shadow-xl shadow-[#8B5CF6]/30 gap-2">
                Mulai Mengompos <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bento Box: Mengapa Membuat Kompos */}
        <div className="max-w-[1000px] mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REASONS.map((r, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-purple-900/5 border border-surface-container group hover:border-[#8B5CF6]/50 transition-colors">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${r.color} group-hover:scale-110 transition-transform`}>
                  {r.icon}
                </div>
                <h3 className="font-extrabold text-on-surface mb-3 text-lg leading-tight">{r.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bahan & Alat */}
        <section className="py-16 bg-white border-y border-surface-container overflow-hidden">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Resep Rahasia Kompos</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Kunci kompos yang sukses ada pada keseimbangan bahan dan alat yang tepat.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Bahan Boleh */}
              <div className="bg-emerald-50/50 rounded-[2rem] border border-emerald-100 p-8">
                <h3 className="text-2xl font-extrabold text-emerald-800 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={28} /> Bahan yang Boleh
                </h3>
                <div className="space-y-4">
                  {INGREDIENTS_GOOD.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100/50">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">{item.title}</div>
                        <div className="text-sm text-emerald-700/70 font-medium">{item.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bahan Dilarang */}
              <div className="bg-red-50/50 rounded-[2rem] border border-red-100 p-8 h-fit">
                <h3 className="text-2xl font-extrabold text-red-800 mb-6 flex items-center gap-3">
                  <XCircle className="text-red-500" size={28} /> Sebaiknya Dihindari
                </h3>
                <div className="space-y-4">
                  {INGREDIENTS_BAD.map((item, i) => {
                    const [title, desc] = item.split(" (");
                    return (
                      <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-red-100/50">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <X size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{title}</div>
                          <div className="text-sm text-red-700/70 font-medium">({desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Alat */}
            <div className="text-center mb-10">
              <h3 className="text-2xl font-extrabold text-on-surface mb-2">Alat Tempur Sederhana</h3>
              <p className="text-secondary">Siapkan 3 alat ini sebelum mulai mencacah.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TOOLS.map((t, i) => (
                <div key={i} className="bg-white border border-surface-container rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto bg-purple-50 text-[#8B5CF6] rounded-2xl flex items-center justify-center mb-4">
                    {t.icon}
                  </div>
                  <h4 className="font-bold text-on-surface mb-2 text-lg">{t.title}</h4>
                  <p className="text-sm text-secondary leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline 7 Langkah */}
        <section className="py-24 bg-[#FAF5FF]">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">7 Langkah Menuju Emas Hitam</h2>
              <p className="text-secondary text-lg">Ikuti petunjuk ini secara berurutan untuk hasil yang maksimal.</p>
            </div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-[#D8B4FE] before:to-[#8B5CF6]">
              {STEPS.map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-black shrink-0 shadow-xl shadow-purple-500/40 relative z-10 ring-4 ring-[#FAF5FF]">
                    {i + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-3xl shadow-sm border border-purple-100 group-hover:-translate-y-1 transition-transform group-hover:shadow-md">
                    <h3 className="font-extrabold text-xl text-on-surface mb-3">{step.title}</h3>
                    <p className="text-secondary leading-relaxed mb-4">{step.desc}</p>
                    <div className="bg-purple-50 rounded-xl p-4 text-sm text-[#5B21B6] border border-purple-100">
                      <strong>💡 Tips Praktis:</strong> {step.tips}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kesalahan & Tanda Matang */}
        <section className="py-24 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            
            <div className="mb-24">
              <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">8 Kesalahan Pemula</h2>
              <p className="text-secondary text-center mb-12 max-w-2xl mx-auto text-lg">Wajar kalau baru pertama kali mencoba. Kenali gejalanya dan cara memperbaikinya.</p>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {MISTAKES.map((m, i) => (
                  <div key={i} className="bg-[#FAFAFA] border border-surface-container rounded-2xl p-6">
                    <div className="flex gap-3 items-start mb-3">
                      <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                      <p className="font-medium text-on-surface">{m.wrong}</p>
                    </div>
                    <div className="flex gap-3 items-start ml-2 pl-6 border-l-2 border-emerald-200">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-secondary leading-relaxed font-bold">{m.right}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tanda Matang */}
            <div className="bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <Leaf size={300} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-10 relative z-10 text-center">Tanda Komposmu Sudah Matang!</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {SIGNS.map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                      <Check size={24} />
                    </div>
                    <p className="font-medium text-gray-200">{s}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Fakta Menarik */}
        <section className="py-16 bg-[#FAFAFA] overflow-hidden">
          <div className="max-w-[1000px] mx-auto px-6 mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-2">Fakta Seru Seputar Kompos</h2>
              <p className="text-secondary">Geser untuk tahu lebih banyak.</p>
            </div>
            <Zap className="text-purple-500" size={32} />
          </div>
          <div className="flex overflow-x-auto pb-8 pt-4 px-6 gap-6 snap-x snap-mandatory hide-scrollbar max-w-[1200px] mx-auto">
            {FACTS.map((f, i) => (
              <div key={i} className="snap-center shrink-0 w-[300px] md:w-[350px] bg-white border border-surface-container rounded-3xl p-8 shadow-sm flex flex-col justify-center min-h-[220px] group hover:border-purple-300 transition-colors">
                <div className="text-4xl font-black text-purple-100 mb-4 group-hover:text-purple-200 transition-colors">#{i+1}</div>
                <p className="text-on-surface font-bold leading-relaxed text-lg">{f}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-white border-t border-surface-container">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-purple-100 text-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Tanya Jawab Pemula</h2>
              <p className="text-secondary text-lg">Masih ragu? Temukan jawabannya di sini.</p>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* Call to Action */}
        <section className="pb-32 pt-10 bg-white">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#2D1B13] to-[#42200E] rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 relative z-10">Siap Menciptakan Keajaiban?</h3>
              <p className="text-amber-100/70 mb-10 max-w-2xl mx-auto text-lg leading-relaxed relative z-10 font-light">
                Sisa makananmu terlalu berharga untuk sekadar ditumpuk di tempat sampah. Mulailah menyuburkan tanamanmu hari ini juga!
              </p>
              
              <div className="flex justify-center relative z-10">
                <Link href="/edukasi" className="inline-flex items-center justify-center bg-white text-[#42200E] font-bold px-8 py-4 rounded-xl hover:bg-amber-50 hover:-translate-y-1 transition-all shadow-lg shadow-amber-900/20">
                  Kembali ke Pusat Edukasi
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
