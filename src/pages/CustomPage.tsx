import { useState, useMemo, useCallback } from 'react';
import BaseMap from '../components/BaseMap';
import HeatmapLayer from '../components/HeatmapLayer';
import SidePanel from '../components/SidePanel';
import precomputed from '../data/precomputed.json';
import type { HeatmapDataPoint } from '../types/heatmap';

const GRADIENT: Record<number, string> = {
  [0 / 11]: '#ffffff',
  [1 / 11]: '#d0d0ff',
  [2 / 11]: '#9898ff',
  [3 / 11]: '#4040ff',
  [4 / 11]: '#00c8c8',
  [5 / 11]: '#00c800',
  [6 / 11]: '#ffff00',
  [7 / 11]: '#ffc800',
  [8 / 11]: '#ff6400',
  [9 / 11]: '#ff0000',
  [10 / 11]: '#880000',
  [11 / 11]: '#320000',
};

// Build lookup: city name → { lat, long }
const cityCoords = new Map(
  precomputed.cities.map((c) => [
    c.location.toLowerCase(),
    { lat: c.lat, long: c.long },
  ]),
);

interface ParsedData {
  points: HeatmapDataPoint[];
  minVal: number;
  maxVal: number;
  matched: number;
  unmatched: string[];
}

function parseCSV(text: string): ParsedData {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { points: [], minVal: 0, maxVal: 0, matched: 0, unmatched: [] };

  // Find column indices from header
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const locIdx = header.findIndex(
    (h) => h === 'location' || h === 'city' || h === 'name',
  );
  const valIdx = header.findIndex(
    (h) => h === 'value' || h === 'val' || h === 'intensity',
  );

  if (locIdx === -1 || valIdx === -1) {
    return { points: [], minVal: 0, maxVal: 0, matched: 0, unmatched: ['Header must contain "Location" and "value" columns'] };
  }

  const rows: { lat: number; long: number; value: number }[] = [];
  const unmatched: string[] = [];

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    const name = parts[locIdx]?.trim().toLowerCase();
    const value = parseFloat(parts[valIdx]);
    if (!name || isNaN(value)) continue;

    const coords = cityCoords.get(name);
    if (coords) {
      rows.push({ lat: coords.lat, long: coords.long, value });
    } else {
      unmatched.push(parts[locIdx]?.trim());
    }
  }

  if (rows.length === 0) {
    return { points: [], minVal: 0, maxVal: 0, matched: 0, unmatched };
  }

  const maxVal = Math.max(...rows.map((r) => r.value));
  const minVal = Math.min(...rows.map((r) => r.value));

  const points: HeatmapDataPoint[] = rows.map((r) => ({
    lat: r.lat,
    long: r.long,
    intensity: maxVal > 0 ? (r.value / maxVal) * 100 : 0,
  }));

  return { points, minVal, maxVal, matched: rows.length, unmatched };
}

export default function CustomPage() {
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const data = useMemo(() => {
    if (!csvText) return null;
    return parseCSV(csvText);
  }, [csvText]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string);
    };
    reader.readAsText(file);
  }, []);

  const hasData = data && data.points.length > 0;

  return (
    <div className="page-layout">
      <div className="map-section">
        <BaseMap>
          {hasData && (
            <HeatmapLayer
              points={data.points}
              gradient={GRADIENT}
              opacity={0.7}
              power={2.5}
              resolution={3}
              stepped
            />
          )}
        </BaseMap>
      </div>
      <SidePanel
        badge="Custom"
        title="Upload CSV"
        subtitle="Visualize your own data on the map"
        gradient={GRADIENT}
        minVal={data?.minVal ?? 0}
        maxVal={data?.maxVal ?? 0}
        unit=""
        scaleLabel={hasData ? 'Value Scale' : ''}
        description="Upload a CSV with columns: Location (city names matching NBC 2025 data) and value (numeric). The values will be normalized and displayed as a contour heatmap."
        locationCount={data?.matched ?? 0}
      >
        <div className="panel-card">
          <h3>Upload Data</h3>
          <label className="file-upload">
            <input type="file" accept=".csv" onChange={handleFile} />
            <span className="file-upload-btn">Choose CSV File</span>
            {fileName && <span className="file-upload-name">{fileName}</span>}
          </label>
        </div>

        {data && (
          <div className="panel-card">
            <h3>Status</h3>
            <div className="upload-status">
              <p>
                <strong>{data.matched}</strong> locations matched
              </p>
              {data.unmatched.length > 0 && (
                <p className="upload-warn">
                  {data.unmatched.length} unmatched:{' '}
                  {data.unmatched.slice(0, 5).join(', ')}
                  {data.unmatched.length > 5 && '...'}
                </p>
              )}
              {hasData && (
                <p>
                  Range: {data.minVal.toFixed(2)} – {data.maxVal.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="panel-card panel-info">
          <h3>CSV Format</h3>
          <pre className="csv-example">
            {`Location,value\n100 Mile House,0.55\nAbbotsford,0.68\nAgassiz,0.77`}
          </pre>
        </div>
      </SidePanel>
    </div>
  );
}
