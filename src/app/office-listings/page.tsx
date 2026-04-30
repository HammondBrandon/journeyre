import type { Metadata } from "next";
import { Suspense } from "react";
import { searchListings, getBatchCoverPhotos } from "@/lib/rets-client";
import type { Listing } from "@/lib/rets-types";
import ListingCard from "@/components/properties/ListingCard";
import PaginationBar from "@/components/properties/PaginationBar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Office Listings",
  description:
    "Browse all current and recent listings from Journey Realty Group agents in Tallapoosa, GA and throughout West Georgia.",
  openGraph: {
    title: "Office Listings | Journey Realty Group",
    description:
      "All properties listed by Journey Realty Group agents — active, under contract, and recently sold.",
  },
};

// Don't cache this page — listings change frequently
export const revalidate = 0;

const OFFICE_CODE = "JRNY01";
const PAGE_SIZE = 12;

/** Status sort priority — Active first, then Under Contract, then Sold */
const STATUS_RANK: Record<string, number> = {
  Active: 0,
  "Back On Market": 1,
  "Under Contract": 2,
  Sold: 3,
  Closed: 3,
};

const BROKERAGE_QUERY_OPTS = { standardNames: 0 as const };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function sp(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val ?? "";
}

async function OfficeListingResults({ page }: { page: number }) {
  try {
    // Fetch active/under contract from RESI and LAND in parallel
    const [resi, land] = await Promise.allSettled([
      searchListings({
        ...BROKERAGE_QUERY_OPTS,
        query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=|A,U,B)`,
        limit: 50,
        offset: 1,
      }),
      searchListings({
        ...BROKERAGE_QUERY_OPTS,
        query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=|A,U,B)`,
        class: "LAND",
        limit: 50,
        offset: 1,
      }),
    ]);

    // Sold RESI — paginated
    const soldResi = await searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=|S,X)`,
      limit: 200,
      offset: 1,
    }).catch(() => ({ listings: [] as Listing[], totalCount: 0, hasMore: false }));

    // Sold LAND
    const soldLand = await searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: `(ListOffice=${OFFICE_CODE}),(MlsStatus=|S,X)`,
      class: "LAND",
      limit: 50,
      offset: 1,
    }).catch(() => ({ listings: [] as Listing[], totalCount: 0, hasMore: false }));

    const allListings: Listing[] = [
      ...(resi.status === "fulfilled" ? resi.value.listings : []),
      ...(land.status === "fulfilled" ? land.value.listings : []),
      ...soldResi.listings,
      ...soldLand.listings,
    ].sort((a, b) => (STATUS_RANK[a.status] ?? 4) - (STATUS_RANK[b.status] ?? 4));

    const totalCount = allListings.length;

    if (totalCount === 0) {
      return (
        <div className="col-span-full py-20 text-center">
          <div className="w-14 h-14 bg-surface border border-border-light flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={22} className="text-ink-muted" aria-hidden="true" />
          </div>
          <h2 className="font-raleway font-bold text-xl text-ink mb-2">
            No listings found
          </h2>
          <p className="font-lora text-sm text-ink-secondary max-w-sm mx-auto mb-6">
            We don&apos;t have any active listings right now. Contact one of our
            agents for off-market opportunities.
          </p>
          <Button href="/contact" variant="outline" size="sm">
            Contact an Agent
          </Button>
        </div>
      );
    }

    // Paginate client-side from our full sorted array
    const start = (page - 1) * PAGE_SIZE;
    const paginated = allListings.slice(start, start + PAGE_SIZE);

    const coverPhotoUrls = await getBatchCoverPhotos(
      paginated.map((l) => l.listingId)
    );

    return (
      <>
        {/* Result count */}
        <p className="col-span-full font-raleway text-xs text-ink-muted uppercase tracking-wide mb-2">
          {totalCount.toLocaleString()} listing{totalCount !== 1 ? "s" : ""} from our office
        </p>

        {/* Cards */}
        {paginated.map((listing, i) => (
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
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            currentPage={page}
          />
        </div>
      </>
    );
  } catch (err) {
    console.error("[Office Listings Page] RETS error:", err);
    return (
      <div className="col-span-full py-20 text-center">
        <div className="w-14 h-14 bg-surface border border-border-light flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={22} className="text-amber-500" aria-hidden="true" />
        </div>
        <h2 className="font-raleway font-bold text-xl text-ink mb-2">
          Unable to load listings
        </h2>
        <p className="font-lora text-sm text-ink-secondary max-w-sm mx-auto mb-6">
          We&apos;re having trouble connecting to the MLS right now. Please try
          again in a moment or contact us directly.
        </p>
        <Button href="/contact" variant="outline" size="sm">
          Contact an Agent
        </Button>
      </div>
    );
  }
}

export default async function OfficeListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(sp(params.page) || "1"));

  return (
    <>
      <PageHeader
        eyebrow="Journey Realty Group"
        title="Office Listings"
        subtitle="Properties listed by our agents — active, under contract, and recently sold in West Georgia."
        dark
      />

      {/* Results */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <OfficeListingResults page={page} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
