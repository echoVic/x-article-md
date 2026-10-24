#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Throttled nav comparison: Slow4G + CPU 4x, cold & warm.
// Real click -> URL /editor -> editor interactive -> type -> preview updates.
// FAILS (non-zero exit) on any timeout. Records SW/controller/storage state.
//
// Setup (no hardcoded package path):
//   npm i -g puppeteer-core      # provides the module
//   export PPTR_PATH="$(npm root -g)/puppeteer-core"
//   export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
// Usage: node nav_throttle.cjs <baseUrl> <label>
const puppeteer = require(process.env.PPTR_PATH);
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = process.argv[2], label = process.argv[3];
if (!base) { console.error("need baseUrl"); process.exit(2); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new",
    args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] });
  const out = [];
  for (const warm of [false, true]) {
    for (let i = 0; i < 3; i++) {
      const ctx = await browser.createBrowserContext();
      const page = await ctx.newPage();
      const client = await page.target().createCDPSession();
      await client.send("Network.enable");
      await client.send("Network.emulateNetworkConditions",
        { offline:false, latency:150, downloadThroughput:1638*1024/8, uploadThroughput:675*1024/8 });
      await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      let gaCollect = false;
      page.on("request", r => { if(/\/collect\?|\/g\/collect/.test(r.url())) gaCollect = true; });

      const t0 = Date.now();
      await page.goto(base, { waitUntil:"networkidle0", timeout:60000 });
      const homeMs = Date.now() - t0;

      // record SW/controller/storage state on home
      const homeState = await page.evaluate(async () => ({
        sw: !!navigator.serviceWorker.controller,
        regs: (await navigator.serviceWorker.getRegistrations()).length,
        ls: Object.keys(localStorage).length,
      }));

      // click Open Editor; measure click -> URL /editor -> editor interactive
      const t1 = Date.now();
      const btn = await page.evaluateHandle(() =>
        [...document.querySelectorAll("a")].find(x => /open editor|editor|开始编辑/i.test(x.textContent||"")));
      await btn.click();
      await page.waitForFunction(u => location.href.startsWith(u), { timeout:30000 }, new URL("/editor", base).origin + "/editor");
      const navMs = Date.now() - t1;

      // editor interactive: CodeMirror/textarea present
      await page.waitForSelector("textarea, .cm-editor, [contenteditable='true']", { timeout:30000 });
      const editReadyMs = Date.now() - t1;

      // type and confirm preview updates
      await page.waitForSelector(".cm-content, textarea", { timeout:15000 });
      await page.click(".cm-content, textarea");
      const marker = "perftest" + Date.now();
      await page.keyboard.type(marker, { delay: 30 });
      await page.waitForFunction((m) => document.body.innerText.includes(m), { timeout:10000 }, marker);
      const typedAndVisible = true;

      out.push({ warm, i, homeMs, navMs, editReadyMs, typedAndVisible, gaCollect, homeState });
      await ctx.close();
    }
  }
  console.log(JSON.stringify({ label, base, out }, null, 1));
  await browser.close();
})().catch(e => { console.error("NAV_FAIL", e.message); process.exit(1); });
