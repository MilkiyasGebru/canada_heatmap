import { GeoJSON } from 'react-leaflet';
import canadaGeo from '../data/canadaGeo.json';
import type { Feature, Polygon } from 'geojson';

const geo = canadaGeo as { type: string; coordinates: number[][][][] };

function createMask(): Feature<Polygon> {
  const world: number[][] = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90],
  ];
  const holes: number[][][] = geo.coordinates.map((poly) => poly[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [world, ...holes],
    },
  };
}

const maskData = createMask();

export default function CanadaMask() {
  return (
    <GeoJSON
      data={maskData}
      style={{
        fillColor: '#c8ccd2',
        fillOpacity: 1,
        color: '#8b95a5',
        weight: 1.5,
        opacity: 0.6,
      }}
    />
  );
}
