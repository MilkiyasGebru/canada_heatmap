import BaseMap from '../components/BaseMap';
import HeatmapLayer from '../components/HeatmapLayer';
import SidePanel from '../components/SidePanel';
import precomputed from '../data/precomputed.json';
import type { HeatmapDataPoint } from '../types/heatmap';

// Gradient matching the provided NBC PGA legend image
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

const points = precomputed.pga.points as HeatmapDataPoint[];
const LEGEND_TICKS = [0, 0.05, 0.1, 0.2, 0.4, 0.8, 2.0, 4.0];

export default function PGAPage() {
  return (
    <div className="page-layout">
      <div className="map-section">
        <BaseMap>
          <HeatmapLayer
            points={points}
            gradient={GRADIENT}
            opacity={0.7}
            power={2.5}
            resolution={3}
            stepped
          />
        </BaseMap>
      </div>
      <SidePanel
        badge="NBC 2025"
        title="Peak Ground Acceleration"
        subtitle="PGA for Site Class XD"
        gradient={GRADIENT}
        minVal={precomputed.pga.pgaMin}
        maxVal={precomputed.pga.pgaMax}
        unit="g"
        scaleLabel="PGA Scale (non-linear)"
        description="Peak Ground Acceleration (PGA) represents the maximum horizontal acceleration at a site during an earthquake. Values shown are for Site Class XD per NBC 2025 seismic hazard data."
        locationCount={precomputed.locationCount}
      >
        <div className="panel-card formula-card">
          <h3>What is PGA?</h3>
          <div className="formula-text">
            Peak ground acceleration — the strongest shaking expected at a
            location, expressed as a fraction of gravity (g).
          </div>
        </div>

        <div className="panel-card">
          <h3>Scale Breakpoints</h3>
          <div className="pga-ticks">
            {LEGEND_TICKS.map((v) => (
              <span key={v} className="pga-tick">
                {v.toFixed(2)} g
              </span>
            ))}
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
