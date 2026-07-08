/** Konfigurasi hero per kategori — ganti `backgroundImage` dengan path gambar Anda sendiri */
export interface CategoryHeroConfig {
  description: string;
  backgroundImage?: string;
  backgroundPosition?: string;
}

export const CATEGORY_HERO_CONFIG: Record<string, CategoryHeroConfig> = {
  "": {
    description:
      "Temukan barang kerajinan daur ulang kreatif, olahan makanan ramah lingkungan, busana eco-fashion, dan layanan ramah lingkungan dari perajin terpercaya.",
    backgroundImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
  },
  kuliner: {
    description:
      "Nikmati cita rasa nusantara autentik — kuliner ramah lingkungan dengan kemasan minim plastik dari mitra terpercaya.",
    backgroundImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
    backgroundPosition: "center 40%",
  },
  fashion: {
    description:
      "Temukan busana ramah lingkungan (eco-fashion) dan aksesori daur ulang kreatif yang memadukan keindahan dengan gaya berkelanjutan.",
    backgroundImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
  },
  kerajinan: {
    description:
      "Jelajahi kerajinan tangan daur ulang otentik — dekorasi rumah, wadah serbaguna, dan karya seni yang dibuat kreatif dari bahan daur ulang.",
    backgroundImage:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff4b5?q=80&w=1600&auto=format&fit=crop",
  },
  jasa: {
    description:
      "Temukan layanan jasa ramah lingkungan — konsultasi pengelolaan limbah, workshop upcycling, dan jasa kreatif hijau.",
    backgroundImage:
      "https://images.unsplash.com/photo-1521737711862-e3b97375f902?q=80&w=1600&auto=format&fit=crop",
  },
  kecantikan: {
    description:
      "Produk kecantikan alami, sabun handmade ramah lingkungan, dan perawatan tubuh organik bebas bahan kimia berbahaya.",
    backgroundImage:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600&auto=format&fit=crop",
  },
};

export function getCategoryHeroConfig(slug: string): CategoryHeroConfig {
  return CATEGORY_HERO_CONFIG[slug] ?? CATEGORY_HERO_CONFIG[""];
}
