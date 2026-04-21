import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { agents, getAgentBySlug } from "@/lib/agents";
import type { Agent } from "@/lib/agents";
import Button from "@/components/ui/Button";
import CTASection from "@/components/home/CTASection";
import ListingCard from "@/components/properties/ListingCard";
import PaginationBar from "@/components/properties/PaginationBar";
import { Phone, Mail, MapPin, Award, ChevronLeft } from "lucide-react";
import { searchListings, getBatchCoverPhotos } from "@/lib/rets-client";
import type { Listing } from "@/lib/rets-types";

// Don't cache — listings change frequently
export const revalidate = 0;

const LISTINGS_PAGE_SIZE = 12;

interface AgentPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const OFFICE_CODE = "JRNY01";
const BROKERAGE_QUERY_OPTS = { standardNames: 0 as const };

/** STATUS_RANK — Active first, then Under Contract, then Sold */
const STATUS_RANK: Record<string, number> = {
  Active: 0,
  "Back On Market": 1,
  "Under Contract": 2,
  Sold: 3,
  Closed: 3,
};

async function fetchAgentListings(mlsNames: string[], agentCode?: string): Promise<Listing[]> {
  // When we have a GAMLS agent code, query directly — no client-side filtering needed.
  // When we only have display names, fetch all office listings and filter by ShowingContactName.
  const resiQuery = agentCode
    ? `(ListAgent=${agentCode}),(MlsStatus=|A,U,B,S,X)`
    : `(ListOffice=${OFFICE_CODE}),(MlsStatus=|A,U,B,S,X)`;
  const landQuery = resiQuery;

  const [resi, land] = await Promise.allSettled([
    searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: resiQuery,
      limit: 50,
      offset: 1,
    }),
    searchListings({
      ...BROKERAGE_QUERY_OPTS,
      query: landQuery,
      class: "LAND",
      limit: 50,
      offset: 1,
    }),
  ]);

  const all: Listing[] = [
    ...(resi.status === "fulfilled" ? resi.value.listings : []),
    ...(land.status === "fulfilled" ? land.value.listings : []),
  ];

  // If queried by agent code, all results belong to this agent — no filtering needed.
  // If queried by office, filter down by ShowingContactName.
  const filtered = agentCode
    ? all
    : (() => {
        const nameLowers = mlsNames.map((n) => n.toLowerCase());
        return all.filter((l) => {
          const a = l.agentName?.toLowerCase();
          return a && nameLowers.includes(a);
        });
      })();

  return filtered.sort((a, b) => {
    // Primary: status rank (Active → Under Contract → Sold)
    const rankDiff = (STATUS_RANK[a.status] ?? 4) - (STATUS_RANK[b.status] ?? 4);
    if (rankDiff !== 0) return rankDiff;
    // Secondary: newest first within each status group
    return (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? "");
  });
}

async function AgentListings({ agent, page }: { agent: Agent; page: number }) {
  if (!agent.mlsNames?.length && !agent.mlsAgentCode) return null;

  const allListings = await fetchAgentListings(agent.mlsNames ?? [], agent.mlsAgentCode).catch(() => []);

  if (allListings.length === 0) return null;

  const totalCount = allListings.length;
  const start = (page - 1) * LISTINGS_PAGE_SIZE;
  const paginated = allListings.slice(start, start + LISTINGS_PAGE_SIZE);

  const coverPhotoUrls = await getBatchCoverPhotos(paginated.map((l) => l.listingId));

  return (
    <section className="py-16 md:py-20 bg-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-raleway text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              MLS Listings
            </p>
            <h2 className="font-raleway font-bold text-2xl md:text-3xl text-ink">
              {agent.name.split(" ")[0]}&apos;s Listings
            </h2>
            <p className="font-lora text-sm text-ink-muted mt-1">
              {totalCount} listing{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/office-listings"
            className="hidden sm:block font-raleway text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary-dark transition-colors"
          >
            View All Office Listings →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((listing, i) => (
            <ListingCard
              key={listing.listingId}
              listing={listing}
              priority={i < 3}
              coverPhotoUrl={coverPhotoUrls.get(listing.listingId)}
            />
          ))}
        </div>

        {totalCount > LISTINGS_PAGE_SIZE && (
          <div className="mt-10">
            <PaginationBar
              totalCount={totalCount}
              pageSize={LISTINGS_PAGE_SIZE}
              currentPage={page}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function AgentListingsSkeleton() {
  return (
    <section className="py-16 md:py-20 bg-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-8 w-48 bg-surface animate-pulse mb-8 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-white border border-border-light animate-pulse">
              <div className="aspect-[16/10] bg-surface-alt" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-surface-alt rounded w-1/3" />
                <div className="h-4 bg-surface-alt rounded w-3/4" />
                <div className="h-3 bg-surface-alt rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    return { title: "Agent Not Found" };
  }

  return {
    title: agent.name,
    description: `${agent.name} is a ${agent.title} at Journey Realty Group serving ${agent.serviceAreas.join(", ")}. ${agent.shortBio}`,
    openGraph: {
      title: `${agent.name} | Journey Realty Group`,
      description: agent.shortBio,
    },
  };
}

function AgentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary/20">
      <span className="font-raleway font-bold text-6xl text-primary/60">
        {initials}
      </span>
    </div>
  );
}

export default async function AgentProfilePage({ params, searchParams }: AgentPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1"));
  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return (
    <>
      {/* Back link */}
      <div className="bg-surface border-b border-border-light py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 font-raleway text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-primary transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Team
          </Link>
        </div>
      </div>

      {/* Profile */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Photo */}
              <div className="aspect-[3/4] overflow-hidden mb-6 border border-border-light">
                {agent.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <AgentAvatar name={agent.name} />
                )}
              </div>

              {/* Contact card */}
              <div className="border border-border-light p-6 bg-surface mb-6">
                <h2 className="font-raleway text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
                  Contact {agent.name.split(" ")[0]}
                </h2>
                <div className="space-y-3">
                  <a
                    href={`tel:${agent.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 font-lora text-sm text-ink-secondary hover:text-primary transition-colors"
                  >
                    <Phone size={14} className="text-primary shrink-0" aria-hidden="true" />
                    {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-3 font-lora text-sm text-ink-secondary hover:text-primary transition-colors break-all"
                  >
                    <Mail size={14} className="text-primary shrink-0" aria-hidden="true" />
                    {agent.email}
                  </a>
                </div>
                <div className="mt-5">
                  <Button href={`/contact?agent=${agent.slug}`} variant="primary" className="w-full justify-center">
                    Send a Message
                  </Button>
                </div>
              </div>

              {/* Service areas */}
              {agent.serviceAreas.length > 0 && (
                <div className="border border-border-light p-6 bg-white">
                  <h2 className="font-raleway text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4 flex items-center gap-2">
                    <MapPin size={13} aria-hidden="true" />
                    Service Areas
                  </h2>
                  <ul className="space-y-1.5">
                    {agent.serviceAreas.map((area) => (
                      <li key={area} className="font-lora text-sm text-ink-secondary">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="mb-2">
                <p className="font-raleway text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  Journey Realty Group
                </p>
                <h1 className="font-raleway font-bold text-4xl md:text-5xl text-ink leading-tight mb-1">
                  {agent.name}
                </h1>
                <p className="font-raleway text-sm uppercase tracking-widest text-ink-muted mb-8">
                  {agent.title}
                </p>
              </div>

              {/* Designations */}
              {agent.designations && agent.designations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {agent.designations.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary font-raleway text-xs font-semibold uppercase tracking-wide"
                    >
                      <Award size={11} aria-hidden="true" />
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              <div className="mb-10">
                <h2 className="font-raleway font-bold text-lg text-ink mb-4">
                  About {agent.name.split(" ")[0]}
                </h2>
                <div className="prose-custom font-lora text-ink-secondary leading-relaxed space-y-4">
                  {agent.bio.split("\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              {agent.specialties.length > 0 && (
                <div className="mb-10 p-6 bg-surface border border-border-light">
                  <h2 className="font-raleway font-bold text-base text-ink mb-4">
                    Specialties
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-4 py-2 border border-border text-ink-secondary font-raleway text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* License */}
              {agent.licenseNumber && (
                <p className="font-raleway text-xs text-ink-muted">
                  License #{agent.licenseNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Agent listings */}
      {(!!agent.mlsNames?.length || !!agent.mlsAgentCode) && (
        <Suspense fallback={<AgentListingsSkeleton />}>
          <AgentListings agent={agent} page={page} />
        </Suspense>
      )}

      {/* Other agents */}
      <section className="py-16 bg-surface border-t border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-raleway font-bold text-xl text-ink">
              More of Our Team
            </h2>
            <Link
              href="/team"
              className="font-raleway text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary-dark transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {agents
              .filter((a) => a.slug !== slug)
              .slice(0, 4)
              .map((a) => (
                <Link
                  key={a.id}
                  href={`/team/${a.slug}`}
                  className="group text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full border-2 border-border-light group-hover:border-primary/40 transition-colors">
                    {a.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-light">
                        <span className="font-raleway font-bold text-lg text-primary/60">
                          {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="font-raleway font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                    {a.name}
                  </p>
                  <p className="font-raleway text-xs text-ink-muted">{a.title}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
