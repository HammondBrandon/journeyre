/**
 * Journey Realty — RETS Client
 * ─────────────────────────────
 * Lightweight, zero-vulnerable-dependency RETS client for the GAMLS
 * dynaConnections/ConnectMLS server. Uses native fetch + Node crypto for
 * Digest auth. No `request`, no `rets-client` npm package in production.
 *
 * Server: https://gamls-rets.connectmls.com
 * Protocol: RETS 1.7.2 · COMPACT format · RESO Data Dictionary
 */

import crypto from "node:crypto";
import type {
  SearchParams,
  SearchResult,
  PropertyClass,
} from "./rets-types";
import {
  SELECT_SUMMARY,
  SELECT_DETAIL,
  recordToListing,
} from "./rets-types";

// ─── Internal session shape ───────────────────────────────────────────────────

interface RetsSession {
  cookie: string;
  searchUrl: string;
  getObjectUrl: string;
  getMetadataUrl: string;
  logoutUrl: string;
  baseUrl: string;
}

// Module-level cache — persists across warm Vercel function invocations
let _session: { data: RetsSession; expiresAt: number } | null = null;

// ─── Digest auth ──────────────────────────────────────────────────────────────

function md5(str: string): string {
  return crypto.createHash("md5").update(str).digest("hex");
}

interface DigestChallenge {
  realm: string;
  nonce: string;
  qop?: string;
  opaque?: string;
}

function parseDigestChallenge(header: string): DigestChallenge {
  const get = (key: string) =>
    header.match(new RegExp(`${key}="([^"]+)"`))?.[1] ?? "";
  const getUnquoted = (key: string) =>
    header.match(new RegExp(`${key}=([^,\\s"]+)`))?.[1];
  return {
    realm: get("realm"),
    nonce: get("nonce"),
    qop: getUnquoted("qop"),
    opaque: get("opaque") || undefined,
  };
}

function buildDigestHeader(
  username: string,
  password: string,
  method: string,
  uriPath: string,
  challenge: DigestChallenge
): string {
  const { realm, nonce, qop, opaque } = challenge;
  const ha1 = md5(`${username}:${realm}:${password}`);
  const ha2 = md5(`${method.toUpperCase()}:${uriPath}`);

  let response: string;
  let header: string;

  if (qop) {
    const nc = "00000001";
    const cnonce = crypto.randomBytes(8).toString("hex");
    response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
    header = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uriPath}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;
  } else {
    response = md5(`${ha1}:${nonce}:${ha2}`);
    header = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uriPath}", response="${response}"`;
  }

  if (opaque) header += `, opaque="${opaque}"`;
  return header;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getConfig() {
  const loginUrl = process.env.RETS_LOGIN_URL;
  const username = process.env.RETS_USERNAME;
  const password = process.env.RETS_PASSWORD;

  if (!loginUrl || !username || !password) {
    throw new Error(
      "Missing RETS credentials. Set RETS_LOGIN_URL, RETS_USERNAME, and RETS_PASSWORD in .env.local"
    );
  }

  return {
    loginUrl,
    username,
    password,
    userAgent: process.env.RETS_USER_AGENT ?? "JourneyRealty/1.0",
  };
}

function retsHeaders(
  userAgent: string,
  extra: Record<string, string> = {}
): Record<string, string> {
  return {
    "User-Agent": userAgent,
    "RETS-Version": "RETS/1.7.2",
    Accept: "*/*",
    "Accept-Encoding": "identity",
    Connection: "keep-alive",
    ...extra,
  };
}

function getReplyCode(xml: string): number {
  return parseInt(xml.match(/ReplyCode="(\d+)"/)?.[1] ?? "0", 10);
}

function parseLoginResponse(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const match = xml.match(/<RETS-RESPONSE[^>]*>([\s\S]*?)<\/RETS-RESPONSE>/);
  if (!match) return result;
  for (const line of match[1].split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) {
      result[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
  }
  return result;
}

/**
 * ShowingTime / CSS placeholder values that appear in ShowingContactName
 * but are not real agent names. When detected, we fall back to the Agent resource.
 */
const AGENT_NAME_GARBAGE = new Set([
  "text agent",
  "agent",
  "showing agent",
  "contact agent",
  "call agent",
  "see agent",
  "css agent",
  "supra agent",
  "agent name",
  "n/a",
]);

/** Parse COMPACT (tab-delimited) RETS response into plain objects */
function parseCompact(xml: string): {
  columns: string[];
  records: Record<string, string>[];
  totalCount: number;
  hasMore: boolean;
} {
  const delimMatch = xml.match(/<DELIMITER value="(\d+)"\/>/);
  const delim = delimMatch
    ? String.fromCharCode(parseInt(delimMatch[1], 10))
    : "\t";

  const colMatch = xml.match(/<COLUMNS>(.*?)<\/COLUMNS>/s);
  if (!colMatch) {
    return { columns: [], records: [], totalCount: 0, hasMore: false };
  }

  // Columns row starts and ends with delimiter — filter empty strings
  const columns = colMatch[1].split(delim).filter((s) => s.trim() !== "");

  const dataMatches = [...xml.matchAll(/<DATA>(.*?)<\/DATA>/gs)];
  const records = dataMatches.map((m) => {
    const parts = m[1].split(delim);
    // Data rows also start with delimiter — skip leading empty element
    const values = parts[0] === "" ? parts.slice(1) : parts;
    const rec: Record<string, string> = {};
    columns.forEach((col, i) => {
      rec[col] = (values[i] ?? "").trim();
    });
    return rec;
  });

  const countMatch = xml.match(/<COUNT Records="(\d+)"/);
  const totalCount = countMatch ? parseInt(countMatch[1], 10) : records.length;
  const hasMore = /<MAXROWS\s*\/>/.test(xml);

  return { columns, records, totalCount, hasMore };
}

// ─── Login / session management ───────────────────────────────────────────────

async function login(): Promise<RetsSession> {
  const { loginUrl, username, password, userAgent } = getConfig();
  const baseUrl = new URL(loginUrl).origin;
  const loginPath = new URL(loginUrl).pathname;

  // Step 1 — probe (expect 401 with WWW-Authenticate)
  const probe = await fetch(loginUrl, {
    headers: retsHeaders(userAgent),
    redirect: "follow",
  });

  let authHeader: string;

  if (probe.status === 401) {
    const wwwAuth = probe.headers.get("WWW-Authenticate") ?? "";
    if (wwwAuth.toLowerCase().startsWith("digest")) {
      authHeader = buildDigestHeader(
        username,
        password,
        "GET",
        loginPath,
        parseDigestChallenge(wwwAuth)
      );
    } else {
      // Basic auth fallback
      authHeader =
        "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    }
  } else if (probe.ok) {
    // Rare: server accepted without challenge
    const xml = await probe.text();
    const cookie = probe.headers.get("set-cookie")?.split(";")[0] ?? "";
    return buildSession(xml, baseUrl, cookie);
  } else {
    throw new Error(`RETS login unexpected status: ${probe.status}`);
  }

  // Step 2 — authenticated request
  const authed = await fetch(loginUrl, {
    headers: retsHeaders(userAgent, { Authorization: authHeader }),
    redirect: "follow",
  });

  if (!authed.ok) {
    throw new Error(
      `RETS login failed: ${authed.status} ${authed.statusText}`
    );
  }

  const xml = await authed.text();
  const replyCode = getReplyCode(xml);
  if (replyCode !== 0) {
    throw new Error(`RETS login error: ReplyCode ${replyCode}\n${xml}`);
  }

  const setCookie = authed.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];
  return buildSession(xml, baseUrl, cookie);
}

function buildSession(
  loginXml: string,
  baseUrl: string,
  cookie: string
): RetsSession {
  const data = parseLoginResponse(loginXml);

  const resolve = (key: string, fallback: string): string => {
    const val = data[key] ?? fallback;
    return val.startsWith("http") ? val : `${baseUrl}${val}`;
  };

  return {
    cookie,
    baseUrl,
    searchUrl: resolve("Search", "/rets/server/search"),
    getObjectUrl: resolve("GetObject", "/rets/server/getobject"),
    getMetadataUrl: resolve("GetMetadata", "/rets/server/getmetadata"),
    logoutUrl: resolve("Logout", "/rets/server/logout"),
  };
}

export function invalidateSession(): void {
  _session = null;
}

async function getSession(): Promise<RetsSession> {
  if (_session && Date.now() < _session.expiresAt) {
    return _session.data;
  }
  const data = await login();
  // Cache for 25 min (server timeout is 30 min)
  _session = { data, expiresAt: Date.now() + 25 * 60 * 1000 };
  return data;
}

// ─── Core RETS operations ─────────────────────────────────────────────────────

async function retsGet(
  url: string,
  session: RetsSession
): Promise<Response> {
  const { userAgent } = getConfig();
  const res = await fetch(url, {
    headers: retsHeaders(userAgent, { Cookie: session.cookie }),
  });

  // Session expired — retry once with fresh login
  if (res.status === 401) {
    invalidateSession();
    const fresh = await getSession();
    return fetch(url, {
      headers: retsHeaders(userAgent, { Cookie: fresh.cookie }),
    });
  }

  return res;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a DMQL2 query string from structured search params.
 *
 * GAMLS/ConnectMLS field names used here are SystemNames — DMQL2 always
 * queries by SystemName regardless of the StandardNames setting.
 *
 * Confirmed SystemNames (from METADATA-TABLE):
 *   MlsStatus, ListPrice, BedroomsTotal, BathroomsFull, City, PostalCode
 */
export function buildDmqlQuery(params: SearchParams): string {
  const conditions: string[] = [];

  // Status — MlsStatus uses SHORT LOOKUP CODES in DMQL2 queries (not decoded values).
  // GAMLS codes: A=Active, U=Under Contract, B=Back On Market, S=Sold
  // The params.status value may come in as a display string or short code.
  const STATUS_CODES: Record<string, string> = {
    Active:            "A",
    Pending:           "U", // GAMLS has no "Pending" — closest is Under Contract
    "Under Contract":  "U",
    "Active,Pending":  "A,U",
    "A,U":             "A,U",
    Sold:              "S",
    Closed:            "S", // legacy alias
    "Back On Market":  "B",
  };
  const rawStatus = params.status ?? "Active";
  const statusCode = STATUS_CODES[rawStatus] ?? rawStatus;
  if (statusCode.includes(",")) {
    conditions.push(`(MlsStatus=|${statusCode})`);
  } else {
    conditions.push(`(MlsStatus=${statusCode})`);
  }

  // Price range
  if (params.minPrice && params.maxPrice) {
    conditions.push(`(ListPrice=${params.minPrice}-${params.maxPrice})`);
  } else if (params.minPrice) {
    conditions.push(`(ListPrice=${params.minPrice}+)`);
  } else if (params.maxPrice) {
    conditions.push(`(ListPrice=0-${params.maxPrice})`);
  }

  // Beds / baths — GAMLS uses BathroomsFull (no BathroomsTotalInteger)
  if (params.minBeds) {
    conditions.push(`(BedroomsTotal=${params.minBeds}+)`);
  }
  if (params.minBaths) {
    conditions.push(`(BathroomsFull=${params.minBaths}+)`);
  }

  // Keyword: 5-digit zip → PostalCode, otherwise → City
  if (params.keyword) {
    const kw = params.keyword.trim();
    if (/^\d{5}$/.test(kw)) {
      conditions.push(`(PostalCode=${kw})`);
    } else {
      conditions.push(`(City=${kw})`);
    }
  }

  // County boundary — only applied when no keyword overrides it
  if (params.counties?.length && !params.keyword) {
    conditions.push(`(CountyOrParish=|${params.counties.join(",")})`);
  }

  return conditions.join(",");
}

/**
 * Per-class column cache — populated on first successful no-Select request.
 * Persists for the lifetime of the warm function instance.
 * Key: `${standardNames}:${class}`, value: comma-joined column list.
 */
const _columnCache: Map<string, string> = new Map();

/** Build the URLSearchParams for a RETS Search request */
function buildSearchQs(
  session: RetsSession,
  params: {
    propertyClass: PropertyClass;
    standardNames: number;
    query: string;
    select: string | undefined;
    limit: number;
    offset: number;
  }
): URLSearchParams {
  const { propertyClass, standardNames, query, select, limit, offset } = params;
  const qs = new URLSearchParams({
    SearchType: "Property",
    Class: propertyClass,
    QueryType: "DMQL2",
    Format: "COMPACT-DECODED",
    StandardNames: String(standardNames),
    Query: query,
    Count: "1",
    Limit: String(limit),
    Offset: String(offset),
  });
  if (select) qs.set("Select", select);
  void session; // used by caller
  return qs;
}

/** Search listings — returns normalised Listing array */
export async function searchListings(
  params: SearchParams
): Promise<SearchResult> {
  const session = await getSession();

  const propertyClass: PropertyClass = params.class ?? params.propertyType ?? "RESI";
  const query = params.query ?? buildDmqlQuery(params);
  const limit = params.limit ?? 24;
  const offset = params.offset ?? 1;
  const standardNames = params.standardNames ?? 1;

  // Resolve the Select: use explicit override, cached good columns, or default
  const cacheKey = `${standardNames}:${propertyClass}`;
  const cachedSelect = _columnCache.get(cacheKey);
  const requestedSelect = params.select ?? cachedSelect ?? SELECT_SUMMARY;

  const doSearch = async (select: string | undefined): Promise<{ xml: string; ok: boolean }> => {
    const qs = buildSearchQs(session, {
      propertyClass,
      standardNames,
      query,
      select,
      limit,
      offset,
    });
    const res = await retsGet(`${session.searchUrl}?${qs}`, session);
    if (!res.ok) {
      throw new Error(`RETS search HTTP error: ${res.status}`);
    }
    return { xml: await res.text(), ok: true };
  };

  let { xml } = await doSearch(requestedSelect);
  let replyCode = getReplyCode(xml);

  // 20202 = Invalid Select — retry without Select to discover available columns
  if (replyCode === 20202) {
    console.warn(
      `[RETS] Invalid Select for class ${propertyClass} (StandardNames=${standardNames}). ` +
        "Retrying without Select — available columns will be logged below."
    );
    ({ xml } = await doSearch(undefined));
    replyCode = getReplyCode(xml);
  }

  // 20201 = no records
  // If the query included a status filter, retry once without it so we can
  // confirm whether listings exist and diagnose query field name issues.
  if (replyCode === 20201 && query.includes("StandardStatus")) {
    const fallbackQuery = query
      .replace(/,?\(StandardStatus=[^)]+\),?/g, "")
      .replace(/^,|,$/g, "") || "(ListPrice=1+)";

    console.warn(
      `[RETS] Zero results for query: ${query}\n` +
        `  → Retrying without status filter: ${fallbackQuery}\n` +
        `  → If this also returns 0, check Class/credentials.\n` +
        `  → If this returns results, the status field name or value is wrong.\n` +
        `  → Common fix: GAMLS may use system name LIST_STATUS with value "A" instead of StandardStatus=Active.`
    );

    const { xml: fallbackXml } = await doSearch(undefined);
    const fallbackReplyCode = getReplyCode(fallbackXml);

    // Log raw XML snippet to help identify the correct field names
    if (fallbackReplyCode === 20201) {
      console.error(
        `[RETS] Fallback also returned 0 results.\n` +
          `  Class: ${propertyClass}, StandardNames: ${standardNames}\n` +
          `  Raw XML: ${fallbackXml.slice(0, 400)}`
      );
      return { totalCount: 0, hasMore: false, listings: [] };
    }

    if (fallbackReplyCode !== 0) {
      console.error(`[RETS] Fallback error ${fallbackReplyCode}: ${fallbackXml.slice(0, 200)}`);
      return { totalCount: 0, hasMore: false, listings: [] };
    }

    // Fallback succeeded — log the columns and first record
    const { columns, records, totalCount, hasMore } = parseCompact(fallbackXml);
    if (columns.length > 0) {
      console.info(
        `[RETS] ✅ Fallback query succeeded (${totalCount} records).\n` +
          `Available columns for ${propertyClass} (StandardNames=${standardNames}):\n` +
          columns.join(", ") +
          "\n\nThe status filter is the issue — compare the status column values above\n" +
          "against what buildDmqlQuery sends, then update SELECT_SUMMARY and\n" +
          "buildDmqlQuery in src/lib/rets-client.ts accordingly."
      );
      if (records[0]) {
        const statusCol = columns.find((c) =>
          /status/i.test(c)
        );
        if (statusCol) {
          // Sample the first 5 distinct status values to identify the correct value
          const statusValues = [
            ...new Set(records.slice(0, 10).map((r) => r[statusCol])),
          ];
          console.info(
            `[RETS] Status column: "${statusCol}"\n` +
              `       Sample values: ${statusValues.join(", ")}`
          );
        }
      }
    }
    return { totalCount, hasMore, listings: records.map(recordToListing) };
  }

  // Original 20201 path (no status filter involved, or non-status query)
  if (replyCode === 20201) {
    return { totalCount: 0, hasMore: false, listings: [] };
  }

  if (replyCode !== 0) {
    throw new Error(`RETS search ReplyCode ${replyCode}: ${xml.slice(0, 200)}`);
  }

  const { columns, records, totalCount, hasMore } = parseCompact(xml);

  // Cache the discovered columns so subsequent calls skip the retry
  if (!_columnCache.has(cacheKey) && columns.length > 0) {
    _columnCache.set(cacheKey, columns.join(","));
    console.info(
      `[RETS] Available columns for ${propertyClass} (StandardNames=${standardNames}):\n` +
        columns.join(", ") +
        "\n\nUpdate SELECT_SUMMARY in src/lib/rets-types.ts with the names above " +
        "that map to the fields you need."
    );
  }

  return {
    totalCount,
    hasMore,
    listings: records.map(recordToListing),
  };
}

/** Fetch a single listing by ListingId */
export async function getListingById(
  listingId: string
): Promise<SearchResult> {
  return searchListings({
    query: `(ListingId=${listingId})`,
    select: SELECT_DETAIL,
    limit: 1,
    // Search all statuses so closed/pending listings still resolve
    status: undefined,
  });
}

export interface ListingPhoto {
  url: string;
  thumbnailUrl: string;
  order: number;
  preferred: boolean;
}

/**
 * Module-level photo cache — avoids re-querying Media:Media for the same
 * listing within a warm function invocation (5-minute TTL).
 */
const _photoCache: Map<string, { photos: ListingPhoto[]; cachedAt: number }> =
  new Map();

const PHOTO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all photo URLs for a listing via the GAMLS Media:Media RETS resource.
 * Photos are on a public CDN (gamls-assets.cdn-connectmls.com) — no auth needed
 * to load them; this function only authenticates to query the Media metadata.
 *
 * Returns an ordered array (preferred photo first, then by MediaOrder).
 * Falls back to [] if Media resource is unavailable or listing has no photos.
 */
export async function getListingPhotos(
  listingId: string
): Promise<ListingPhoto[]> {
  // Serve from cache if fresh
  const cached = _photoCache.get(listingId);
  if (cached && Date.now() - cached.cachedAt < PHOTO_CACHE_TTL_MS) {
    return cached.photos;
  }

  try {
    const session = await getSession();

    const qs = new URLSearchParams({
      SearchType: "Media",
      Class: "Media",
      QueryType: "DMQL2",
      Format: "COMPACT-DECODED",
      StandardNames: "0",
      Query: `(MediaResourceId=${listingId})`,
      Select: "MediaOrder,MediaURL,MediaThumbnailURL,PreferredPhoto,MediaType",
      Count: "1",
      Limit: "50",
      Offset: "1",
    });

    const res = await retsGet(`${session.searchUrl}?${qs}`, session);
    if (!res.ok) return [];

    const xml = await res.text();
    const code = getReplyCode(xml);
    if (code !== 0) {
      if (code === 20201) {
        // Listing genuinely has no photos — safe to cache the empty result
        _photoCache.set(listingId, { photos: [], cachedAt: Date.now() });
      } else {
        // Transient error (rate limit, server hiccup, etc.) — do NOT cache so
        // the next request retries rather than serving a stale empty result
        console.warn(`[RETS] Media query for ${listingId} returned code ${code} — skipping cache`);
      }
      return [];
    }

    const { records } = parseCompact(xml);

    const IMAGE_TYPES = new Set(["jpeg", "jpg", "png", "webp", "gif"]);

    const photos: ListingPhoto[] = records
      .map((r) => ({
        url: r.MediaURL ?? "",
        thumbnailUrl: r.MediaThumbnailURL ?? "",
        order: parseInt(r.MediaOrder ?? "0", 10),
        preferred: r.PreferredPhoto?.toUpperCase() === "Y",
        mediaType: (r.MediaType ?? "").toLowerCase().trim(),
      }))
      // Keep only actual image records — filter out PDFs, documents, etc.
      .filter((p) => {
        if (!p.url) return false;
        if (p.mediaType && IMAGE_TYPES.has(p.mediaType)) return true;
        if (p.mediaType && p.mediaType !== "") return false; // known non-image type
        // Fallback: check URL extension if MediaType is empty
        const ext = p.url.split(".").pop()?.toLowerCase() ?? "";
        return IMAGE_TYPES.has(ext);
      })
      .map(({ url, thumbnailUrl, order, preferred }) => ({
        url,
        // If thumbnail URL is empty (shouldn't happen for photos, but guard it)
        thumbnailUrl: thumbnailUrl || url,
        order,
        preferred,
      }))
      .sort((a, b) => {
        // Preferred photo sorts first, then by MediaOrder
        if (a.preferred && !b.preferred) return -1;
        if (!a.preferred && b.preferred) return 1;
        return a.order - b.order;
      });

    _photoCache.set(listingId, { photos, cachedAt: Date.now() });
    return photos;
  } catch (err) {
    console.error(`[RETS] getListingPhotos error for ${listingId}:`, err);
    return [];
  }
}

/**
 * Fetch cover photo URLs for a list of listing IDs with bounded concurrency.
 *
 * The RETS server enforces a per-session concurrent request limit (~5).
 * Running all queries in parallel (Promise.allSettled) causes failures for
 * larger pages. This function processes listings in chunks of CONCURRENCY,
 * waiting for each chunk to complete before starting the next.
 *
 * Returns a Map<listingId, coverPhotoUrl>. Missing entries mean no photos.
 * Cache-hits from getListingPhotos are instant, so the cost shrinks fast.
 */
const PHOTO_CONCURRENCY = 4;

export async function getBatchCoverPhotos(
  listingIds: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (listingIds.length === 0) return result;

  for (let i = 0; i < listingIds.length; i += PHOTO_CONCURRENCY) {
    const chunk = listingIds.slice(i, i + PHOTO_CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map((id) => getListingPhotos(id))
    );
    settled.forEach((r, j) => {
      if (r.status === "fulfilled" && r.value.length > 0) {
        result.set(chunk[j], r.value[0].url);
      }
    });
  }

  return result;
}

/** Module-level agent cache — avoids repeated Agent:Member queries */
const _agentCache = new Map<string, ResolvedAgent | null>();

/**
 * Resolve the real display name for a GAMLS agent code.
 *
 * Queries the Agent resource (MemberKey = agentCode) and returns
 * MemberFirstName + MemberLastName. Result is cached for the lifetime
 * of the warm function instance.
 *
 * Returns undefined if the agent cannot be found or the query fails.
 */
export interface ResolvedAgent {
  name: string;
  officeName?: string;
}

/**
 * Look up an agent's real name and office from the GAMLS Agent:Member resource.
 * Results are cached for the lifetime of the warm function instance.
 * Returns null if not found or on error.
 */
export async function resolveAgent(agentCode: string): Promise<ResolvedAgent | null> {
  if (!agentCode) return null;

  if (_agentCache.has(agentCode)) return _agentCache.get(agentCode) ?? null;

  try {
    const session = await getSession();
    const qs = new URLSearchParams({
      SearchType:    "Agent",
      Class:         "Member",       // GAMLS Agent resource class is "Member"
      QueryType:     "DMQL2",
      Format:        "COMPACT-DECODED",
      StandardNames: "0",
      Query:         `(UserId=${agentCode})`,  // ListAgent code = UserId in Agent:Member
      Select:        "UserId,FirstName,LastName,MemberFullName,OfficeName",
      Count:         "1",
      Limit:         "1",
      Offset:        "1",
    });

    const res = await retsGet(`${session.searchUrl}?${qs}`, session);
    const xml = await res.text();

    if (getReplyCode(xml) !== 0) {
      _agentCache.set(agentCode, null);
      return null;
    }

    const { records } = parseCompact(xml);
    const r = records[0];
    if (!r) {
      _agentCache.set(agentCode, null);
      return null;
    }

    const name =
      r.MemberFullName?.trim() ||
      [r.FirstName, r.LastName].filter(Boolean).join(" ").trim();

    if (!name) {
      _agentCache.set(agentCode, null);
      return null;
    }

    const agent: ResolvedAgent = {
      name,
      officeName: r.OfficeName?.trim() || undefined,
    };
    _agentCache.set(agentCode, agent);
    return agent;
  } catch (err) {
    console.warn(`[RETS] resolveAgent failed for ${agentCode}:`, err);
    _agentCache.set(agentCode, null);
    return null;
  }
}

/** Convenience wrapper — returns just the name string */
export async function resolveAgentName(agentCode: string): Promise<string | undefined> {
  return (await resolveAgent(agentCode))?.name;
}

/**
 * Returns true if the ShowingContactName value is a known ShowingTime/CSS
 * placeholder rather than a real agent name.
 */
export function isGarbageAgentName(name: string | undefined): boolean {
  if (!name?.trim()) return true;
  return AGENT_NAME_GARBAGE.has(name.trim().toLowerCase());
}
