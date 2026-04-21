/**
 * RETS Agent Search
 * -----------------
 * Fetches all JRNY01 office listings (RESI + LAND, all statuses) and prints
 * each listing's ShowingContactName so we can see exactly how agent names
 * are stored in GAMLS.
 *
 * Usage:  node scripts/rets-agent-search.mjs
 */

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(__dirname, "../.env.local");
const lines = fs.readFileSync(envPath, "utf-8").split("\n");
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq > 0) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
}

const BASE_URL   = process.env.RETS_LOGIN_URL.replace(/\/login$/, "");
const LOGIN_URL  = process.env.RETS_LOGIN_URL;
const USERNAME   = process.env.RETS_USERNAME;
const PASSWORD   = process.env.RETS_PASSWORD;
const USER_AGENT = process.env.RETS_USER_AGENT ?? "JourneyRealty/1.0";

// ── Digest auth ───────────────────────────────────────────────────────────────
const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");

function parseChallenge(h) {
  const get  = (k) => h.match(new RegExp(`${k}="([^"]+)"`))?.[1] ?? "";
  const getU = (k) => h.match(new RegExp(`${k}=([^,\\s"]+)`))?.[1];
  return { realm: get("realm"), nonce: get("nonce"), qop: getU("qop"), opaque: get("opaque") || undefined };
}

function buildAuth(method, uriPath, challenge) {
  const { realm, nonce, qop, opaque } = challenge;
  const ha1 = md5(`${USERNAME}:${realm}:${PASSWORD}`);
  const ha2 = md5(`${method.toUpperCase()}:${uriPath}`);
  const nc = "00000001";
  const cnonce = crypto.randomBytes(8).toString("hex");
  const response = qop
    ? md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    : md5(`${ha1}:${nonce}:${ha2}`);
  const parts = [
    `Digest username="${USERNAME}"`,
    `realm="${realm}"`, `nonce="${nonce}"`,
    `uri="${uriPath}"`, `response="${response}"`,
    ...(qop ? [`qop=${qop}`, `nc=${nc}`, `cnonce="${cnonce}"`] : []),
    ...(opaque ? [`opaque="${opaque}"`] : []),
  ];
  return parts.join(", ");
}

// ── Session ───────────────────────────────────────────────────────────────────
let _cookie = null;
let _searchUrl = null;

async function login() {
  const url = new URL(LOGIN_URL);
  // First request — get the digest challenge
  let res = await fetch(LOGIN_URL, {
    headers: { "User-Agent": USER_AGENT, "RETS-Version": "RETS/1.7.2" },
  });
  if (res.status === 401) {
    const challenge = parseChallenge(res.headers.get("www-authenticate") ?? "");
    const auth = buildAuth("GET", url.pathname + url.search, challenge);
    res = await fetch(LOGIN_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        "RETS-Version": "RETS/1.7.2",
        "Authorization": auth,
      },
    });
  }
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const body = await res.text();
  _cookie = res.headers.get("set-cookie")?.split(";")[0] ?? null;

  // Parse Search-URL from login response
  const searchMatch = body.match(/Search-URL=(.*)/i);
  _searchUrl = searchMatch
    ? new URL(searchMatch[1].trim(), BASE_URL).href
    : `${BASE_URL}/server/search`;

  console.log("✅  Logged in. Search URL:", _searchUrl);
}

async function search(propertyClass, query) {
  const qs = new URLSearchParams({
    SearchType:    "Property",
    Class:         propertyClass,
    QueryType:     "DMQL2",
    Format:        "COMPACT-DECODED",
    StandardNames: "0",
    Query:         query,
    Select:        "ListingId,MlsStatus,ListPrice,StreetNumber,StreetName,City,ShowingContactName",
    Count:         "1",
    Limit:         "100",
    Offset:        "1",
  });

  const url = new URL(_searchUrl);
  const res = await fetch(`${_searchUrl}?${qs}`, {
    headers: {
      "User-Agent": USER_AGENT,
      "RETS-Version": "RETS/1.7.2",
      "Cookie": _cookie ?? "",
      "Accept": "*/*",
    },
  });

  const text = await res.text();

  // Parse reply code
  const codeMatch = text.match(/ReplyCode="(\d+)"/);
  const code = codeMatch ? parseInt(codeMatch[1]) : -1;
  const msgMatch = text.match(/ReplyText="([^"]+)"/);
  const msg = msgMatch?.[1] ?? "";

  if (code !== 0) {
    console.warn(`  ⚠️  ${propertyClass} query returned ${code}: ${msg}`);
    return [];
  }

  // Parse COMPACT-DECODED
  const colMatch = text.match(/<COLUMNS>(.*?)<\/COLUMNS>/s);
  const cols = colMatch ? colMatch[1].trim().split("\t") : [];

  const rows = [];
  for (const m of text.matchAll(/<DATA>(.*?)<\/DATA>/gs)) {
    const vals = m[1].trim().split("\t");
    const row = {};
    cols.forEach((c, i) => { row[c] = vals[i] ?? ""; });
    rows.push(row);
  }

  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────
await login();

const OFFICE = "JRNY01";
const QUERY  = `(ListOffice=${OFFICE}),(MlsStatus=|A,U,B,S,X)`;

console.log("\n🔍  Fetching RESI listings…");
const resi = await search("RESI", QUERY);

console.log("🔍  Fetching LAND listings…");
const land = await search("LAND", QUERY);

const all = [...resi, ...land];
console.log(`\n📋  Total listings found: ${all.length} (${resi.length} RESI, ${land.length} LAND)\n`);

// Group by agent name
const byAgent = {};
for (const row of all) {
  const name = row["ShowingContactName"]?.trim() || "(blank)";
  if (!byAgent[name]) byAgent[name] = [];
  byAgent[name].push(row);
}

// Print grouped results
for (const [agentName, listings] of Object.entries(byAgent).sort()) {
  console.log(`\n👤  ${agentName} (${listings.length} listing${listings.length !== 1 ? "s" : ""})`);
  for (const l of listings) {
    const addr = `${l.StreetNumber} ${l.StreetName}, ${l.City}`.trim();
    const price = l.ListPrice ? `$${parseInt(l.ListPrice).toLocaleString()}` : "N/A";
    console.log(`    [${l.MlsStatus}] ${l.ListingId}  ${price}  ${addr}`);
  }
}

console.log("\n✅  Done.");
