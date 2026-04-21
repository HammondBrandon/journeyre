"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PROPERTY_CLASS_LABELS, type PropertyClass } from "@/lib/rets-types";

const PROPERTY_CLASSES: { value: PropertyClass | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "RESI", label: "Residential" },
  { value: "LAND", label: "Land" },
  { value: "COMS", label: "Commercial Sale" },
  { value: "COML", label: "Commercial Lease" },
  { value: "MOBI", label: "Mobile Home" },
  { value: "FARM", label: "Farm" },
];

const PRICE_OPTIONS = [
  { value: "", label: "No min" },
  { value: "50000", label: "$50K" },
  { value: "100000", label: "$100K" },
  { value: "150000", label: "$150K" },
  { value: "200000", label: "$200K" },
  { value: "250000", label: "$250K" },
  { value: "300000", label: "$300K" },
  { value: "350000", label: "$350K" },
  { value: "400000", label: "$400K" },
  { value: "500000", label: "$500K" },
  { value: "600000", label: "$600K" },
  { value: "750000", label: "$750K" },
  { value: "1000000", label: "$1M" },
];

const BEDS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(true);

  const current = {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    minBeds: params.get("minBeds") ?? "",
    minBaths: params.get("minBaths") ?? "",
    status: params.get("status") ?? "",
  };

  const activeFilterCount = [
    current.type,
    current.minPrice,
    current.maxPrice,
    current.minBeds,
    current.minBaths,
    current.status,
  ].filter(Boolean).length;

  const apply = useCallback(
    (updates: Partial<typeof current>) => {
      const next = new URLSearchParams(params.toString());
      const merged = { ...current, ...updates };

      // Reset to page 1 on any filter change
      next.delete("page");

      Object.entries(merged).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });

      startTransition(() => {
        router.push(`${pathname}?${next}`, { scroll: false });
      });
    },
    [params, pathname, router, current]
  );

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const selectClass =
    "w-full px-3 py-2.5 border border-border-light bg-white font-lora text-sm text-ink focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer";
  const labelClass =
    "block font-raleway text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-1.5";

  return (
    <div className={cn("transition-opacity", isPending && "opacity-60 pointer-events-none")}>
      {/* Keyword row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          apply({ q: (fd.get("q") as string) ?? "" });
        }}
        className="flex items-stretch gap-0 mb-4"
      >
        <input
          name="q"
          type="text"
          defaultValue={current.q}
          placeholder="City, ZIP, or address…"
          className="flex-1 px-4 py-3 border border-border-light bg-white font-lora text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors min-w-0"
        />
        <button
          type="submit"
          className="px-6 bg-primary text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-primary-dark transition-colors shrink-0 cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Toggle advanced */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 font-raleway text-xs font-semibold uppercase tracking-wide text-ink-secondary hover:text-primary transition-colors cursor-pointer"
          aria-expanded={expanded}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 font-raleway text-xs text-ink-muted hover:text-primary transition-colors cursor-pointer"
          >
            <X size={11} />
            Clear all
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-surface border border-border-light">
          {/* Property type */}
          <div className="col-span-2 md:col-span-1">
            <label className={labelClass}>Type</label>
            <select
              value={current.type}
              onChange={(e) => apply({ type: e.target.value })}
              className={selectClass}
            >
              {PROPERTY_CLASSES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min price */}
          <div>
            <label className={labelClass}>Min Price</label>
            <select
              value={current.minPrice}
              onChange={(e) => apply({ minPrice: e.target.value })}
              className={selectClass}
            >
              {PRICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Max price */}
          <div>
            <label className={labelClass}>Max Price</label>
            <select
              value={current.maxPrice}
              onChange={(e) => apply({ maxPrice: e.target.value })}
              className={selectClass}
            >
              {[{ value: "", label: "No max" }, ...PRICE_OPTIONS.slice(1)].map(
                (o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Beds */}
          <div>
            <label className={labelClass}>Beds</label>
            <select
              value={current.minBeds}
              onChange={(e) => apply({ minBeds: e.target.value })}
              className={selectClass}
            >
              {BEDS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Baths */}
          <div>
            <label className={labelClass}>Baths</label>
            <select
              value={current.minBaths}
              onChange={(e) => apply({ minBaths: e.target.value })}
              className={selectClass}
            >
              {BEDS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={current.status}
              onChange={(e) => apply({ status: e.target.value })}
              className={selectClass}
            >
              <option value="">Active</option>
              <option value="Under Contract">Under Contract</option>
              <option value="A,U">Active + Under Contract</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

/** Active filter pill display */
export function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const remove = (key: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    next.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${next}`, { scroll: false });
    });
  };

  const labels: Record<string, (v: string) => string> = {
    type: (v) => PROPERTY_CLASS_LABELS[v as PropertyClass] ?? v,
    minPrice: (v) => `Min $${parseInt(v).toLocaleString()}`,
    maxPrice: (v) => `Max $${parseInt(v).toLocaleString()}`,
    minBeds: (v) => `${v}+ beds`,
    minBaths: (v) => `${v}+ baths`,
    status: (v) => {
      const map: Record<string, string> = { "A,U": "Active + Under Contract" };
      return map[v] ?? v;
    },
    q: (v) => `"${v}"`,
  };

  const pills = Object.entries(labels)
    .map(([key, fmt]) => {
      const val = params.get(key);
      return val ? { key, label: fmt(val) } : null;
    })
    .filter(Boolean) as { key: string; label: string }[];

  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {pills.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => remove(key)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light border border-primary/20 text-primary font-raleway text-xs font-semibold hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          {label}
          <X size={10} />
        </button>
      ))}
    </div>
  );
}
