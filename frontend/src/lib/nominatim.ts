const NOMINATIM_UA =
  process.env.NOMINATIM_USER_AGENT?.trim() ||
  "daurly/1.0 (https://daurly.id; linkproductive@gmail.com)";

export function nominatimHeaders(): HeadersInit {
  return { "User-Agent": NOMINATIM_UA, Accept: "application/json" };
}
