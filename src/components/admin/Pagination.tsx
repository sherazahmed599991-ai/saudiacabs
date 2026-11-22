import Link from "next/link";
import { PAGE_SIZE } from "@/lib/pagination";

/**
 * Prev / Next for admin lists. Keeps the current search and filter params in
 * the links so paging doesn't reset them.
 */
export default function Pagination({
  page,
  total,
  basePath,
  params,
}: {
  page: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total === 0) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass = "rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface";
  const disabledClass = "rounded-md border border-border px-3 py-1.5 text-sm text-muted opacity-50";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={linkClass}>
            ← Previous
          </Link>
        ) : (
          <span className={disabledClass}>← Previous</span>
        )}
        <span className="px-1">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={href(page + 1)} className={linkClass}>
            Next →
          </Link>
        ) : (
          <span className={disabledClass}>Next →</span>
        )}
      </div>
    </div>
  );
}
