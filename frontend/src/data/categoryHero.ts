/** Konfigurasi hero per kategori — ganti `backgroundImage` dengan path gambar Anda sendiri */
export interface CategoryHeroConfig {
  description: string;
  backgroundImage?: string;
  backgroundPosition?: string;
}

export const CATEGORY_HERO_CONFIG: Record<string, CategoryHeroConfig> = {
  "": {
    description:
      "Temukan barang kerajinan otentik, hidangan lezat kuliner nusantara, busana lokal tradisional, dan layanan jasa berkualitas langsung dari pelaku daur ulang terpercaya.",
    backgroundImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
  },
  kuliner: {
    description:
      "Nikmati cita rasa nusantara autentik — dari kopi pilihan, camilan tradisional, hingga olahan rumahan berkualitas dari produsen daur ulang kuliner terpercaya.",
    backgroundImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
    backgroundPosition: "center 40%",
  },
  fashion: {
    description:
      "Temukan busana lokal, batik modern, dan aksesori handmade yang memadukan tradisi dengan gaya kontemporer dari pengrajin fashion Indonesia.",
    backgroundImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
  },
  kerajinan: {
    description:
      "Jelajahi kerajinan tangan otentik — keramik, anyaman, ukiran kayu, dan karya seni lokal yang dibuat dengan dedikasi para perajin daur ulang.",
    backgroundImage:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff4b5?q=80&w=1600&auto=format&fit=crop",
  },
  jasa: {
    description:
      "Temukan layanan jasa berkualitas dari pelaku daur ulang lokal — desain, fotografi, konsultasi, hingga jasa kreatif yang siap mendukung kebutuhan Anda.",
    backgroundImage:
      "https://images.unsplash.com/photo-1521737711862-e3b97375f902?q=80&w=1600&auto=format&fit=crop",
  },
  kecantikan: {
    description:
      "Produk kecantikan alami dan perawatan tubuh dari bahan lokal — sabun handmade, essential oil, dan kosmetik ramah kulit dari produsen daur ulang Indonesia.",
    backgroundImage:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600&auto=format&fit=crop",
  },
};

export function getCategoryHeroConfig(slug: string): CategoryHeroConfig {
  return CATEGORY_HERO_CONFIG[slug] ?? CATEGORY_HERO_CONFIG[""];
}
