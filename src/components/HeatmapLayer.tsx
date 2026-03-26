import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { HeatmapDataPoint, HeatmapOptions } from '../types/heatmap';

interface HeatmapLayerProps {
  points: HeatmapDataPoint[];
  options?: HeatmapOptions;
}

export default function HeatmapLayer({ points, options }: HeatmapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    const latlngs: L.HeatLatLngTuple[] = points.map((p) => [
      p.lat,
      p.long,
      p.intensity / 100,
    ]);

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    heatLayerRef.current = L.heatLayer(latlngs, {
      radius: options?.radius ?? 35,
      blur: options?.blur ?? 25,
      maxZoom: options?.maxZoom ?? 10,
      max: options?.max ?? 1.0,
      minOpacity: options?.minOpacity ?? 0.05,
      gradient: options?.gradient ?? {
        0.0: '#e0f2ff',
        0.2: '#7ec8e3',
        0.4: '#f7e463',
        0.6: '#f5a623',
        0.8: '#e04040',
        1.0: '#8b0000',
      },
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, options]);

  return null;
}
