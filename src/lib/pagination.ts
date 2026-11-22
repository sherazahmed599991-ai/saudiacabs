export const PAGE_SIZE = 20;

/** Parses a ?page= query value into a safe 1-based page number. */
export function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 && n <= 10_000 ? n : 1;
}

/** Inclusive [from, to] row indexes for Supabase `.range()`. */
export function pageRange(page: number): [number, number] {
  const from = (page - 1) * PAGE_SIZE;
  return [from, from + PAGE_SIZE - 1];
}
