import type { SeismicLocation } from '../types/heatmap';
import csvText from './seismic_data.csv?raw';

function parseCSV(text: string): SeismicLocation[] {
  const lines = text.trim().split('\n');
  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(',');
      return {
        location: parts[0].trim(),
        province: parts[1].trim(),
        lat: parseFloat(parts[2]),
        long: parseFloat(parts[3]),
        sa02: parseFloat(parts[4]),
      };
    });
}

export const seismicLocations: SeismicLocation[] = parseCSV(csvText);
