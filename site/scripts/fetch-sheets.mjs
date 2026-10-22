// Rewrites src/data/running.json from the public running sheet.
//
// Set RUNNING_SHEET_CSV_URL to the sheet published as CSV
// (Google Sheets: File > Share > Publish to web > the running tab > CSV).
// Expected columns (header names, any case): `date` (YYYY-MM-DD) and `miles`.
// Optional columns: `pace` (m:ss per mile) and `five_mile` (m:ss) for the 5-mile PR.
// Without the variable this script does nothing, so `npm run build` always works.
import { readFileSync, writeFileSync } from 'node:fs';

const url = process.env.RUNNING_SHEET_CSV_URL;
if (!url) {
  console.log('fetch-sheets: RUNNING_SHEET_CSV_URL not set, keeping src/data/running.json as is');
  process.exit(0);
}

const file = new URL('../src/data/running.json', import.meta.url);
const prev = JSON.parse(readFileSync(file, 'utf8'));

const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
};
const secs = (t) => { const [m, s] = String(t).split(':').map(Number); return Number.isFinite(m) ? m * 60 + (s || 0) : NaN; };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const res = await fetch(url);
if (!res.ok) { console.error(`fetch-sheets: ${res.status} for the running sheet, keeping the old numbers`); process.exit(0); }
const [head, ...rows] = parseCsv(await res.text());
const col = (name) => head.findIndex((h) => h.trim().toLowerCase() === name);
const iDate = col('date'), iMiles = col('miles'), iPace = col('pace'), iFive = col('five_mile');
if (iDate < 0 || iMiles < 0) { console.error('fetch-sheets: the sheet needs `date` and `miles` columns, keeping the old numbers'); process.exit(0); }

const months = new Map();
let total = 0, runs = 0, longest = 0;
const paces = [];
let best5 = Infinity;
for (const r of rows) {
  const miles = Number(r[iMiles]);
  const d = String(r[iDate] || '').trim();
  if (!(miles > 0) || !/^\d{4}-\d{2}/.test(d)) continue;
  months.set(d.slice(0, 7), (months.get(d.slice(0, 7)) || 0) + miles);
  total += miles; runs++; longest = Math.max(longest, miles);
  if (iPace >= 0 && Number.isFinite(secs(r[iPace]))) paces.push(secs(r[iPace]));
  if (iFive >= 0 && Number.isFinite(secs(r[iFive]))) best5 = Math.min(best5, secs(r[iFive]));
}
if (!runs) { console.error('fetch-sheets: no usable rows, keeping the old numbers'); process.exit(0); }

// fill empty months so the chart has no holes
const keys = [...months.keys()].sort();
const out = [];
for (let [y, m] = keys[0].split('-').map(Number); `${y}-${String(m).padStart(2, '0')}` <= keys.at(-1); m === 12 ? (y++, (m = 1)) : m++) {
  const k = `${y}-${String(m).padStart(2, '0')}`;
  out.push([k, Math.round((months.get(k) || 0) * 10) / 10]);
}
const next = {
  totalMiles: Math.round(total * 10) / 10,
  runs,
  longest: Math.round(longest * 100) / 100,
  avgPace: paces.length ? fmt(paces.reduce((a, b) => a + b, 0) / paces.length) : prev.avgPace,
  fiveMilePR: Number.isFinite(best5) ? fmt(best5) : prev.fiveMilePR,
  months: out,
  updated: new Date().toISOString().slice(0, 10),
};
writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
console.log(`fetch-sheets: ${runs} runs, ${next.totalMiles} miles, ${out.length} months`);
