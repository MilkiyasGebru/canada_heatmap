import { MapContainer, GeoJSON } from 'react-leaflet';
import type { ReactNode } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import canadaGeo from '../data/canadaGeo.json';
import 'leaflet/dist/leaflet.css';

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];
const CANADA_BOUNDS: LatLngBoundsExpression = [
  [38, -145],
  [86, -48],
];

interface BaseMapProps {
  children?: ReactNode;
}

export default function BaseMap({ children }: BaseMapProps) {
  return (
    <MapContainer
      center={CANADA_CENTER}
      zoom={4}
      minZoom={3}
      maxZoom={10}
      maxBounds={CANADA_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <GeoJSON
        data={canadaGeo as GeoJSON.GeoJsonObject}
        style={{
          fillColor: '#e8edf3',
          fillOpacity: 1,
          color: '#8b95a5',
          weight: 1,
          opacity: 0.7,
        }}
      />
      {children}
    </MapContainer>
  );
}
