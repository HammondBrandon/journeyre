// ─── RETS / RESO Data Dictionary Types ────────────────────────────────────────

/** Property class codes on the dynaConnections/GAMLS server */
export type PropertyClass =
  | "RESI"  // Residential
  | "RLSE"  // Residential Lease
  | "RINC"  // Residential Income
  | "MOBI"  // Mobile Home
  | "LAND"  // Land
  | "FARM"  // Farms
  | "COMS"  // Commercial Sales
  | "COML"  // Commercial Lease
  | "BUSO"; // Business

export const PROPERTY_CLASS_LABELS: Record<PropertyClass, string> = {
  RESI: "Residential",
  RLSE: "Residential Lease",
  RINC: "Residential Income",
  MOBI: "Mobile Home",
  LAND: "Land",
  FARM: "Farm",
  COMS: "Commercial Sale",
  COML: "Commercial Lease",
  BUSO: "Business",
};

/**
 * GAMLS/ConnectMLS RESI field names — verified against METADATA-TABLE.
 * All names here are SystemNames. With StandardNames=1, fields that have a
 * StandardName will appear under their StandardName in the response columns;
 * fields with no StandardName appear under their SystemName.
 *
 * Key differences from RESO defaults:
 *   MlsStatus        ← status field (not StandardStatus)
 *   BathroomsFull    ← full baths (no BathroomsTotalInteger)
 *   BathroomsHalf    ← half baths (combine with full for total)
 *   LivingArea       ← sqft (SystemName only, no StandardName mapping)
 *   PhotosCount      ← photo count (SystemName only)
 *   PropertyView     ← view (StandardName = View)
 *   PoolFeatures     ← pool (non-empty = has pool)
 *   WaterfrontFeatures ← waterfront
 */
/**
 * GAMLS/ConnectMLS field names — confirmed against METADATA-TABLE and live
 * search response (all SystemNames; StandardNames=1 maps them in output).
 *
 * Response column names with StandardNames=1 (SystemName → column):
 *   MlsStatus              → MlsStatus   (StandardName = MlsStatus)
 *   AboveGradeFinishedArea → AboveGradeFinishedArea
 *   BathroomsFull          → BathroomsFull
 *   BathroomsHalf          → BathroomsHalf
 *   PhotosCount            → PhotosCount  (no StandardName; SystemName used)
 *   AttributionContactPhone→ AttributionContact  (StandardName = AttributionContact)
 *   PropertyView           → View         (StandardName = View)
 *   Latitude/Longitude     → Latitude/Longitude (no StandardName)
 *
 * Note: LivingArea IS in metadata but does NOT appear in live response columns.
 *       AboveGradeFinishedArea is the correct sqft field for GAMLS RESI.
 *
 * MlsStatus values on GAMLS: "Active", "Pending", "Sold"  (NOT "Closed")
 */
// MlsStatus short codes (DMQL2 query values) → decoded display values (COMPACT-DECODED):
//   A → Active   |  U → Under Contract  |  B → Back On Market  |  S → Sold
//
// PhotosCount IS in metadata but is NOT returned as a selectable column on this server.
// Always omit it from SELECT. Photo existence is checked at request time via the proxy.

export const SELECT_SUMMARY = [
  "ListingId",
  "ListPrice",
  "MlsStatus",              // A=Active, U=Under Contract, B=Back On Market, S=Sold
  "StreetNumber",
  "StreetName",
  "StreetSuffix",
  "UnitNumber",
  "City",
  "StateOrProvince",
  "PostalCode",
  "BedroomsTotal",
  "BathroomsFull",          // full baths
  "BathroomsHalf",          // half baths — combined in recordToListing
  "AboveGradeFinishedArea", // sqft — LivingArea exists in metadata but isn't returned
  "LotSizeAcres",
  "PropertySubType",
  // PhotosCount intentionally omitted — not selectable on this server
  "YearBuilt",
  "ModificationTimestamp",
  "ShowingContactName",      // listing agent display name — populated on most listings
].join(",");

/** Detail view — adds full description, agent, financials, and features */
export const SELECT_DETAIL = [
  ...SELECT_SUMMARY.split(","),
  "UnparsedAddress",
  "PublicRemarks",
  "AttributionContactPhone", // SystemName → column "AttributionContact" (StandardName)
  "ShowingContactName",      // agent display name — may be a ShowingTime placeholder ("TEXT AGENT")
  "ShowingContactPhone",
  "ListAgent",               // GAMLS agent code — used to look up real name when ShowingContactName is garbage
  "Latitude",
  "Longitude",
  "ParkingTotal",
  "ParkingFeatures",
  "Heating",
  "Cooling",
  "AssociationFee",
  "TaxAnnualAmount",
  "DaysOnMarket",
  "CumulativeDaysOnMarket",
  "ListingContractDate",
  "SubdivisionName",
  "Directions",
  "Levels",                  // stories (no StoriesTotal on GAMLS RESI)
  "FireplacesTotal",
  "PoolFeatures",            // non-empty string = has pool
  "WaterfrontFeatures",      // non-empty string = waterfront
  "PropertyView",            // SystemName → column "View" (StandardName)
  "CloseDate",
  "ClosePrice",
  "CountyOrParish",
  "BelowGradeFinishedArea",
  "Utilities",
  "Sewer",
  "WaterSource",
  "FoundationDetails",
  "Roof",
  "ArchitecturalStyle",
  "CommunityFeatures",
  "LaundryFeatures",
  "InteriorFeatures",
  "ExteriorFeatures",
].join(",");

/** Normalised listing shape used throughout the UI */
export interface Listing {
  listingId: string;
  listPrice: number;
  status: string;
  address: {
    streetNumber: string;
    streetName: string;
    streetSuffix: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotAcres: number | null;
  propertyType: string;
  propertySubType: string;
  photoCount: number;
  yearBuilt: number | null;
  modifiedAt: string;
  // Detail-only fields
  remarks?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  officeName?: string;
  /** GAMLS agent code (ListAgent field) — detail view only, used to resolve real name */
  listAgentCode?: string;
  lat?: number | null;
  lng?: number | null;
  garageSpaces?: number | null;
  heating?: string;
  cooling?: string;
  hoaFee?: number | null;
  hoaFrequency?: string;
  taxAmount?: number | null;
  daysOnMarket?: number | null;
  listDate?: string;
  subdivision?: string;
  directions?: string;
  lotSqft?: number | null;
  stories?: number | null;
  fireplaces?: number | null;
  hasPool?: boolean;
  waterfront?: boolean;
  hasView?: boolean;
  view?: string;
}

export interface SearchParams {
  class?: PropertyClass;
  query?: string;           // raw DMQL2 override
  keyword?: string;         // city, zip, address text search
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  propertyType?: PropertyClass;
  status?: string;          // Active | Pending | Closed
  /** Restrict results to these counties (CountyOrParish OR filter). Applied as default area boundary. */
  counties?: string[];
  limit?: number;
  offset?: number;
  select?: string;
  standardNames?: 0 | 1;
}

export interface SearchResult {
  totalCount: number;
  hasMore: boolean;
  listings: Listing[];
}

// ─── Raw record → Listing ──────────────────────────────────────────────────

function num(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function bool(val: string | undefined): boolean {
  return (
    val?.trim().toLowerCase() === "y" ||
    val?.trim().toLowerCase() === "yes" ||
    val?.trim() === "1" ||
    val?.trim().toLowerCase() === "true"
  );
}

/** True if a feature string has a real value (non-empty and not "None") */
function nonEmpty(val: string | undefined): boolean {
  if (!val || val.trim() === "" || val.trim().toLowerCase() === "none") return false;
  return true;
}

/**
 * Pick the first defined, non-empty value from a list of field name aliases.
 * Handles cases where the GAMLS server uses a slightly different RESO name
 * than what we expect (e.g. PhotosCount vs MediaCount).
 */
function pick(r: Record<string, string>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    if (r[k] !== undefined && r[k].trim() !== "") return r[k];
  }
  return undefined;
}

export function recordToListing(r: Record<string, string>): Listing {
  const street = [r.StreetNumber, r.StreetName, r.StreetSuffix]
    .filter(Boolean)
    .join(" ");
  const cityStateZip = [r.City, r.StateOrProvince ?? "", r.PostalCode]
    .filter(Boolean)
    .join(", ");

  // Baths: GAMLS has BathroomsFull + BathroomsHalf — compute a total
  const fullBaths = num(pick(r, "BathroomsFull")) ?? 0;
  const halfBaths = num(pick(r, "BathroomsHalf")) ?? 0;
  const totalBaths = fullBaths + halfBaths * 0.5;

  // Pool/waterfront/view: stored as feature strings, non-empty = yes
  const poolFeatures      = pick(r, "PoolFeatures", "PoolPrivateYN");
  const waterfrontFeatures = pick(r, "WaterfrontFeatures", "WaterfrontYN");
  // PropertyView SystemName → StandardName "View" — column name in response is "View"
  const viewValue = pick(r, "View", "PropertyView", "ViewYN");

  return {
    listingId: pick(r, "ListingId") ?? "",
    listPrice: num(pick(r, "ListPrice")) ?? 0,

    // MlsStatus = both SystemName and StandardName on GAMLS
    status: pick(r, "MlsStatus", "StandardStatus", "Status") ?? "",

    address: {
      streetNumber: pick(r, "StreetNumber") ?? "",
      streetName:   pick(r, "StreetName")   ?? "",
      streetSuffix: pick(r, "StreetSuffix") ?? "",
      unit:         pick(r, "UnitNumber", "Unit") ?? "",
      city:         pick(r, "City")         ?? "",
      state:        pick(r, "StateOrProvince") ?? "",
      zip:          pick(r, "PostalCode")   ?? "",
      full:         r.UnparsedAddress || `${street}, ${cityStateZip}`,
    },

    beds:     num(pick(r, "BedroomsTotal")),
    baths:    totalBaths > 0 ? totalBaths : null,
    // AboveGradeFinishedArea is the confirmed sqft column on GAMLS RESI.
    // LivingArea is in metadata but not returned in the live response.
    sqft:     num(pick(r, "AboveGradeFinishedArea", "LivingArea")),
    lotAcres: num(pick(r, "LotSizeAcres")),

    propertyType:    pick(r, "PropertyType")    ?? "",
    propertySubType: pick(r, "PropertySubType") ?? "",
    // PhotosCount not selectable on this server — optimistically assume 1 photo
    // so we always attempt to load cover image; proxy returns 404 if none exist.
    photoCount:      num(pick(r, "PhotosCount")) ?? 1,
    yearBuilt:       num(pick(r, "YearBuilt")),
    modifiedAt:      pick(r, "ModificationTimestamp") ?? "",

    // ── Detail-only fields ──────────────────────────────────────────────
    remarks: pick(r, "PublicRemarks"),

    // GAMLS Property resource has no agent full name field.
    // AttributionContactPhone SystemName → "AttributionContact" column (StandardName).
    // ShowingContactName/Phone are the best available on the Property resource.
    agentName:     pick(r, "ShowingContactName"),
    agentPhone:    pick(r, "AttributionContact", "ShowingContactPhone"),
    agentEmail:    undefined,
    officeName:    pick(r, "ListOfficeName"),
    listAgentCode: pick(r, "ListAgent"),

    lat: num(pick(r, "Latitude")),
    lng: num(pick(r, "Longitude")),

    // ParkingTotal = nearest equivalent to garage spaces on GAMLS
    garageSpaces: num(pick(r, "ParkingTotal")),
    heating:      pick(r, "Heating"),
    cooling:      pick(r, "Cooling"),
    hoaFee:       num(pick(r, "AssociationFee")),
    hoaFrequency: pick(r, "AssociationFeeFrequency"),
    taxAmount:    num(pick(r, "TaxAnnualAmount")),
    daysOnMarket: num(pick(r, "DaysOnMarket")),
    listDate:     pick(r, "ListingContractDate"),
    subdivision:  pick(r, "SubdivisionName"),
    directions:   pick(r, "Directions"),
    lotSqft:      null, // no LotSizeSquareFeet on GAMLS RESI
    stories:      num(pick(r, "Levels")),
    fireplaces:   num(pick(r, "FireplacesTotal")),

    // Pool/waterfront/view: feature fields — non-empty & not "None" = yes
    hasPool:    nonEmpty(poolFeatures),
    waterfront: nonEmpty(waterfrontFeatures),
    hasView:    nonEmpty(viewValue),
    view:       viewValue,
  };
}
