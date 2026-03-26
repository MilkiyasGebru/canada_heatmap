import type { HeatmapDataPoint } from '../types/heatmap';

export const canadaCities: HeatmapDataPoint[] = [
  // Major cities - high intensity
  { lat: 43.6532, long: -79.3832, intensity: 95 },  // Toronto
  { lat: 45.5017, long: -73.5673, intensity: 88 },  // Montreal
  { lat: 49.2827, long: -123.1207, intensity: 85 }, // Vancouver
  { lat: 51.0447, long: -114.0719, intensity: 75 }, // Calgary
  { lat: 53.5461, long: -113.4937, intensity: 72 }, // Edmonton
  { lat: 45.4215, long: -75.6972, intensity: 70 },  // Ottawa
  { lat: 49.8951, long: -97.1384, intensity: 65 },  // Winnipeg
  { lat: 43.2557, long: -79.8711, intensity: 60 },  // Hamilton
  { lat: 42.9849, long: -81.2453, intensity: 55 },  // London ON
  { lat: 46.8139, long: -71.2080, intensity: 58 },  // Quebec City

  // Medium cities
  { lat: 44.6488, long: -63.5752, intensity: 50 },  // Halifax
  { lat: 48.4284, long: -123.3656, intensity: 45 }, // Victoria
  { lat: 43.4643, long: -80.5204, intensity: 48 },  // Kitchener
  { lat: 52.1332, long: -106.6700, intensity: 42 }, // Saskatoon
  { lat: 50.4452, long: -104.6189, intensity: 40 }, // Regina
  { lat: 46.2382, long: -63.1311, intensity: 35 },  // Charlottetown
  { lat: 47.5615, long: -52.7126, intensity: 38 },  // St. John's
  { lat: 45.2733, long: -66.0633, intensity: 33 },  // Saint John NB
  { lat: 46.0878, long: -64.7782, intensity: 36 },  // Moncton
  { lat: 43.8561, long: -79.3370, intensity: 52 },  // Markham
  { lat: 44.3894, long: -79.6903, intensity: 47 },  // Barrie

  // Smaller / remote cities - lower intensity
  { lat: 54.7667, long: -101.8748, intensity: 18 }, // Flin Flon
  { lat: 56.2335, long: -120.8466, intensity: 20 }, // Fort St. John
  { lat: 58.7857, long: -94.1827, intensity: 12 },  // Churchill
  { lat: 62.4540, long: -114.3718, intensity: 22 }, // Yellowknife
  { lat: 60.7212, long: -135.0568, intensity: 15 }, // Whitehorse
  { lat: 63.7467, long: -68.5170, intensity: 8 },   // Iqaluit
  { lat: 53.2527, long: -131.8462, intensity: 10 }, // Haida Gwaii area
  { lat: 69.1169, long: -105.0597, intensity: 5 },  // Cambridge Bay
  { lat: 55.1700, long: -118.7952, intensity: 25 }, // Grande Prairie
  { lat: 48.3809, long: -89.2477, intensity: 30 },  // Thunder Bay
  { lat: 46.4917, long: -80.9930, intensity: 32 },  // Sudbury
  { lat: 54.2325, long: -132.6328, intensity: 7 },  // Prince Rupert area
];
