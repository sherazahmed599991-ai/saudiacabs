const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Deliberately simple: one @, no spaces or control characters, a dot in the domain.
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

/** Trim and cap length. Strips control characters (incl. CR/LF) when singleLine. */
export function clean(value: FormDataEntryValue | null | undefined, max: number, singleLine = true): string {
  let s = typeof value === "string" ? value : "";
  s = singleLine ? s.replace(/[\u0000-\u001F\u007F]+/g, " ") : s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return s.trim().slice(0, max);
}

export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Make a user-typed search term safe to embed in a PostgREST `.or()` filter
 * or an ilike pattern: drop the characters that have meaning there
 * (separators, grouping, wildcards, escapes).
 */
export function safeSearchTerm(value: string | undefined): string {
  return (value ?? "").replace(/[,()*%_\\"'`:.]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export const BOOKING_STATUSES = ["new", "contacted", "quoted", "booked", "completed", "cancelled"] as const;
export const QUOTATION_STATUSES = ["draft", "sent", "accepted", "declined", "expired"] as const;
export const INVOICE_STATUSES = ["draft", "sent", "paid", "cancelled"] as const;
export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "other"] as const;

export const MAX_AMOUNT = 10_000_000;

/** A finite number within (0, MAX_AMOUNT], rounded to 2 decimals; otherwise null. */
export function parseAmount(value: FormDataEntryValue | null | undefined, allowZero = false): number | null {
  const n = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n > MAX_AMOUNT || n < 0 || (!allowZero && n === 0)) return null;
  return Math.round(n * 100) / 100;
}
