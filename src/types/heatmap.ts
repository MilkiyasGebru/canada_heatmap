export interface HeatmapDataPoint {
  lat: number;
  long: number;
  intensity: number; // 0-100
}

export interface SeismicLocation {
  location: string;
  province: string;
  lat: number;
  long: number;
  sa02: number;
}
