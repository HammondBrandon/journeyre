/**
 * RETS Discovery Script
 * ─────────────────────
 * Run this locally to inspect the GAMLS RETS server and dump all available
 * resources, classes, and field definitions to scripts/rets-metadata.json
 *
 * Usage:
 *   node scripts/rets-discovery.mjs
 *
 * Reads credentials from .env.local — make sure RETS_LOGIN_URL, RETS_USERNAME,
 * and RETS_PASSWORD are set before running.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ─────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found. Copy .env.local.example and fill in your credentials.");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

// ── Digest auth ──────────────────────────────────────────────────────────────
function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function parseDigestChallenge(header) {
  const get = (key) => header.match(new RegExp(`${key}="([^"]+)"`))?.[1] ?? "";
  const getUnquoted = (key) => header.match(new RegExp(`${key}=([^,\\s"]+)`))?.[1];
  return {
    realm: get("realm"),
    nonce: get("nonce"),
    qop: getUnquoted("qop"),
    opaque: get("opaque") || undefined,
  };
}

function buildDigestHeader(username, password, method, uriPath, challenge) {
  const { realm, nonce, qop, opaque } = challenge;
  const ha1 = md5(`${username}:${realm}:${password}`);
  const ha2 = md5(`${method.toUpperCase()}:${uriPath}`);
  let response, header;

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

// ── COMPACT parser ───────────────────────────────────────────────────────────
function parseCompact(xml) {
  const delimMatch = xml.match(/<DELIMITER value="(\d+)"\/>/);
  const delim = delimMatch ? String.fromCharCode(parseInt(delimMatch[1])) : "\t";

  const colMatch = xml.match(/<COLUMNS>(.*?)<\/COLUMNS>/s);
  if (!colMatch) return [];
  const columns = colMatch[1].split(delim).filter((s) => s.trim() !== "");

  const dataMatches = [...xml.matchAll(/<DATA>(.*?)<\/DATA>/gs)];
  return dataMatches.map((m) => {
    const parts = m[1].split(delim);
    const values = parts[0] === "" ? parts.slice(1) : parts;
    const rec = {};
    columns.forEach((col, i) => { rec[col] = (values[i] ?? "").trim(); });
    return rec;
  });
}

// ── RETS request ─────────────────────────────────────────────────────────────
async function retsRequest(url, cookie, userAgent = "RETSDiscovery/1.0") {
  const headers = {
    "User-Agent": userAgent,
    "RETS-Version": "RETS/1.7.2",
    Accept: "*/*",
    ...(cookie ? { Cookie: cookie } : {}),
  };
  const res = await fetch(url, { headers });
  return { res, text: await res.text() };
}

// ── Login ────────────────────────────────────────────────────────────────────
async function login(loginUrl, username, password, userAgent) {
  const loginPath = new URL(loginUrl).pathname;
  const baseUrl = new URL(loginUrl).origin;

  console.log(`\n🔐 Connecting to ${loginUrl} …`);

  // Step 1 — probe
  const { res: probe } = await retsRequest(loginUrl, null, userAgent);

  let authHeader;
  if (probe.status === 401) {
    const wwwAuth = probe.headers.get("WWW-Authenticate") ?? "";
    if (wwwAuth.toLowerCase().startsWith("digest")) {
      authHeader = buildDigestHeader(username, password, "GET", loginPath, parseDigestChallenge(wwwAuth));
    } else {
      authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    }
  } else if (probe.ok) {
    const text = await probe.text();
    const cookie = probe.headers.get("set-cookie")?.split(";")[0] ?? "";
    return { text, cookie, baseUrl };
  } else {
    throw new Error(`Unexpected status ${probe.status}`);
  }

  // Step 2 — authenticate
  const authed = await fetch(loginUrl, {
    headers: {
      "User-Agent": userAgent,
      "RETS-Version": "RETS/1.7.2",
      Accept: "*/*",
      Authorization: authHeader,
    },
  });

  if (!authed.ok) throw new Error(`Login failed: ${authed.status} ${authed.statusText}`);
  const text = await authed.text();
  const cookie = authed.headers.get("set-cookie")?.split(";")[0] ?? "";
  console.log("✅ Logged in successfully");
  return { text, cookie, baseUrl };
}

function parseLoginResponse(xml) {
  const result = {};
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

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  loadEnv();

  const loginUrl = process.env.RETS_LOGIN_URL;
  const username = process.env.RETS_USERNAME;
  const password = process.env.RETS_PASSWORD;
  const userAgent = process.env.RETS_USER_AGENT ?? "RETSDiscovery/1.0";

  if (!loginUrl || !username || !password) {
    console.error("❌  Set RETS_LOGIN_URL, RETS_USERNAME, RETS_PASSWORD in .env.local");
    process.exit(1);
  }

  const { text: loginXml, cookie, baseUrl } = await login(loginUrl, username, password, userAgent);
  const loginData = parseLoginResponse(loginXml);

  const resolve = (key, fallback) => {
    const val = loginData[key] ?? fallback;
    return val.startsWith("http") ? val : `${baseUrl}${val}`;
  };

  const metadataUrl = resolve("GetMetadata", "/rets/server/getmetadata");
  const logoutUrl   = resolve("Logout", "/rets/server/logout");

  console.log("\n📋 Login response keys:", Object.keys(loginData).join(", "));

  const output = { loginData, resources: {}, classes: {}, fields: {}, objects: {} };

  // 1. Resources
  console.log("\n🔍 Fetching METADATA-RESOURCE …");
  const { text: resXml } = await retsRequest(`${metadataUrl}?Type=METADATA-RESOURCE&Format=COMPACT&ID=0`, cookie, userAgent);
  output.resources = parseCompact(resXml);
  console.log(`   Found ${output.resources.length} resource(s):`, output.resources.map(r => r.ResourceID || r.StandardName).join(", "));

  // 2. Classes for Property
  console.log("\n🔍 Fetching METADATA-CLASS for Property …");
  const { text: classXml } = await retsRequest(`${metadataUrl}?Type=METADATA-CLASS&Format=COMPACT&ID=Property`, cookie, userAgent);
  output.classes = parseCompact(classXml);
  console.log(`   Found ${output.classes.length} class(es):`, output.classes.map(c => c.ClassName || c.SystemName).join(", "));

  // 3. Fields for each class
  const classNames = output.classes.map(c => c.ClassName || c.SystemName).filter(Boolean);
  for (const cls of classNames) {
    console.log(`\n🔍 Fetching METADATA-TABLE for Property:${cls} …`);
    const { text: tableXml } = await retsRequest(
      `${metadataUrl}?Type=METADATA-TABLE&Format=COMPACT&ID=Property:${cls}`,
      cookie, userAgent
    );
    const fields = parseCompact(tableXml);
    output.fields[cls] = fields;
    const searchable = fields.filter(f => f.Searchable === "1" || f.Searchable?.toLowerCase() === "true");
    console.log(`   ${fields.length} total fields, ${searchable.length} searchable`);
    const withStdName = fields.filter(f => f.StandardName?.trim());
    console.log(`   ${withStdName.length} fields have RESO standard names`);
  }

  // 4. Objects
  console.log("\n🔍 Fetching METADATA-OBJECT for Property …");
  const { text: objXml } = await retsRequest(`${metadataUrl}?Type=METADATA-OBJECT&Format=COMPACT&ID=Property`, cookie, userAgent);
  output.objects = parseCompact(objXml);
  console.log(`   Object types:`, output.objects.map(o => o.ObjectType).join(", "));

  // 5. Logout
  await retsRequest(logoutUrl, cookie, userAgent);
  console.log("\n🚪 Logged out");

  // Write output
  const outPath = path.join(__dirname, "rets-metadata.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Metadata written to scripts/rets-metadata.json`);

  // Summary of key RESI fields
  if (output.fields.RESI) {
    console.log("\n📊 Key RESI fields (SystemName → StandardName):");
    const key = ["ListingId", "ListPrice", "StandardStatus", "BedroomsTotal",
      "BathroomsTotalInteger", "LivingArea", "City", "PostalCode",
      "PublicRemarks", "PhotosCount", "ModificationTimestamp"];
    const byStd = Object.fromEntries(
      output.fields.RESI.map(f => [f.StandardName?.trim(), f.SystemName])
    );
    for (const std of key) {
      const sys = byStd[std];
      console.log(`   ${std.padEnd(30)} →  ${sys ?? "(not found)"}`);
    }
  }
}

main().catch(err => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
