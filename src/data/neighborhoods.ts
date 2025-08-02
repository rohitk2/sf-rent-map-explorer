// Neighborhood data for San Francisco
export interface Neighborhood {
  name: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  color: string;
}

export const neighborhoods: Neighborhood[] = [
  { name: 'Downtown', bounds: [[37.7910, -122.4050], [37.7975, -122.3960]], color: '#ff8c00' },
  { name: 'SoMa', bounds: [[37.7700, -122.4175], [37.7845, -122.3950]], color: '#facc15' },
  { name: 'Tenderloin', bounds: [[37.7820, -122.4185], [37.7880, -122.4090]], color: '#dc2626' },
  { name: 'Civic Center', bounds: [[37.7780, -122.4200], [37.7820, -122.4140]], color: '#fb923c' },
];