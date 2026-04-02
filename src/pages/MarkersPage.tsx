import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import SidePanel from '../components/SidePanel';
import { seismicLocations } from '../data/seismicPoints';
import 'leaflet/dist/leaflet.css';

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];

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
            <CircleMarker
              key={`${loc.lat}-${loc.long}`}
              center={[loc.lat, loc.long]}
              radius={4}
              pathOptions={{
                fillColor: '#d32f2f',
                color: '#b71c1c',
                weight: 1,
                fillOpacity: 0.9,
                opacity: 0.9,
              }}
            >
              <Popup>
                <strong>{loc.location}</strong>, {loc.province}
                <br />
                Sa(0.2): {loc.sa02.toFixed(4)} g
                <br />
                PGA: {loc.pga.toFixed(4)} g
              </Popup>
            </CircleMarker>
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
        description="Locations from the NBC 2025 climatic and seismic dataset. Click any dot to see the city name, province, and key seismic values."
        locationCount={seismicLocations.length}
      />
    </div>
  );
}
