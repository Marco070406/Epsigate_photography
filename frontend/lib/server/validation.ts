import type { Category } from "./db";

// "Tous" is only a UI filter, not a storable category (see schema.ts CHECK)
export const PORTFOLIO_CATEGORIES: Category[] = ["Mariage", "Mode", "Portrait", "Événementiel", "Commercial", "Studio"];

export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function cleanList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((a) => String(a).trim()).filter(Boolean) : [];
}
