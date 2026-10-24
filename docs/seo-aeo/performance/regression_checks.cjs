#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Discriminating regression checks — actually drives a headless browser and
// asserts the real GA network request fires, not just that config text exists.
//   npm i -g puppeteer-core; export PPTR_PATH="$(npm root -g)/puppeteer-core"
//   export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
// Usage: node regression_checks.cjs <baseUrl>
const puppeteer = require(process.env.PPTR_PATH);
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = process.argv[2];
if (!base) { console.error("need baseUrl"); process.exit(2); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new",
    args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] });
  const page = await (await browser.createBrowserContext()).newPage();
  let collect = false, gtagScript = false;
  page.on("request", r => {
    if (/\/collect\?|\/g\/collect/.test(r.url())) collect = true;
    if (/gtag\/js\?id=/.test(r.url())) gtagScript = true;
  });
  await page.goto(base, { waitUntil: "networkidle0", timeout: 60000 });
  const html = await page.content();
  if (!gtagScript) { console.error("FAIL: gtag/js not actually requested"); process.exit(1); }
  if (!collect) { console.error("FAIL: GA /collect (page_view) network request did not fire"); process.exit(1); }
  // prefetch: editor route chunks not preloaded in initial HTML
  const preloaded = (html.match(/href="\/_next\/static\/chunks\/[^"]+"/g) || []);
  if (preloaded.length > 3) { console.error("FAIL: too many chunks preloaded:", preloaded.length); process.exit(1); }
  // editor reachable
  const ed = await (await fetch(base.replace(/\/$/,"")+"/editor")).status;
  if (ed !== 200) { console.error("FAIL: /editor", ed); process.exit(1); }
  console.log("PASS", base, "| gtag requested | /collect fired | preloaded chunks="+preloaded.length+" | /editor="+ed);
  await browser.close();
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
