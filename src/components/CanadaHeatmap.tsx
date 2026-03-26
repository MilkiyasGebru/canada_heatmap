import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import Legend from './Legend';
import { canadaCities } from '../data/canadaCities';
import 'leaflet/dist/leaflet.css';

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];
const CANADA_ZOOM = 4;

const GRADIENT: Record<number, string> = {
  0.0: '#e0f2ff',
  0.2: '#7ec8e3',
  0.4: '#f7e463',
  0.6: '#f5a623',
  0.8: '#e04040',
  1.0: '#8b0000',
};

export default function CanadaHeatmap() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <MapContainer
        center={CANADA_CENTER}
        zoom={CANADA_ZOOM}
        minZoom={3}
        maxZoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer
          points={canadaCities}
          gradient={GRADIENT}
          opacity={0.6}
          power={2.5}
          resolution={4}
        />
      </MapContainer>
      <Legend gradient={GRADIENT} />
    </div>
  );
}
