import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getListingById,
  getListingPhotos,
  resolveAgent,
  isGarbageAgentName,
} from "@/lib/rets-client";
import type { Listing } from "@/lib/rets-types";
import Button from "@/components/ui/Button";
import PhotoGallery from "@/components/properties/PhotoGallery";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Flame,
  Wind,
  Car,
  Waves,
  Eye,
  TreePine,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export const revalidate = 300; // 5-minute cache on detail pages

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getListingById(id).catch(() => null);
  const listing = result?.listings[0];

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  const streetAddr = `${listing.address.streetNumber} ${listing.address.streetName} ${listing.address.streetSuffix}`;
  const title = `${streetAddr}, ${listing.address.city}, ${listing.address.state} — $${listing.listPrice.toLocaleString()}`;
  const desc = `${listing.propertySubType || listing.propertyType} in ${listing.address.city}, ${listing.address.state}. ${listing.beds ?? ""}${listing.beds ? " bed" : ""}${listing.baths ? `, ${listing.baths} bath` : ""} — $${listing.listPrice.toLocaleString()}. MLS# ${listing.listingId}.`;

  return {
    title: { absolute: `${title} | Journey Realty Group` },
    description: desc,
    openGraph: { title: `${title} | Journey Realty Group`, description: desc },
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-light last:border-0">
      <Icon
        size={15}
        className="text-primary shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <span className="font-raleway text-xs font-semibold uppercase tracking-wide text-ink-muted w-28 shrink-0">
        {label}
      </span>
      <span className="font-lora text-sm text-ink leading-snug">{value}</span>
    </div>
  );
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getListingById(id).catch(() => null);
  const listing: Listing | undefined = result?.listings[0];

  if (!listing) notFound();

  // Resolve the display agent name and office — ShowingContactName may be a
  // ShowingTime placeholder ("TEXT AGENT"). When that happens, look up the
  // real name from the GAMLS Agent:Member resource using the ListAgent code.
  const rawAgentName = listing.agentName;
  const needsLookup =
    isGarbageAgentName(rawAgentName) && !!listing.listAgentCode;
  const resolvedAgent = needsLookup
    ? await resolveAgent(listing.listAgentCode!).catch(() => null)
    : null;
  const displayAgentName =
    resolvedAgent?.name ??
    (rawAgentName && !isGarbageAgentName(rawAgentName)
      ? rawAgentName
      : undefined);
  const displayOfficeName = resolvedAgent?.officeName ?? listing.officeName;

  // Fetch photos from Media:Media — returns ordered CDN URLs (preferred first)
  const photoData = await getListingPhotos(listing.listingId).catch(() => []);
  const photoUrls = photoData.map((p) => p.url);
  const thumbUrls = photoData.map((p) => p.thumbnailUrl);

  const {
    listingId,
    listPrice,
    status,
    address,
    beds,
    baths,
    sqft,
    lotAcres,
    lotSqft,
    propertyType,
    propertySubType,
    photoCount,
    yearBuilt,
    remarks,
    agentPhone,
    agentEmail,
    officeName,
    garageSpaces,
    heating,
    cooling,
    hoaFee,
    hoaFrequency,
    taxAmount,
    daysOnMarket,
    listDate,
    subdivision,
    stories,
    fireplaces,
    hasPool,
    waterfront,
    hasView,
    view,
    lat,
    lng,
  } = listing;

  // Build map query — prefer lat/lng for pin accuracy, fall back to full address
  const mapQuery =
    lat && lng
      ? `${lat},${lng}`
      : `${address.streetNumber} ${address.streetName} ${address.streetSuffix}, ${address.city}, ${address.state} ${address.zip}`;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  const statusColors: Record<string, string> = {
    Active: "bg-primary text-white",
    "Under Contract": "bg-amber-500 text-white",
    "Back On Market": "bg-amber-600 text-white",
    Sold: "bg-ink text-white",
    Pending: "bg-amber-500 text-white", // legacy
    Closed: "bg-ink text-white", // legacy
  };
  const statusStyle = statusColors[status] ?? "bg-ink-muted text-white";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.journeyrealtygroup.net" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://www.journeyrealtygroup.net/properties" },
      {
        "@type": "ListItem",
        position: 3,
        name: `${address.streetNumber} ${address.streetName} ${address.streetSuffix}, ${address.city}, ${address.state}`,
        item: `https://www.journeyrealtygroup.net/properties/${listingId}`,
      },
    ],
  };

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${address.streetNumber} ${address.streetName} ${address.streetSuffix}, ${address.city}, ${address.state}`,
    url: `https://www.journeyrealtygroup.net/properties/${listingId}`,
    description: remarks ?? undefined,
    price: listPrice,
    priceCurrency: "USD",
    numberOfRooms: beds ?? undefined,
    numberOfBathroomsTotal: baths ?? undefined,
    floorSize: sqft ? { "@type": "QuantitativeValue", value: sqft, unitCode: "FTK" } : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${address.streetNumber} ${address.streetName} ${address.streetSuffix}`,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: "US",
    },
    ...(lat && lng ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } } : {}),
    yearBuilt: yearBuilt ?? undefined,
    datePosted: listDate ?? undefined,
    offers: {
      "@type": "Offer",
      price: listPrice,
      priceCurrency: "USD",
      availability:
        status === "Active" || status === "Back On Market"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      {/* Breadcrumb */}
      <nav
        className="bg-surface border-b border-border-light py-3"
        aria-label="Breadcrumb"
      >
        <div className="max-w-7xl mx-auto px-6">
          <ol className="flex items-center gap-1.5 font-raleway text-xs text-ink-muted">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight size={11} aria-hidden="true" />
            <li>
              <Link
                href="/properties"
                className="hover:text-primary transition-colors"
              >
                Properties
              </Link>
            </li>
            <ChevronRight size={11} aria-hidden="true" />
            <li className="text-ink truncate max-w-[200px]">{address.full}</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 min-w-0">
            {/* Photo gallery */}
            <PhotoGallery photos={photoUrls} thumbnails={thumbUrls} />

            {/* Title block */}
            <div className="mt-6 mb-6 pb-6 border-b border-border-light">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <span
                  className={`font-raleway text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 ${statusStyle}`}
                >
                  {status}
                </span>
                {propertySubType && (
                  <span className="font-raleway text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 bg-surface border border-border-light text-ink-secondary">
                    {propertySubType}
                  </span>
                )}
              </div>
              <h1 className="font-raleway font-bold text-2xl md:text-3xl text-ink mb-1">
                {formatPrice(listPrice)}
              </h1>
              <p className="font-lora text-base text-ink-secondary">
                {address.streetNumber} {address.streetName}{" "}
                {address.streetSuffix}
                {address.unit ? ` #${address.unit}` : ""}
              </p>
              <p className="flex items-center gap-1.5 font-lora text-sm text-ink-muted mt-0.5">
                <MapPin size={13} aria-hidden="true" />
                {address.city}, {address.state} {address.zip}
              </p>
            </div>

            {/* Key stats bar */}
            <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-border-light">
              {beds !== null && (
                <div className="flex items-center gap-2">
                  <Bed size={16} className="text-primary" aria-hidden="true" />
                  <span className="font-raleway font-semibold text-sm text-ink">
                    {beds}
                  </span>
                  <span className="font-lora text-xs text-ink-muted">Beds</span>
                </div>
              )}
              {baths !== null && (
                <div className="flex items-center gap-2">
                  <Bath size={16} className="text-primary" aria-hidden="true" />
                  <span className="font-raleway font-semibold text-sm text-ink">
                    {baths}
                  </span>
                  <span className="font-lora text-xs text-ink-muted">
                    Baths
                  </span>
                </div>
              )}
              {sqft !== null && (
                <div className="flex items-center gap-2">
                  <Square
                    size={16}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-raleway font-semibold text-sm text-ink">
                    {sqft.toLocaleString()}
                  </span>
                  <span className="font-lora text-xs text-ink-muted">
                    Sq Ft
                  </span>
                </div>
              )}
              {lotAcres !== null && (
                <div className="flex items-center gap-2">
                  <TreePine
                    size={16}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-raleway font-semibold text-sm text-ink">
                    {lotAcres}
                  </span>
                  <span className="font-lora text-xs text-ink-muted">
                    Acres
                  </span>
                </div>
              )}
              {yearBuilt !== null && (
                <div className="flex items-center gap-2">
                  <Home size={16} className="text-primary" aria-hidden="true" />
                  <span className="font-raleway font-semibold text-sm text-ink">
                    {yearBuilt}
                  </span>
                  <span className="font-lora text-xs text-ink-muted">
                    Built
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {remarks && (
              <div className="mb-8 pb-8 border-b border-border-light">
                <h2 className="font-raleway font-bold text-lg text-ink mb-3">
                  About This Property
                </h2>
                <p className="font-lora text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
                  {remarks}
                </p>
              </div>
            )}

            {/* Property details */}
            <div className="mb-8">
              <h2 className="font-raleway font-bold text-lg text-ink mb-4">
                Property Details
              </h2>
              <div className="bg-surface border border-border-light p-4">
                <StatRow
                  icon={Home}
                  label="Type"
                  value={propertySubType || propertyType}
                />
                <StatRow
                  icon={Square}
                  label="Living Area"
                  value={sqft ? `${sqft.toLocaleString()} sq ft` : null}
                />
                <StatRow
                  icon={TreePine}
                  label="Lot Size"
                  value={
                    lotAcres
                      ? `${lotAcres} acres`
                      : lotSqft
                        ? `${lotSqft.toLocaleString()} sq ft`
                        : null
                  }
                />
                <StatRow icon={Home} label="Year Built" value={yearBuilt} />
                <StatRow icon={Home} label="Stories" value={stories} />
                <StatRow icon={Home} label="Subdivision" value={subdivision} />
                <StatRow icon={Flame} label="Fireplaces" value={fireplaces} />
                <StatRow
                  icon={Car}
                  label="Garage Spaces"
                  value={garageSpaces}
                />
                <StatRow icon={Wind} label="Heating" value={heating} />
                <StatRow icon={Wind} label="Cooling" value={cooling} />
                {hasPool && <StatRow icon={Waves} label="Pool" value="Yes" />}
                {waterfront && (
                  <StatRow icon={Waves} label="Waterfront" value="Yes" />
                )}
                {hasView && (
                  <StatRow icon={Eye} label="View" value={view || "Yes"} />
                )}
              </div>
            </div>

            {/* Financial details */}
            {(hoaFee !== null || taxAmount !== null) && (
              <div className="mb-8">
                <h2 className="font-raleway font-bold text-lg text-ink mb-4">
                  Financial
                </h2>
                <div className="bg-surface border border-border-light p-4">
                  {hoaFee != null && (
                    <StatRow
                      icon={DollarSign}
                      label="HOA Fee"
                      value={`${formatPrice(hoaFee)}${hoaFrequency ? ` / ${hoaFrequency}` : ""}`}
                    />
                  )}
                  {taxAmount != null && (
                    <StatRow
                      icon={DollarSign}
                      label="Annual Tax"
                      value={formatPrice(taxAmount)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Listing info */}
            <div className="text-xs font-raleway text-ink-muted border-t border-border-light pt-6 flex flex-wrap gap-x-6 gap-y-1">
              <span>MLS# {listingId}</span>
              {listDate && (
                <span>
                  Listed{" "}
                  {new Date(listDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {daysOnMarket !== null && (
                <span>{daysOnMarket} days on market</span>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="bg-ink text-white p-6">
              <p className="font-raleway text-2xl font-bold mb-1">
                {formatPrice(listPrice)}
              </p>
              {sqft && sqft > 0 && (
                <p className="font-lora text-sm text-white/70">
                  {formatPrice(Math.round(listPrice / sqft))} / sq ft
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                <Button href="/contact" className="w-full" size="sm">
                  Request a Showing
                </Button>
                <Button
                  href="/selling#cma"
                  variant="white"
                  className="w-full"
                  size="sm"
                >
                  Get a Free CMA
                </Button>
              </div>
            </div>

            {/* Agent card */}
            {(displayAgentName || displayOfficeName) && (
              <div className="bg-surface border border-border-light p-5">
                <p className="font-raleway text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">
                  Listing Agent
                </p>
                {displayAgentName && (
                  <p className="font-raleway font-bold text-base text-ink mb-0.5">
                    {displayAgentName}
                  </p>
                )}
                {displayOfficeName && (
                  <p className="font-lora text-xs text-ink-muted mb-4">
                    {displayOfficeName}
                  </p>
                )}
                <div className="space-y-2">
                  {agentPhone && (
                    <a
                      href={`tel:${agentPhone.replace(/\D/g, "")}`}
                      className="flex items-center gap-2 font-lora text-sm text-primary hover:text-primary-dark transition-colors"
                    >
                      <Phone size={13} aria-hidden="true" />
                      {agentPhone}
                    </a>
                  )}
                  {agentEmail && (
                    <a
                      href={`mailto:${agentEmail}`}
                      className="flex items-center gap-2 font-lora text-sm text-primary hover:text-primary-dark transition-colors break-all"
                    >
                      <Mail size={13} aria-hidden="true" />
                      {agentEmail}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick facts */}
            <div className="bg-surface border border-border-light p-5">
              <p className="font-raleway text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">
                Quick Facts
              </p>
              <ul className="space-y-2">
                {(
                  [
                    ["Status", status],
                    ["Type", propertySubType || propertyType],
                    ["MLS #", listingId],
                    ...(daysOnMarket != null
                      ? [["Days on Market", String(daysOnMarket)]]
                      : []),
                  ] as [string, string][]
                ).map(([label, val]) => (
                  <li key={label} className="flex justify-between gap-2">
                    <span className="font-raleway text-xs text-ink-muted">
                      {label}
                    </span>
                    <span className="font-raleway text-xs font-semibold text-ink text-right">
                      {val}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map */}
            <div className="bg-surface border border-border-light overflow-hidden">
              <iframe
                src={mapSrc}
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing ${address.streetNumber} ${address.streetName} ${address.streetSuffix}, ${address.city}, ${address.state}`}
              />
              <div className="p-3 border-t border-border-light">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 font-raleway text-xs text-primary hover:underline"
                >
                  <MapPin size={11} aria-hidden="true" />
                  {address.streetNumber} {address.streetName}{" "}
                  {address.streetSuffix}, {address.city}, {address.state}{" "}
                  {address.zip} — Open in Google Maps →
                </a>
              </div>
            </div>

            {/* Back to search */}
            <div className="text-center">
              <Link
                href="/properties"
                className="font-raleway text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-primary transition-colors"
              >
                ← Back to Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
