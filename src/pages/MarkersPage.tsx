import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import SidePanel from '../components/SidePanel';
import { seismicLocations } from '../data/seismicPoints';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];

// Fix Leaflet default marker icon path issue with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DUMMY_GRADIENT: Record<number, string> = {
  0.0: '#ccc',
  1.0: '#333',
};

export default function MarkersPage() {
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
          {seismicLocations.map((loc) => (
            <Marker
              key={`${loc.lat}-${loc.long}`}
              position={[loc.lat, loc.long]}
              icon={defaultIcon}
            >
              <Popup>
                <strong>{loc.location}</strong>, {loc.province}
                <br />
                Sa(0.2): {loc.sa02.toFixed(4)} g
                <br />
                PGA: {loc.pga.toFixed(4)} g
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <SidePanel
        badge="NBC 2025"
        title="City Locations"
        subtitle="All monitored locations across Canada"
        gradient={DUMMY_GRADIENT}
        minVal={0}
        maxVal={0}
        unit=""
        scaleLabel=""
        description="Locations from the NBC 2025 climatic and seismic dataset. Click any marker to see the city name, province, and key seismic values."
        locationCount={seismicLocations.length}
      />
    </div>
  );
}
