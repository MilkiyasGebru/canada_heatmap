import BaseMap from '../components/BaseMap';
import HeatmapLayer from '../components/HeatmapLayer';
import SidePanel from '../components/SidePanel';
import precomputed from '../data/precomputed.json';
import type { HeatmapDataPoint } from '../types/heatmap';

// Same NBC-style gradient as PGA page
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

const points = precomputed.pressure.points as HeatmapDataPoint[];

export default function PressurePage() {
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
        title="Wind Pressure (1/500)"
        subtitle="Hourly wind pressure, 1-in-500-year return"
        gradient={GRADIENT}
        minVal={precomputed.pressure.p500Min}
        maxVal={precomputed.pressure.p500Max}
        unit="kPa"
        scaleLabel="Pressure Scale"
        description="Hourly wind pressure for a 1-in-500-year return period per NBC 2025 climatic data. Used for structural design of cladding and components exposed to wind loads."
        locationCount={precomputed.pressureLocationCount}
      >
        <div className="panel-card formula-card">
          <h3>Return Period</h3>
          <div className="formula-text">
            1/500 &mdash; the wind pressure expected to be exceeded on average
            once every 500 years (0.2% annual probability).
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
