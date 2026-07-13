export function formatSAR(amount: number) {
  return `SAR ${amount.toFixed(2)}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
