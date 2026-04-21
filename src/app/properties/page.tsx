import type { Metadata } from "next";
import { Suspense } from "react";
import { searchListings, getBatchCoverPhotos } from "@/lib/rets-client";
import type { PropertyClass } from "@/lib/rets-types";
import SearchFilters, { ActiveFilters } from "@/components/properties/SearchFilters";
import ListingCard from "@/components/properties/ListingCard";
import PaginationBar from "@/components/properties/PaginationBar";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Property Search",
  description:
    "Search homes for sale in Tallapoosa, GA and throughout West Georgia. Browse single-family homes, land, and commercial properties — live GAMLS listings.",
  openGraph: {
    title: "Property Search | Journey Realty Group",
    description:
      "Search available properties in Tallapoosa, GA and West Georgia.",
  },
};

// Don't cache this page — listings change frequently
export const revalidate = 0;

const PAGE_SIZE = 24;

/**
 * Default geographic boundary — West Georgia and East Alabama counties.
 * Applied when no keyword search is active. Users can search any city/zip to override.
 * County names must match GAMLS CountyOrParish field values exactly.
 */
const DEFAULT_COUNTIES = [
  // West Georgia
  "Carroll", "Haralson", "Polk", "Paulding", "Heard", "Troup",
  "Floyd", "Coweta", "Chattooga", "Douglas", "Bartow",
  // East Alabama
  "Cleburne", "Randolph", "Chambers", "Calhoun", "Clay", "Coosa", "Talladega",
];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function sp(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val ?? "";
}

async function ListingResults({
  q,
  type,
  minPrice,
  maxPrice,
  minBeds,
  minBaths,
  status,
  page,
}: {
  q: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  status: string;
  page: number;
}) {
  try {
    const result = await searchListings({
      keyword: q || undefined,
      class: (type as PropertyClass) || "RESI",
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      minBeds: minBeds ? parseInt(minBeds) : undefined,
      minBaths: minBaths ? parseInt(minBaths) : undefined,
      status: status || "Active",
      // Restrict to West GA / East AL when no keyword is entered.
      // A keyword (city name or zip) overrides this boundary automatically.
      counties: q ? undefined : DEFAULT_COUNTIES,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE + 1,
    });

    if (!result.listings.length) {
      return (
        <div className="col-span-full py-20 text-center">
          <div className="w-14 h-14 bg-surface border border-border-light flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={22} className="text-ink-muted" aria-hidden="true" />
          </div>
          <h2 className="font-raleway font-bold text-xl text-ink mb-2">
            No listings found
          </h2>
          <p className="font-lora text-sm text-ink-secondary max-w-sm mx-auto mb-6">
            Try broadening your search criteria or contact one of our agents
            for personalized help.
          </p>
          <Button href="/contact" variant="outline" size="sm">
            Contact an Agent
          </Button>
        </div>
      );
    }

    // Fetch cover photo CDN URLs for all visible listings.
    // Processed in chunks of 4 to respect the RETS per-session concurrency limit.
    // Results are cached (5-min TTL) so subsequent page loads are instant.
    const coverPhotoUrls = await getBatchCoverPhotos(
      result.listings.map((l) => l.listingId)
    );

    return (
      <>
        {/* Result count */}
        <p className="col-span-full font-raleway text-xs text-ink-muted uppercase tracking-wide mb-2">
          {result.totalCount.toLocaleString()} listing
          {result.totalCount !== 1 ? "s" : ""} found
        </p>

        {/* Cards */}
        {result.listings.map((listing, i) => (
          <ListingCard
            key={listing.listingId}
            listing={listing}
            priority={i < 3}
            coverPhotoUrl={coverPhotoUrls.get(listing.listingId)}
          />
        ))}

        {/* Pagination */}
        <div className="col-span-full mt-8">
          <PaginationBar
            totalCount={result.totalCount}
            pageSize={PAGE_SIZE}
            currentPage={page}
          />
        </div>
      </>
    );
  } catch (err) {
    console.error("[Properties Page] RETS error:", err);
    return (
      <div className="col-span-full py-20 text-center">
        <div className="w-14 h-14 bg-surface border border-border-light flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={22} className="text-amber-500" aria-hidden="true" />
        </div>
        <h2 className="font-raleway font-bold text-xl text-ink mb-2">
          Unable to load listings
        </h2>
        <p className="font-lora text-sm text-ink-secondary max-w-sm mx-auto mb-6">
          We're having trouble connecting to the MLS right now. Please try
          again in a moment or contact us directly.
        </p>
        <Button href="/contact" variant="outline" size="sm">
          Contact an Agent
        </Button>
      </div>
    );
  }
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = sp(params.q);
  const type = sp(params.type);
  const minPrice = sp(params.minPrice);
  const maxPrice = sp(params.maxPrice);
  const minBeds = sp(params.minBeds);
  const minBaths = sp(params.minBaths);
  const status = sp(params.status);
  const page = Math.max(1, parseInt(sp(params.page) || "1"));

  return (
    <>
      {/* Page header */}
      <section className="bg-ink text-white py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="MLS Listings"
            title="Search Properties"
            subtitle="Live listings from the Georgia MLS — updated in real time."
            light
            align="left"
            className="max-w-xl mb-0"
          />
        </div>
      </section>

      {/* Search + Results */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filters — client component */}
          <Suspense fallback={null}>
            <SearchFilters />
          </Suspense>

          {/* Active filter pills */}
          <Suspense fallback={null}>
            <ActiveFilters />
          </Suspense>

          {/* Results grid — server rendered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            <Suspense
              fallback={
                <div className="col-span-full py-20 text-center">
                  <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4 font-raleway text-xs text-ink-muted uppercase tracking-wide">
                    Loading listings…
                  </p>
                </div>
              }
            >
              <ListingResults
                q={q}
                type={type}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minBeds={minBeds}
                minBaths={minBaths}
                status={status}
                page={page}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
