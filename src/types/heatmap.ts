export interface HeatmapDataPoint {
  lat: number;
  long: number;
  intensity: number; // 0-100
}

export interface HeatmapOptions {
  radius?: number;
  blur?: number;
  maxZoom?: number;
  max?: number;
  gradient?: Record<number, string>;
  minOpacity?: number;
}
