import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from '../components/HeatmapLayer';
import SidePanel from '../components/SidePanel';
import { seismicLocations } from '../data/seismicPoints';
import type { HeatmapDataPoint } from '../types/heatmap';
import 'leaflet/dist/leaflet.css';

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];
const GRADIENT: Record<number, string> = {
  0.0: '#f1eef6',
  0.2: '#bdc9e1',
  0.4: '#74a9cf',
  0.6: '#2b8cbe',
  0.8: '#045a8d',
  1.0: '#023858',
};

function computeData() {
  const maxPga = Math.max(...seismicLocations.map((l) => l.pga));
  const minPga = Math.min(...seismicLocations.map((l) => l.pga));
  const points: HeatmapDataPoint[] = seismicLocations.map((loc) => ({
    lat: loc.lat,
    long: loc.long,
    intensity: maxPga > 0 ? (loc.pga / maxPga) * 100 : 0,
  }));
  return { points, maxPga, minPga };
}

export default function PGAPage() {
  const { points, maxPga, minPga } = useMemo(computeData, []);

  return (
    <div className="page-layout">
      <div className="map-section">
        <MapContainer
          center={CANADA_CENTER}
          zoom={4}
          minZoom={3}
          maxZoom={13}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatmapLayer
            points={points}
            gradient={GRADIENT}
            opacity={0.6}
            power={2.5}
            resolution={4}
          />
        </MapContainer>
      </div>
      <SidePanel
        badge="NBC 2025"
        title="Peak Ground Acceleration"
        subtitle="PGA for Site Class XD"
        gradient={GRADIENT}
        minVal={minPga}
        maxVal={maxPga}
        unit="g"
        scaleLabel="PGA Scale"
        description="Peak Ground Acceleration (PGA) represents the maximum horizontal acceleration at a site during an earthquake. Values shown are for Site Class XD per NBC 2025 seismic hazard data."
        locationCount={seismicLocations.length}
      >
        <div className="panel-card formula-card">
          <h3>What is PGA?</h3>
          <div className="formula-text">
            Peak ground acceleration — the strongest shaking expected at a
            location, expressed as a fraction of gravity (g).
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
