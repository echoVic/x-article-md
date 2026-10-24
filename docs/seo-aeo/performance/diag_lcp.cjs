/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const f = process.argv[2];
const j = JSON.parse(fs.readFileSync(f, 'utf8'));
const A = j.audits;
const g = k => A[k] ? A[k].numericValue : undefined;
console.log('FILE', f);
console.log('LCP ms:', Math.round(g('largest-contentful-paint')||0),
  '| FCP:', Math.round(g('first-contentful-paint')||0),
  '| TBT:', Math.round(g('total-blocking-time')||0));
console.log('render-blocking score:', A['render-blocking-resources']?.score,
  'wastedMs:', Math.round(g('render-blocking-resources')||0));
const rb = A['render-blocking-resources']?.details?.items || [];
for (const r of rb) console.log('   BLOCK:', (r.url||'').split('/').pop().split('?')[0], Math.round(r.wastedMs||0)+'ms', Math.round((r.totalBytes||0)/1024)+'KB');
console.log('font-display score:', A['font-display']?.score);
const fe = A['font-display']?.details?.items || [];
for (const x of fe) console.log('   FONT:', (x.url||'').split('/').pop(), 'displayMissing:', !!x.display);
console.log('LCP element:', JSON.stringify((A['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet||'').slice(0,120)));
const ev = A['largest-contentful-paint-element']?.details?.items?.[0]?.items || [];
for (const e of ev) console.log('   LCP phase:', e.phase, Math.round(e.timing||0)+'ms');
