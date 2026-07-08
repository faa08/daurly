import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://daurly.id";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/account/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
