/**
 * Pre-computes all heatmap data from CSV sources.
 * Run: bun scripts/precompute.ts
 * Output: src/data/precomputed.json
 */
import { readFileSync, writeFileSync } from 'fs';

// ── Generic breakpoint normalizer ──────────────────────────────────
function breakpointNormalize(value: number, breaks: number[]): number {
  if (value <= breaks[0]) return 0;
  if (value >= breaks[breaks.length - 1]) return 1;
  for (let i = 0; i < breaks.length - 1; i++) {
    if (value <= breaks[i + 1]) {
      const lo = breaks[i];
      const hi = breaks[i + 1];
      const t = (value - lo) / (hi - lo);
      return (i + t) / (breaks.length - 1);
    }
  }
  return 1;
}

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

// ── Vsp / Sa(0.2) data — non-linear breakpoints ───────────────────
// Breakpoints chosen to spread the data across the full color range
// based on data distribution (most values 0.10–0.65, tail to 2.55)
const SA02_BREAKS = [0, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.55, 0.75, 1.00, 1.50, 3.00];

const sa02Values = seismicRows.map((r) => r.sa02);
const sa02Max = Math.max(...sa02Values);
const sa02Min = Math.min(...sa02Values);

const vspPoints = seismicRows.map((r) => ({
  lat: r.lat,
  long: r.long,
  intensity: breakpointNormalize(r.sa02, SA02_BREAKS) * 100,
}));

// ── PGA data — non-linear breakpoints ──────────────────────────────
const PGA_BREAKS = [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 4.0];

const pgaValues = seismicRows.map((r) => r.pga);
const pgaMax = Math.max(...pgaValues);
const pgaMin = Math.min(...pgaValues);

const pgaPoints = seismicRows.map((r) => ({
  lat: r.lat,
  long: r.long,
  intensity: breakpointNormalize(r.pga, PGA_BREAKS) * 100,
}));

// ── Pressure data — non-linear breakpoints ─────────────────────────
// Based on distribution (most values 0.45–0.76, tail to 1.74)
const P500_BREAKS = [0, 0.45, 0.52, 0.58, 0.64, 0.70, 0.76, 0.84, 0.95, 1.10, 1.40, 1.80];

const p500Values = pressureRows.map((r) => r.p500);
const p500Max = Math.max(...p500Values);
const p500Min = Math.min(...p500Values);

const pressurePoints = pressureRows.map((r) => ({
  lat: r.lat,
  long: r.long,
  intensity: breakpointNormalize(r.p500, P500_BREAKS) * 100,
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
console.log(`  Sa02 range: ${sa02Min.toFixed(4)} – ${sa02Max.toFixed(4)}`);
console.log(`  PGA range: ${pgaMin.toFixed(4)} – ${pgaMax.toFixed(4)} g`);
console.log(`  Pressure 1/500 range: ${p500Min.toFixed(2)} – ${p500Max.toFixed(2)} kPa`);

// Verify distribution of normalized values
for (const [name, pts] of [['Vsp', vspPoints], ['PGA', pgaPoints], ['Pressure', pressurePoints]] as const) {
  const intensities = pts.map((p: {intensity: number}) => p.intensity);
  const bands = new Array(12).fill(0);
  for (const v of intensities) {
    const b = Math.min(Math.floor(v / 100 * 12), 11);
    bands[b]++;
  }
  console.log(`  ${name} band distribution: ${bands.join(', ')}`);
}
