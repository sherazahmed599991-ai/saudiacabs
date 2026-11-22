export function formatSAR(amount: number) {
  return `SAR ${amount.toFixed(2)}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Today's date (YYYY-MM-DD) in Saudi time, so "overdue" doesn't flip at UTC midnight. */
export function todayInRiyadh(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

/** An invoice is overdue when it was sent, has a due date, and that date has passed. */
export function isOverdue(inv: { status: string; due_date: string | null }): boolean {
  return inv.status === "sent" && !!inv.due_date && inv.due_date < todayInRiyadh();
}
