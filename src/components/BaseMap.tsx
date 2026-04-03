import { MapContainer, TileLayer } from 'react-leaflet';
import CanadaMask from './CanadaMask';
import type { ReactNode } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
      />
      {children}
      <CanadaMask />
    </MapContainer>
  );
}
