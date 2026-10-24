/* eslint-disable @typescript-eslint/no-require-imports */
// Nav interaction: cold load home -> click "Open Editor" -> measure time to editor interactive.
// Usage: node nav_test.cjs <baseUrl> <label>
const puppeteer = require(process.env.PPTR_PATH);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

(async () => {
  const base = process.argv[2] || "http://127.0.0.1:3233/";
  const label = process.argv[3] || "combo";
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const results = [];
  for (let i = 0; i < 3; i++) {
    // fresh incognito-like context = cold storage/SW
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto(base, { waitUntil: "networkidle0", timeout: 30000 });
    const homeLoaded = Date.now() - t0;
    // find Open Editor button
    const btn = await page.evaluateHandle(() => {
      const a = [...document.querySelectorAll("a")].find(x => /open editor|editor|开始编辑/i.test(x.textContent||""));
      return a || null;
    });
    const t1 = Date.now();
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }).catch(()=>{}),
      btn.click(),
    ]);
    const navMs = Date.now() - t1;
    // editor interactive: the markdown textarea renders
    let ok = false, editorMs = 0;
    try {
      const t2 = Date.now();
      await page.waitForSelector("textarea, .cm-editor, [contenteditable='true']", { timeout: 15000 });
      editorMs = Date.now() - t2;
      ok = true;
    } catch { ok = false; }
    results.push({ i, homeLoaded, navMs, editorMs, ok });
    await ctx.close();
  }
  console.log(JSON.stringify({ label, base, results }, null, 1));
  await browser.close();
})();
