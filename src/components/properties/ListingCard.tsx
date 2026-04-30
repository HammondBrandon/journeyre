import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import type { Listing } from "@/lib/rets-types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
  /** Direct CDN URL for the cover photo — skips the proxy route entirely */
  coverPhotoUrl?: string;
}

// GAMLS MlsStatus decoded display values (COMPACT-DECODED output)
const STATUS_STYLES: Record<string, string> = {
  Active:              "bg-primary text-white",
  "Under Contract":    "bg-amber-500 text-white",
  "Back On Market":    "bg-amber-600 text-white",
  Sold:                "bg-ink text-white",
  Pending:             "bg-amber-500 text-white", // legacy alias
  Closed:              "bg-ink text-white",        // legacy alias
};

export default function ListingCard({ listing, priority, coverPhotoUrl }: ListingCardProps) {
  const {
    listingId,
    listPrice,
    status,
    address,
    beds,
    baths,
    sqft,
    propertySubType,
    photoCount,
    officeName,
  } = listing;

  // Prefer the server-fetched CDN URL; fall back to the proxy route
  const hasPhoto = photoCount > 0 || !!coverPhotoUrl;
  const photoSrc = coverPhotoUrl
    ?? (hasPhoto ? `/api/listings/${listingId}/photos?num=0&type=Photo` : null);

  const statusStyle =
    STATUS_STYLES[status] ?? "bg-ink-muted text-white";

  return (
    <article className="group bg-white border border-border-light hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 flex flex-col">
      {/* Photo */}
      <Link
        href={`/properties/${listingId}`}
        className="block relative overflow-hidden aspect-[16/10] bg-surface-alt shrink-0"
        aria-label={`View listing at ${address.full}`}
        tabIndex={-1}
      >
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt={`Photo of ${address.full}`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-border-light">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="w-10 h-10 text-border"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 font-raleway text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 ${statusStyle}`}
        >
          {status}
        </span>
        {photoCount > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white font-raleway text-[10px] px-2 py-0.5">
            {photoCount} photos
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/properties/${listingId}`} className="block group/link mb-1">
          <p className="font-raleway text-xl font-bold text-ink group-hover/link:text-primary transition-colors">
            {formatPrice(listPrice)}
          </p>
        </Link>

        {propertySubType && (
          <p className="font-raleway text-xs uppercase tracking-wide text-primary mb-1">
            {propertySubType}
          </p>
        )}

        <p className="font-lora text-sm text-ink-secondary leading-snug mb-1">
          {address.streetNumber} {address.streetName} {address.streetSuffix}
          {address.unit ? ` #${address.unit}` : ""}
        </p>
        <p className="flex items-center gap-1 font-lora text-xs text-ink-muted mb-4">
          <MapPin size={11} aria-hidden="true" />
          {address.city}, {address.state} {address.zip}
        </p>

        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border-light">
          {beds !== null && (
            <span className="flex items-center gap-1.5 font-raleway text-xs text-ink-secondary">
              <Bed size={12} className="text-primary" aria-hidden="true" />
              {beds} bd
            </span>
          )}
          {baths !== null && (
            <span className="flex items-center gap-1.5 font-raleway text-xs text-ink-secondary">
              <Bath size={12} className="text-primary" aria-hidden="true" />
              {baths} ba
            </span>
          )}
          {sqft !== null && (
            <span className="flex items-center gap-1.5 font-raleway text-xs text-ink-secondary">
              <Square size={12} className="text-primary" aria-hidden="true" />
              {sqft.toLocaleString()} sf
            </span>
          )}
          <span className="ml-auto font-raleway text-[10px] text-ink-muted uppercase tracking-wide">
            MLS# {listingId}
          </span>
        </div>

        {/* GAMLS attribution — required per GAMLS IDX license */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border-light">
          <p className="font-lora text-[10px] text-ink-muted leading-tight">
            Listing Courtesy of:{" "}
            <span className="font-semibold">{officeName ?? "GAMLS Member"}</span>
          </p>
          <Image
            src="/images/gamls-logos/gamls_idx_81x32.png"
            alt="Georgia MLS"
            width={81}
            height={32}
            className="shrink-0"
          />
        </div>
      </div>
    </article>
  );
}
