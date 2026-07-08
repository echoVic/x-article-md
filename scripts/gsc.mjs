#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  buildDateRange,
  formatRowsForConsole,
  parseDimensions,
  toGscRequest,
} from "./gsc-utils.mjs";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_CREDENTIALS = "credentials.json";
const DEFAULT_TOKEN = ".gsc-token.json";
const DEFAULT_SITE = process.env.GSC_SITE_URL || "https://markdown2x.com/";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "help";

try {
  if (command === "sites") {
    const auth = await getAccessToken(args);
    const data = await apiFetch("https://www.googleapis.com/webmasters/v3/sites", auth.accessToken);
    printSites(data.siteEntry || []);
  } else if (command === "query") {
    const auth = await getAccessToken(args);
    const siteUrl = args.site || DEFAULT_SITE;
    const range =
      args.start && args.end
        ? { startDate: args.start, endDate: args.end }
        : buildDateRange(args.days ? Number(args.days) : 28);
    const body = toGscRequest({
      ...range,
      dimensions: parseDimensions(args.dimensions),
      rowLimit: args.limit ? Number(args.limit) : 100,
      searchType: args["search-type"] || "web",
    });
    const data = await apiFetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      auth.accessToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    console.log(`site=${siteUrl}`);
    console.log(`range=${body.startDate}..${body.endDate}`);
    console.log(`dimensions=${body.dimensions.join(",")}`);
    console.log("");
    console.log(formatRowsForConsole(data.rows || []));
  } else {
    printHelp();
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

async function getAccessToken(args) {
  const credentialsPath = args.credentials || DEFAULT_CREDENTIALS;
  const tokenPath = args.token || DEFAULT_TOKEN;
  const credentials = await readJson(credentialsPath);
  const oauth = credentials.installed || credentials.web;
  if (!oauth) {
    throw new Error(`${credentialsPath} must contain an installed or web OAuth client`);
  }

  const token = await readJsonIfExists(tokenPath);
  if (token?.access_token && token.expiry_date && token.expiry_date > Date.now() + 60_000) {
    return { accessToken: token.access_token };
  }

  if (token?.refresh_token) {
    const refreshed = await postToken(oauth.token_uri, {
      client_id: oauth.client_id,
      client_secret: oauth.client_secret,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    });
    const merged = {
      ...token,
      ...refreshed,
      expiry_date: Date.now() + refreshed.expires_in * 1000,
    };
    await writeJson(tokenPath, merged);
    return { accessToken: merged.access_token };
  }

  const redirectUri = oauth.redirect_uris?.[0] || "http://localhost";
  const url = new URL(oauth.auth_uri);
  url.searchParams.set("client_id", oauth.client_id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  console.log("Open this URL, approve read-only Search Console access, then paste the code here:");
  console.log(url.toString());

  const rl = createInterface({ input, output });
  const code = (await rl.question("OAuth code: ")).trim();
  rl.close();

  const exchanged = await postToken(oauth.token_uri, {
    client_id: oauth.client_id,
    client_secret: oauth.client_secret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const saved = {
    ...exchanged,
    expiry_date: Date.now() + exchanged.expires_in * 1000,
  };
  await writeJson(tokenPath, saved);
  return { accessToken: saved.access_token };
}

async function apiFetch(url, accessToken, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      authorization: `Bearer ${accessToken}`,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error?.message || `${response.status} ${response.statusText}`);
  }
  return data;
}

async function postToken(tokenUri, values) {
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(values),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "OAuth token request failed");
  }
  return data;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readJsonIfExists(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function printSites(sites) {
  if (!sites.length) {
    console.log("No Search Console properties returned for this account.");
    return;
  }

  for (const site of sites) {
    console.log(`${site.siteUrl}\t${site.permissionLevel}`);
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/gsc.mjs sites
  node scripts/gsc.mjs query --site https://markdown2x.com/ --days 28 --dimensions page,query --limit 100

Options:
  --credentials <path>   OAuth client file, default credentials.json
  --token <path>         Local token cache, default .gsc-token.json
  --site <siteUrl>       GSC property URL, default ${DEFAULT_SITE}
  --days <n>             Complete days ending yesterday, default 28
  --start YYYY-MM-DD     Explicit start date
  --end YYYY-MM-DD       Explicit end date
  --dimensions <list>    Comma-separated dimensions, default date
  --search-type <type>   web, image, video, news, googleNews, discover
  --limit <n>            Row limit, default 100`);
}
