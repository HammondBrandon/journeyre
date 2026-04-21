"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationBarProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

export default function PaginationBar({
  totalCount,
  pageSize,
  currentPage,
}: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const go = (page: number) => {
    const next = new URLSearchParams(params.toString());
    if (page === 1) next.delete("page");
    else next.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${next}`, { scroll: true });
    });
  };

  // Build page number list with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase =
    "flex items-center justify-center w-9 h-9 font-raleway text-xs font-semibold border transition-colors";
  const active = "bg-primary text-white border-primary";
  const inactive =
    "bg-white text-ink-secondary border-border-light hover:border-primary/40 hover:text-primary cursor-pointer";
  const disabled = "bg-surface text-ink-muted border-border-light cursor-not-allowed opacity-50";

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex items-center justify-center gap-1.5 flex-wrap",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Prev */}
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(btnBase, currentPage === 1 ? disabled : inactive)}
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex items-center justify-center w-9 h-9 font-raleway text-xs text-ink-muted"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={cn(btnBase, p === currentPage ? active : inactive)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(btnBase, currentPage === totalPages ? disabled : inactive)}
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
