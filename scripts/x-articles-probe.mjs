#!/usr/bin/env node
/**
 * X Articles API probe — answers "does a draft created through the official
 * API render code blocks and tables natively?" before we build anything.
 *
 * It ONLY creates a draft (POST /2/articles/draft). It never publishes.
 * Open the printed URL in X, inspect the draft, then delete it by hand.
 *
 * Usage:
 *   X_USER_TOKEN=<OAuth 2.0 user access token> node scripts/x-articles-probe.mjs
 *   X_USER_TOKEN=... node scripts/x-articles-probe.mjs --dry-run   # print payload only
 *
 * The token needs the tweet.read, tweet.write and users.read scopes.
 * Docs: https://docs.x.com/x-api/articles/create-draft-article
 *
 * Each run is one paid write request on the pay-per-use X API; check the
 * per-endpoint price in the Developer Console first.
 */

const ENDPOINT = "https://api.x.com/2/articles/draft";

const CODE_SAMPLE = [
  "```ts",
  "export function slugify(input: string): string {",
  "  return input",
  "    .toLowerCase()",
  "    .replace(/[^a-z0-9]+/g, \"-\")",
  "    .replace(/^-|-$/g, \"\");",
  "}",
  "```",
].join("\n");

const TABLE_SAMPLE = [
  "| Feature | Clipboard paste | Articles API |",
  "| --- | --- | --- |",
  "| Code block | image | ? |",
  "| Table | image | ? |",
].join("\n");

/**
 * Builds a Draft.js content_state. Rich formatting goes through `atomic`
 * blocks whose entity_ranges point at an entity with `data.markdown`, as
 * described in the endpoint reference.
 */
export function buildProbePayload(now = new Date()) {
  const blocks = [];
  const entities = [];

  const text = (value, type = "unstyled") => {
    blocks.push({ key: `b${blocks.length}`, text: value, type, entity_ranges: [], inline_style_ranges: [] });
  };
  const markdownAtom = (markdown) => {
    const key = String(entities.length);
    entities.push({ key, value: { type: "MARKDOWN", mutability: "IMMUTABLE", data: { markdown } } });
    blocks.push({
      key: `b${blocks.length}`,
      text: " ",
      type: "atomic",
      entity_ranges: [{ key: Number(key), offset: 0, length: 1 }],
      inline_style_ranges: [],
    });
  };

  text("MD2X API probe — safe to delete. Checks whether code blocks and tables render natively.");
  text("1. Fenced code block via MARKDOWN entity", "header-two");
  markdownAtom(CODE_SAMPLE);
  text("2. Markdown table via MARKDOWN entity", "header-two");
  markdownAtom(TABLE_SAMPLE);
  text("Questions: Is the code highlighted? Monospace? Does the table render as a table?");

  return {
    title: `MD2X probe ${now.toISOString().slice(0, 16).replace("T", " ")}`,
    content_state: { blocks, entities },
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const payload = buildProbePayload();

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const token = process.env.X_USER_TOKEN?.trim();
  if (!token) {
    console.error("X_USER_TOKEN is not set. Use --dry-run to inspect the payload without calling X.");
    process.exitCode = 1;
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    data = { raw: body };
  }

  console.log(`HTTP ${response.status}`);
  console.log(JSON.stringify(data, null, 2));

  if (!response.ok || !data?.data?.id) {
    console.error(
      "\nDraft was not created. If the error mentions the entity or block schema, " +
        "adjust buildProbePayload() against the endpoint reference and retry.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\nDraft created (not published): id=${data.data.id}`);
  console.log("Open https://x.com/compose/articles, find the draft, check the two blocks, then delete it.");
}

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
