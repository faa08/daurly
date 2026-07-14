import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://daurly.id";
  const now = new Date();

  const staticPages = [
    "",
    "/tentang",
    "/kontak",
    "/bantuan",
    "/bantuan/faq",
    "/bantuan/syarat-ketentuan",
    "/kebijakan-privasi",
    "/promo",
    "/search",
    "/masuk",
    "/daftar",
  ];

  return staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
