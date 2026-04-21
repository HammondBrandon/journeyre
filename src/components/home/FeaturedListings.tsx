import { Suspense } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ListingCard from "@/components/properties/ListingCard";
import { searchListings, getBatchCoverPhotos } from "@/lib/rets-client";
import type { Listing } from "@/lib/rets-types";

/**
 * Journey Realty Group's office MLS ID on GAMLS.
 * All listings where this brokerage is the listing office are returned.
 */
const OFFICE_CODE = "JRNY01";
const MAX_FEATURED = 5;

/** Status sort priority — Active first, then Under Contract, then Sold */
const STATUS_RANK: Record<string, number> = {
  Active: 0,
  "Back On Market": 1,
  "Under Contract": 2,
  Sold: 3,
  Closed: 3,
};

/**
 * GAMLS quirk: (ListOffice=...) uses the SystemName, which is only valid
 * when StandardNames=0. With StandardNames=1 the server returns 20200
 * "Unknown Query Field" even though DMQL2 is supposed to use SystemNames
 * regardless. All brokerage queries must explicitly pass standardNames: 0.
 */
const BROKERAGE_QUERY_OPTS = { standardNames: 0 as const };

async function fetchBrokerageListings(): Promise<Listing[]> {
  // Fetch active/under contract from RESI and LAND in parallel
  const [resi, land] = await Promise.allSettled([
    searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=|A,U,B)`,
      limit: MAX_FEATURED,
      offset: 1,
    }),
    searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=|A,U,B)`,
      class: "LAND",
      limit: MAX_FEATURED,
      offset: 1,
    }),
  ]);

  let live: Listing[] = [
    ...(resi.status === "fulfilled" ? resi.value.listings : []),
    ...(land.status === "fulfilled" ? land.value.listings : []),
  ].sort((a, b) => (STATUS_RANK[a.status] ?? 4) - (STATUS_RANK[b.status] ?? 4));

  // If we have fewer than 3 live listings, pad with their most recent sold RESI
  if (live.length < 3) {
    const sold = await searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=S)`,
      limit: MAX_FEATURED - live.length,
      offset: 1,
    }).catch(() => ({ listings: [] as Listing[], totalCount: 0, hasMore: false }));
    live = [...live, ...sold.listings];
  }

  return live.slice(0, MAX_FEATURED);
}

async function FeaturedListingsGrid() {
  const listings = await fetchBrokerageListings();

  if (listings.length === 0) {
    return (
      <p className="font-lora text-sm text-ink-muted text-center py-12">
        No listings available at this time. Check back soon or{" "}
        <a href="/contact" className="text-primary underline underline-offset-2">
          contact us
        </a>{" "}
        for off-market opportunities.
      </p>
    );
  }

  const coverPhotoUrls = await getBatchCoverPhotos(
    listings.map((l) => l.listingId)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, i) => (
        <ListingCard
          key={listing.listingId}
          listing={listing}
          priority={i < 3}
          coverPhotoUrl={coverPhotoUrls.get(listing.listingId)}
        />
      ))}
    </div>
  );
}

/** Skeleton shown while the async grid loads */
function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white border border-border-light animate-pulse">
          <div className="aspect-[16/10] bg-surface-alt" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-surface-alt rounded w-1/3" />
            <div className="h-4 bg-surface-alt rounded w-3/4" />
            <div className="h-3 bg-surface-alt rounded w-1/2" />
            <div className="h-px bg-border-light mt-4" />
            <div className="flex gap-4 pt-1">
              <div className="h-3 bg-surface-alt rounded w-10" />
              <div className="h-3 bg-surface-alt rounded w-10" />
              <div className="h-3 bg-surface-alt rounded w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedListings() {
  return (
    <section
      className="py-20 md:py-28 bg-surface"
      aria-labelledby="listings-heading"
      id="featured"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeader
            id="listings-heading"
            eyebrow="Our Listings"
            title="Journey Realty Listings"
            subtitle="Properties listed by our agents — browse our current and recent listings in West Georgia."
            align="left"
            className="max-w-lg"
          />
          <Button href="/office-listings" variant="outline">
            View All Office Listings
          </Button>
        </div>

        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedListingsGrid />
        </Suspense>
      </div>
    </section>
  );
}
