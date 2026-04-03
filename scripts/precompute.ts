/**
 * Pre-computes all heatmap data from CSV sources.
 * Run: bun scripts/precompute.ts
 * Output: src/data/precomputed.json
 */
import { readFileSync, writeFileSync } from 'fs';

// ── Parse seismic CSV ──────────────────────────────────────────────
const seismicCsv = readFileSync('src/data/seismic_data.csv', 'utf-8');

const seismicRows = seismicCsv
  .trim()
  .split('\n')
  .slice(1)
  .filter((l) => l.trim())
  .map((line) => {
    const p = line.split(',');
    return {
      location: p[0].trim(),
      province: p[1].trim(),
      lat: parseFloat(p[2]),
      long: parseFloat(p[3]),
      sa02: parseFloat(p[4]),
      pga: parseFloat(p[10]),
    };
  });

// ── Parse pressure CSV (join coords from seismic) ─────────────────
const pressureCsv = readFileSync('src/data/pressure_data.csv', 'utf-8');
const coordsByName = new Map(
  seismicRows.map((r) => [r.location, { lat: r.lat, long: r.long }]),
);

const pressureRows = pressureCsv
  .trim()
  .split('\n')
  .slice(1)
  .filter((l) => l.trim())
  .map((line) => {
    const p = line.split(',');
    const location = p[0].trim();
    const coords = coordsByName.get(location);
    if (!coords) return null;
    return { location, lat: coords.lat, long: coords.long, p500: parseFloat(p[3]) };
  })
  .filter((r): r is NonNullable<typeof r> => r !== null);

// ── Vsp data (normalized by Sa02 since Ie×Wp cancels in normalization) ──
const sa02Values = seismicRows.map((r) => r.sa02);
const sa02Max = Math.max(...sa02Values);
const sa02Min = Math.min(...sa02Values);

const vspPoints = seismicRows.map((r) => ({
  lat: r.lat,
  long: r.long,
  intensity: (r.sa02 / sa02Max) * 100,
}));

// ── PGA data (non-linear normalization) ────────────────────────────
const PGA_BREAKS = [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 4.0];

function pgaToNormalized(pga: number): number {
  if (pga <= 0) return 0;
  if (pga >= PGA_BREAKS[PGA_BREAKS.length - 1]) return 1;
  for (let i = 0; i < PGA_BREAKS.length - 1; i++) {
    if (pga <= PGA_BREAKS[i + 1]) {
      const lo = PGA_BREAKS[i];
      const hi = PGA_BREAKS[i + 1];
      const t = (pga - lo) / (hi - lo);
      return (i + t) / (PGA_BREAKS.length - 1);
    }
  }
  return 1;
}

const pgaValues = seismicRows.map((r) => r.pga);
const pgaMax = Math.max(...pgaValues);
const pgaMin = Math.min(...pgaValues);

const pgaPoints = seismicRows.map((r) => ({
  lat: r.lat,
  long: r.long,
  intensity: pgaToNormalized(r.pga) * 100,
}));

// ── Pressure data (linear normalization) ───────────────────────────
const p500Values = pressureRows.map((r) => r.p500);
const p500Max = Math.max(...p500Values);
const p500Min = Math.min(...p500Values);

const pressurePoints = pressureRows.map((r) => ({
  lat: r.lat,
  long: r.long,
  intensity: (r.p500 / p500Max) * 100,
}));

// ── City info for markers page ─────────────────────────────────────
const cities = seismicRows.map((r) => ({
  location: r.location,
  province: r.province,
  lat: r.lat,
  long: r.long,
  sa02: r.sa02,
  pga: r.pga,
}));

// ── Write output ───────────────────────────────────────────────────
const output = {
  vsp: { points: vspPoints, sa02Min, sa02Max },
  pga: { points: pgaPoints, pgaMin, pgaMax },
  pressure: { points: pressurePoints, p500Min, p500Max },
  cities,
  locationCount: seismicRows.length,
  pressureLocationCount: pressureRows.length,
};

writeFileSync('src/data/precomputed.json', JSON.stringify(output));

console.log(
  `Done: ${seismicRows.length} seismic, ${pressureRows.length} pressure locations`,
);
console.log(`  Vsp Sa02 range: ${sa02Min.toFixed(4)} – ${sa02Max.toFixed(4)}`);
console.log(`  PGA range: ${pgaMin.toFixed(4)} – ${pgaMax.toFixed(4)} g`);
console.log(`  Pressure 1/500 range: ${p500Min.toFixed(2)} – ${p500Max.toFixed(2)} kPa`);
