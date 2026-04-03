import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { HeatmapDataPoint } from '../types/heatmap';
import { isInsideCanada } from '../data/canadaBoundary';

interface HeatmapLayerProps {
  points: HeatmapDataPoint[];
  gradient?: Record<number, string>;
  opacity?: number;
  power?: number;
  resolution?: number;
  /** Render as flat color bands with contour lines (like NBCC maps) */
  stepped?: boolean;
}

const DEFAULT_GRADIENT: Record<number, string> = {
  0.0: '#e0f2ff',
  0.2: '#7ec8e3',
  0.4: '#f7e463',
  0.6: '#f5a623',
  0.8: '#e04040',
  1.0: '#8b0000',
};

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

interface GradientStop {
  stop: number;
  rgb: [number, number, number];
}

function buildStops(gradient: Record<number, string>): GradientStop[] {
  return Object.entries(gradient)
    .map(([s, color]) => ({ stop: Number(s), rgb: hexToRgb(color) }))
    .sort((a, b) => a.stop - b.stop);
}

/** Smooth interpolated color */
function colorSmooth(
  v: number,
  stops: GradientStop[],
  alpha: number,
): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, v));
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].stop && clamped <= stops[i + 1].stop) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const range = hi.stop - lo.stop;
  const t = range === 0 ? 0 : (clamped - lo.stop) / range;
  return [
    Math.round(lo.rgb[0] + t * (hi.rgb[0] - lo.rgb[0])),
    Math.round(lo.rgb[1] + t * (hi.rgb[1] - lo.rgb[1])),
    Math.round(lo.rgb[2] + t * (hi.rgb[2] - lo.rgb[2])),
    Math.round(alpha * 255),
  ];
}

/** Stepped/flat band color — snaps to the stop at or below the value */
function colorStepped(
  v: number,
  stops: GradientStop[],
  alpha: number,
): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, v));
  let c = stops[0];
  for (let i = stops.length - 1; i >= 0; i--) {
    if (clamped >= stops[i].stop) {
      c = stops[i];
      break;
    }
  }
  return [c.rgb[0], c.rgb[1], c.rgb[2], Math.round(alpha * 255)];
}

/** Returns the band index (which stop the value falls into) */
function getBand(v: number, stops: GradientStop[]): number {
  const clamped = Math.max(0, Math.min(1, v));
  for (let i = stops.length - 1; i >= 0; i--) {
    if (clamped >= stops[i].stop) return i;
  }
  return 0;
}

function idw(
  lat: number,
  lng: number,
  points: HeatmapDataPoint[],
  power: number,
): number {
  let num = 0;
  let den = 0;
  for (let i = 0; i < points.length; i++) {
    const dLat = lat - points[i].lat;
    const dLng = lng - points[i].long;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < 0.0001) return points[i].intensity / 100;
    const w = 1 / Math.pow(distSq, power / 2);
    num += w * (points[i].intensity / 100);
    den += w;
  }
  return den === 0 ? 0 : num / den;
}

export default function HeatmapLayer({
  points,
  gradient = DEFAULT_GRADIENT,
  opacity = 0.6,
  power = 2.5,
  resolution = 4,
  stepped = false,
}: HeatmapLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.GridLayer | null>(null);

  useEffect(() => {
    const stops = buildStops(gradient);
    const colorFn = stepped ? colorStepped : colorSmooth;

    const IDWGrid = L.GridLayer.extend({
      createTile(coords: L.Coords) {
        const tile = document.createElement('canvas');
        const size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        const ctx = tile.getContext('2d');
        if (!ctx) return tile;

        const imgData = ctx.createImageData(size.x, size.y);
        const buf = imgData.data;

        const cols = Math.ceil(size.x / resolution);
        const rows = Math.ceil(size.y / resolution);

        // Pass 1: compute IDW values on grid
        const vals = new Float32Array(rows * cols).fill(-1);

        for (let gy = 0; gy < rows; gy++) {
          for (let gx = 0; gx < cols; gx++) {
            const px = gx * resolution;
            const py = gy * resolution;
            const absPoint = L.point(
              coords.x * size.x + px,
              coords.y * size.y + py,
            );
            const ll = map.unproject(absPoint, coords.z);
            if (!isInsideCanada(ll.lat, ll.lng)) continue;
            vals[gy * cols + gx] = idw(ll.lat, ll.lng, points, power);
          }
        }

        // Pass 2: render colors + contour edges
        for (let gy = 0; gy < rows; gy++) {
          for (let gx = 0; gx < cols; gx++) {
            const val = vals[gy * cols + gx];
            if (val < 0) continue; // outside Canada

            let c = colorFn(val, stops, opacity);

            // Contour edge detection for stepped mode
            if (stepped) {
              const band = getBand(val, stops);
              const rVal = gx + 1 < cols ? vals[gy * cols + gx + 1] : -1;
              const bVal = gy + 1 < rows ? vals[(gy + 1) * cols + gx] : -1;
              const isEdge =
                (rVal >= 0 && getBand(rVal, stops) !== band) ||
                (bVal >= 0 && getBand(bVal, stops) !== band);
              if (isEdge) {
                c = [50, 50, 50, Math.round(opacity * 180)];
              }
            }

            const startY = gy * resolution;
            const startX = gx * resolution;
            for (let dy = 0; dy < resolution && startY + dy < size.y; dy++) {
              for (
                let dx = 0;
                dx < resolution && startX + dx < size.x;
                dx++
              ) {
                const idx = ((startY + dy) * size.x + (startX + dx)) * 4;
                buf[idx] = c[0];
                buf[idx + 1] = c[1];
                buf[idx + 2] = c[2];
                buf[idx + 3] = c[3];
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        return tile;
      },
    });

    layerRef.current = new IDWGrid() as L.GridLayer;
    layerRef.current.addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, gradient, opacity, power, resolution, stepped]);

  return null;
}
