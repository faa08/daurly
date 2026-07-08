import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

function parseCoverImage(img: unknown): string | undefined {
  if (!img || typeof img !== "string") return undefined;
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img) as string[];
      return arr[0] || undefined;
    } catch {
      return undefined;
    }
  }
  return img;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daurly.id";

  const { client } = createSupabaseAdmin();
  if (!client) {
    return { title: "Produk — Daurly" };
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const query = client.from("produk").select("nama_produk, deskripsi, img, harga, slug");
  const { data } = await (isUuid ? query.eq("id_produk", slug) : query.eq("slug", slug)).maybeSingle();

  if (!data) {
    return { title: "Produk tidak ditemukan — Daurly" };
  }

  const title = `${data.nama_produk} — Daurly`;
  const description =
    (typeof data.deskripsi === "string" && data.deskripsi.slice(0, 160)) ||
    `Beli ${data.nama_produk} dari perajin di Daurly.`;
  const image = parseCoverImage(data.img);
  const price = Number(data.harga);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/produk/${data.slug || slug}`,
      ...(image ? { images: [{ url: image, alt: data.nama_produk }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    other: price > 0 ? { "product:price:amount": String(price), "product:price:currency": "IDR" } : {},
  };
}

export default function ProductLayout({ children }: Props) {
  return children;
}
