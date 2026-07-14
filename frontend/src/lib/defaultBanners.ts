import type { SiteBanner } from "@/backend/bannerService";

export const DEFAULT_HOME_HERO_SLIDES: Omit<
  SiteBanner,
  "id_banner" | "created_at" | "updated_at"
>[] = [
  {
    banner_kind: "home_hero",
    category_slug: "",
    badge: "PROMO SPESIAL",
    title_line1: "Karya Terbaik",
    title_line2: "Dari Seluruh Indonesia",
    description:
      "Dapatkan diskon spesial untuk produk-produk kerajinan tangan otentik pilihan.",
    button_text: "Lihat Promo",
    button_link: "/promo",
    image_url: "/hero-banner.png",
    image_position: "center center",
    sort_order: 0,
    is_active: true,
  },
  {
    banner_kind: "home_hero",
    category_slug: "",
    badge: "FASHION LOKAL",
    title_line1: "Keindahan Batik",
    title_line2: "& Tenun Nusantara",
    description:
      "Tampil elegan dengan koleksi busana tradisional modern hasil karya desainer lokal.",
    button_text: "Jelajahi Koleksi",
    button_link: "/kategori/fashion",
    image_url: "/hero-banner-2.png",
    image_position: "center center",
    sort_order: 1,
    is_active: true,
  },
  {
    banner_kind: "home_hero",
    category_slug: "",
    badge: "KULINER NUSANTARA",
    title_line1: "Cita Rasa Kopi",
    title_line2: "& Kuliner Asli",
    description:
      "Rasakan kenikmatan kopi arabika premium dan camilan tradisional langsung dari petani.",
    button_text: "Belanja Sekarang",
    button_link: "/kategori/kuliner",
    image_url: "/hero-banner-3.png",
    image_position: "center center",
    sort_order: 2,
    is_active: true,
  },
];

export const DEFAULT_CATEGORY_HERO_SLUGS = [
  { slug: "", label: "Semua Kategori" },
  { slug: "kuliner", label: "Kuliner" },
  { slug: "fashion", label: "Fashion" },
  { slug: "kerajinan", label: "Kerajinan" },
  { slug: "jasa", label: "Jasa" },
  { slug: "kecantikan", label: "Kecantikan" },
];

export const DEFAULT_CATEGORY_HERO: Record<
  string,
  Omit<SiteBanner, "id_banner" | "banner_kind" | "created_at" | "updated_at" | "sort_order" | "is_active" | "button_text" | "button_link" | "title_line2">
> = {
  "": {
    category_slug: "",
    badge: "Galeri Daur Ulang Pilihan",
    title_line1: "Semua Kategori Produk",
    description:
      "Temukan barang kerajinan otentik, hidangan lezat kuliner nusantara, busana lokal tradisional, dan layanan jasa berkualitas langsung dari pelaku daur ulang terpercaya.",
    image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    image_position: "center center",
  },
  kuliner: {
    category_slug: "kuliner",
    badge: "Galeri Daur Ulang Pilihan",
    title_line1: "Kategori Kuliner",
    description:
      "Nikmati cita rasa nusantara autentik — dari kopi pilihan, camilan tradisional, hingga olahan rumahan berkualitas dari produsen daur ulang kuliner terpercaya.",
    image_url:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
    image_position: "center 40%",
  },
  fashion: {
    category_slug: "fashion",
    badge: "Galeri Daur Ulang Pilihan",
    title_line1: "Kategori Fashion",
    description:
      "Temukan busana lokal, batik modern, dan aksesori handmade yang memadukan tradisi dengan gaya kontemporer dari pengrajin fashion Indonesia.",
    image_url:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
    image_position: "center center",
  },
  kerajinan: {
    category_slug: "kerajinan",
    badge: "Galeri Daur Ulang Pilihan",
    title_line1: "Kategori Kerajinan",
    description:
      "Jelajahi kerajinan tangan otentik — keramik, anyaman, ukiran kayu, dan karya seni lokal yang dibuat dengan dedikasi para perajin daur ulang.",
    image_url:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff4b5?q=80&w=1600&auto=format&fit=crop",
    image_position: "center center",
  },
  jasa: {
    category_slug: "jasa",
    badge: "Galeri Daur Ulang Pilihan",
    title_line1: "Kategori Jasa",
    description:
      "Temukan layanan jasa berkualitas dari pelaku daur ulang lokal — desain, fotografi, konsultasi, hingga jasa kreatif yang siap mendukung kebutuhan Anda.",
    image_url:
      "https://images.unsplash.com/photo-1521737711862-e3b97375f902?q=80&w=1600&auto=format&fit=crop",
    image_position: "center center",
  },
  kecantikan: {
    category_slug: "kecantikan",
    badge: "Galeri Daur Ulang Pilihan",
    title_line1: "Kategori Kecantikan",
    description:
      "Produk kecantikan alami dan perawatan tubuh dari bahan lokal — sabun handmade, essential oil, dan kosmetik ramah kulit dari produsen daur ulang Indonesia.",
    image_url:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600&auto=format&fit=crop",
    image_position: "center center",
  },
};
