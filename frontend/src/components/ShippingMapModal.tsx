"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, MapPin, X } from "lucide-react";
import { DEFAULT_MAP_CENTER, googleMapsPinUrl, googleMapsSearchUrl } from "@/lib/mapsUtils";

type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;
type LeafletNS = typeof import("leaflet");

export type ShippingMapModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  addressText: string;
  lat?: number | null;
  lng?: number | null;
  isPickup?: boolean;
};

export default function ShippingMapModal({
  open,
  onClose,
  title,
  addressText,
  lat,
  lng,
  isPickup,
}: ShippingMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<LeafletNS | null>(null);
  const aliveRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const destroyMap = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.dataset.leafletInit = "";
    }
    leafletRef.current = null;
  }, []);

  const placePin = useCallback((map: LeafletMap, L: LeafletNS, point: { lat: number; lng: number }) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([point.lat, point.lng]);
    } else {
      markerRef.current = L.marker([point.lat, point.lng]).addTo(map);
    }
    map.setView([point.lat, point.lng], 16, { animate: false });
    map.invalidateSize();
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      destroyMap();
    };
  }, [destroyMap]);

  useEffect(() => {
    if (!open) {
      destroyMap();
      setCoords(null);
      setError("");
      setLoading(true);
      return;
    }

    let cancelled = false;

    async function resolveCoords(): Promise<{ lat: number; lng: number } | null> {
      if (isPickup) return DEFAULT_MAP_CENTER;
      if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
      const query = addressText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("Penerima:") && !l.startsWith("Label:"))
        .join(", ");
      if (!query || query.length < 5) return null;

      // Bersihkan tanda pisah/dash yang sering mengacaukan parser geocoding
      const cleanedQuery = query.replace(/[—–-]/g, ",").replace(/\s+/g, " ");

      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(cleanedQuery)}`);
        const data = await res.json();
        if (res.ok && data.results?.length) {
          const first = data.results[0];
          const gLat = parseFloat(first.lat);
          const gLng = parseFloat(first.lon);
          if (Number.isFinite(gLat) && Number.isFinite(gLng)) {
            return { lat: gLat, lng: gLng };
          }
        }
      } catch (e) {
        console.warn("Geocoding failed for main query:", e);
      }

      // Fallback: Jika gagal, hapus bagian spesifik sebelah kiri secara bertahap
      const parts = cleanedQuery.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          const fallbackQuery = parts.slice(i).join(", ");
          if (fallbackQuery.length < 5) continue;
          try {
            const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(fallbackQuery)}`);
            const data = await res.json();
            if (res.ok && data.results?.length) {
              const first = data.results[0];
              const gLat = parseFloat(first.lat);
              const gLng = parseFloat(first.lon);
              if (Number.isFinite(gLat) && Number.isFinite(gLng)) {
                return { lat: gLat, lng: gLng };
              }
            }
          } catch {
            // Abaikan dan coba bagian berikutnya
          }
        }
      }

      return null;
    }

    async function init() {
      setLoading(true);
      setError("");
      try {
        const point = await resolveCoords();
        if (cancelled || !aliveRef.current) return;
        if (!point) {
          setError("Lokasi tidak ditemukan. Buka Google Maps untuk mencari alamat.");
          setCoords(null);
          return;
        }
        setCoords(point);

        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !aliveRef.current || !mapRef.current) return;

        leafletRef.current = L;
        destroyMap();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current).setView([point.lat, point.lng], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
        }).addTo(map);

        mapInstanceRef.current = map;
        mapRef.current.dataset.leafletInit = "1";
        placePin(map, L, point);
      } catch {
        if (!cancelled && aliveRef.current) {
          setError("Gagal memuat peta.");
        }
      } finally {
        if (!cancelled && aliveRef.current) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [open, lat, lng, addressText, isPickup, destroyMap, placePin]);

  if (!open) return null;

  const mapsHref = coords
    ? googleMapsPinUrl(coords.lat, coords.lng)
    : googleMapsSearchUrl(addressText.replace(/\n/g, ", "));

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-map-title"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#EAE5E0]">
          <div className="min-w-0">
            <h3 id="shipping-map-title" className="font-bold text-[#1F1B18] text-sm flex items-center gap-2">
              <MapPin size={16} className="text-[#1D4ED8] flex-shrink-0" />
              {title}
            </h3>
            <p className="text-[11px] text-[#5C5550] mt-1 whitespace-pre-line leading-relaxed">{addressText}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F5F3F0] text-[#8E8680]"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F5F3F0]/90">
              <Loader2 size={24} className="animate-spin text-[#1D4ED8]" />
            </div>
          )}
          <div ref={mapRef} className="address-map-canvas w-full h-64 bg-[#E8E8E8]" />
          {error && !loading && (
            <p className="absolute bottom-2 left-2 right-2 text-[10px] bg-white/95 border border-[#EAE5E0] rounded px-2 py-1.5 text-amber-800">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-3 flex flex-wrap gap-2 border-t border-[#EAE5E0] bg-[#FCFCFA]">
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded-lg hover:brightness-95"
          >
            <ExternalLink size={14} />
            Buka di Google Maps
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-[#5C5550] border border-[#D5CFC9] rounded-lg hover:bg-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
