import type { ProductVariant } from "@/backend/productService";

export interface VariantInventoryEntry {
  picks: number[];
  stock: number;
  price?: number;
  image?: string;
}

export function picksKey(picks: number[]): string {
  return picks.join(",");
}

export function parsePicksKey(key: string): number[] {
  if (!key) return [];
  return key.split(",").map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n));
}

/** Semua kombinasi indeks opsi dari tiap grup varian */
export function buildAllPickCombinations(groups: ProductVariant[]): number[][] {
  if (!groups.length) return [];

  const validGroups = groups.filter((g) => g.options.some((o) => o.name.trim()));
  if (!validGroups.length) return [];

  let combos: number[][] = [[]];
  for (const group of validGroups) {
    const count = group.options.filter((o) => o.name.trim()).length;
    const next: number[][] = [];
    for (const base of combos) {
      for (let i = 0; i < count; i++) {
        next.push([...base, i]);
      }
    }
    combos = next;
  }
  return combos;
}

export function getCombinationLabel(groups: ProductVariant[], picks: number[]): string {
  return groups
    .map((g, gi) => g.options[picks[gi]]?.name)
    .filter(Boolean)
    .join(" · ");
}

export function syncInventoryMap(
  groups: ProductVariant[],
  prev: Record<string, string>,
  fallbackStock = ""
): Record<string, string> {
  const combos = buildAllPickCombinations(groups);
  const next: Record<string, string> = {};
  for (const picks of combos) {
    const key = picksKey(picks);
    next[key] = prev[key] ?? fallbackStock;
  }
  return next;
}

export function inventoryFromMap(
  groups: ProductVariant[],
  map: Record<string, string>
): VariantInventoryEntry[] {
  return buildAllPickCombinations(groups)
    .map((picks) => ({
      picks,
      stock: Math.max(0, parseInt(map[picksKey(picks)] || "0", 10) || 0),
    }))
    .filter((e) => e.stock > 0);
}

export function totalInventoryStock(inventory: VariantInventoryEntry[]): number {
  return inventory.reduce((sum, e) => sum + e.stock, 0);
}

export function parseVariantRaw(raw: unknown): {
  groups: ProductVariant[];
  inventory: VariantInventoryEntry[];
} {
  if (!raw) return { groups: [], inventory: [] };

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.groups)) {
      const groups = parseGroupsArray(parsed.groups);
      const inventory = Array.isArray(parsed.inventory)
        ? parsed.inventory
            .map((row: Record<string, unknown>) => ({
              picks: Array.isArray(row.picks)
                ? row.picks.map((n) => Number(n)).filter((n) => !Number.isNaN(n))
                : [],
              stock: Math.max(0, Number(row.stock) || 0),
              price: row.price != null && row.price !== "" ? Number(row.price) : undefined,
              image: row.image ? String(row.image) : undefined,
            }))
            .filter((e: VariantInventoryEntry) => e.picks.length > 0)
        : [];
      return { groups, inventory };
    }

    if (Array.isArray(parsed)) {
      return { groups: parseGroupsArray(parsed), inventory: [] };
    }
  } catch {
    // ignore
  }

  return { groups: [], inventory: [] };
}

function parseGroupsArray(arr: unknown[]): ProductVariant[] {
  const groups: ProductVariant[] = [];
  for (const v of arr) {
    if (!v || typeof v !== "object") continue;
    const row = v as Record<string, unknown>;
    const label = String(row.label ?? "").trim();
    if (!label) continue;

    if (Array.isArray(row.options)) {
      const options = row.options
        .map((o: Record<string, unknown>) => ({
          name: String(o.name ?? "").trim(),
          image: o.image ? String(o.image) : undefined,
          price: o.price != null && o.price !== "" ? Number(o.price) : undefined,
        }))
        .filter((o) => o.name);
      if (options.length) groups.push({ label, options });
      continue;
    }

    if (Array.isArray(row.values)) {
      const options = row.values
        .map((x: unknown) => ({ name: String(x).trim() }))
        .filter((o) => o.name);
      if (options.length) groups.push({ label, options });
    }
  }
  return groups;
}

export function serializeVariantPayload(
  groups: ProductVariant[],
  inventory: VariantInventoryEntry[]
): unknown {
  if (inventory.length > 0) {
    return { groups, inventory };
  }
  return groups;
}

export function getStockForPicks(
  inventory: VariantInventoryEntry[],
  picks: number[],
  fallbackStock: number
): number {
  if (!inventory.length) return fallbackStock;
  const key = picksKey(picks);
  const found = inventory.find((e) => picksKey(e.picks) === key);
  return found ? found.stock : 0;
}

export function applyInventoryDeduction(
  rawVarian: unknown,
  picks: number[],
  qty: number
): { varian: unknown; totalStock: number } | null {
  const { groups, inventory } = parseVariantRaw(rawVarian);
  if (!inventory.length) return null;

  const key = picksKey(picks);
  let matched = false;
  const nextInventory = inventory.map((entry) => {
    if (picksKey(entry.picks) !== key) return entry;
    matched = true;
    return { ...entry, stock: Math.max(0, entry.stock - qty) };
  });

  if (!matched) return null;

  const totalStock = totalInventoryStock(nextInventory);
  return {
    varian: serializeVariantPayload(groups, nextInventory),
    totalStock,
  };
}

export function picksEqual(a?: number[] | null, b?: number[] | null): boolean {
  const aa = a ?? [];
  const bb = b ?? [];
  if (aa.length !== bb.length) return false;
  return aa.every((v, i) => v === bb[i]);
}
