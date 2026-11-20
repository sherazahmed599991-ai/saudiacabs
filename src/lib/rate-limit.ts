import { headers } from "next/headers";

// Best-effort, per-instance limiter. On serverless each instance has its own
// memory, so this only blunts casual abuse from a single instance; it is not
// a hard guarantee. For real protection also enable Vercel's WAF rate
// limiting (or swap this for Upstash) — the call sites won't need to change.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }

  const record = buckets.get(key);
  if (!record || now > record.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= max) return false;
  record.count++;
  return true;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  // On Vercel x-forwarded-for is set by the platform; the first hop is the client.
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
