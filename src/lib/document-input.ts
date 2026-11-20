import { clean, isEmail, isUuid, MAX_AMOUNT } from "@/lib/validation";
import type { LineItem } from "@/lib/types";

export type CustomerInput = { name: string; phone: string; email: string };

/** Parses + validates the customer block shared by quotation and invoice forms. */
export function parseCustomer(formData: FormData): { value: CustomerInput; error?: string } {
  const value = {
    name: clean(formData.get("customerName"), 100),
    phone: clean(formData.get("customerPhone"), 25),
    email: clean(formData.get("customerEmail"), 254),
  };
  if (!value.name || !value.phone || !value.email) {
    return { value, error: "Please fill in all required customer details." };
  }
  if (!isEmail(value.email)) return { value, error: "Please enter a valid customer email address." };
  return { value };
}

/** Optional foreign-key field: null when blank, undefined when present but malformed. */
export function parseOptionalUuid(formData: FormData, key: string): string | null | undefined {
  const raw = clean(formData.get(key), 64);
  if (!raw) return null;
  return isUuid(raw) ? raw : undefined;
}

const MAX_LINE_ITEMS = 50;

/** Parses the JSON line-items field with strict bounds. */
export function parseLineItems(raw: FormDataEntryValue | null): LineItem[] {
  if (typeof raw !== "string" || raw.length > 50_000) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: LineItem[] = [];
    for (const row of parsed.slice(0, MAX_LINE_ITEMS)) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const description = clean(typeof r.description === "string" ? r.description : "", 300);
      const quantity = Number(r.quantity);
      const unitPrice = Number(r.unitPrice);
      if (!description) continue;
      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 10_000) continue;
      if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > MAX_AMOUNT) continue;
      items.push({ description, quantity, unit_price: Math.round(unitPrice * 100) / 100 });
    }
    return items;
  } catch {
    return [];
  }
}

export function sumLineItems(items: LineItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0) * 100) / 100;
}
