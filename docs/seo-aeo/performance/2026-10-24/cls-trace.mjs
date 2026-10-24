#!/usr/bin/env node
// Early-injected PerformanceObserver layout-shift trace for editor CLS.
//
// Usage:
//   node docs/seo-aeo/performance/2026-10-24/cls-trace.mjs <url> <out.json> [runs]
//
// Connects to headless Chrome on :9222, opens a new tab at 390x844 mobile,
// injects a PerformanceObserver via Page.addScriptToEvaluateOnNewDocument
// BEFORE navigation, and dumps every layout-shift entry with source-node
// info, previous/current rects, and timestamp. Run `runs` times (default 3)
// and append a `runs` array to the output JSON.
//
// Preconditions:
//   - Headless Chrome already running:
//     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//       --headless=new --remote-debugging-port=9222 --disable-gpu \
//       --window-size=390,844 --user-data-dir=/tmp/chrome-cls about:blank
//   - next start serving the build under test.
//
// The script does not clear localStorage / service workers between runs;
// cold-start measurement requires a fresh --user-data-dir per run. See
// cls-cold.sh for the wrapper that does that.

import { writeFileSync } from "node:fs";

const CDP_HTTP = "http://localhost:9222";
const url = process.argv[2];
const outFile = process.argv[3];
const runs = parseInt(process.argv[4] || "3", 10);

if (!url || !outFile) {
  console.error("usage: cls-trace.mjs <url> <out.json> [runs]");
  process.exit(2);
}

async function openTab() {
  const res = await fetch(`${CDP_HTTP}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

async function traceOnce(runIdx) {
  const tab = await openTab();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
  const shifts = [];

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    } else if (msg.method === "Runtime.bindingCalled" && msg.params.name === "onShift") {
      shifts.push(JSON.parse(msg.params.payload));
    }
  };
  await new Promise((r) => (ws.onopen = r));

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });
  await send("Network.clearBrowserCache");
  await send("Runtime.addBinding", { name: "onShift" });

  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      (function () {
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput && entry.value > 0) {
              const src = entry.sources && entry.sources[0];
              onShift(JSON.stringify({
                value: entry.value,
                startTime: Math.round(entry.startTime * 10) / 10,
                node: src ? (src.node && (src.node.nodeName + "." + String(src.node.className).slice(0,80))) : "unknown",
                prevRect: src && src.previousRect,
                curRect: src && src.currentRect,
              }));
            }
          }
        });
        po.observe({ type: "layout-shift", buffered: true });
      })();
    `,
  });

  const navStart = Date.now();
  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 6000));
  ws.close();

  // Close the tab
  await fetch(`${CDP_HTTP}/json/close/${tab.id}`).catch(() => {});
  return { run: runIdx, wallMs: Date.now() - navStart, shifts, totalCls: shifts.reduce((s, e) => s + e.value, 0) };
}

const allRuns = [];
for (let i = 0; i < runs; i++) {
  allRuns.push(await traceOnce(i + 1));
}

const summary = {
  url,
  viewport: "390x844 dsf=2 mobile",
  runs,
  generatedAt: new Date().toISOString(),
  results: allRuns,
};
writeFileSync(outFile, JSON.stringify(summary, null, 2));
console.log(`wrote ${outFile}`);
for (const r of allRuns) console.log(`  run ${r.run}: CLS=${r.totalCls.toFixed(5)} entries=${r.shifts.length}`);
