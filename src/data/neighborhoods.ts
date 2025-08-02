// Neighborhood data for San Francisco
export interface Neighborhood {
  name: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  color: string;
}

export const neighborhoods: Neighborhood[] = [
  { name: 'Mission District', bounds: [[37.7480, -122.4230], [37.7655, -122.4095]], color: '#ef4444' },
  { name: 'SoMa', bounds: [[37.7750, -122.4140], [37.7900, -122.3950]], color: '#374151' },
  { name: 'Tenderloin', bounds: [[37.7820, -122.4185], [37.7880, -122.4090]], color: '#dc2626' },
  { name: 'Nob Hill', bounds: [[37.7905, -122.4190], [37.7965, -122.4080]], color: '#059669' },
  { name: 'North Beach', bounds: [[37.7990, -122.4130], [37.8060, -122.4030]], color: '#0ea5e9' },
  { name: 'Castro', bounds: [[37.7550, -122.4430], [37.7660, -122.4300]], color: '#8b5cf6' },
  { name: 'Haight-Ashbury', bounds: [[37.7660, -122.4530], [37.7725, -122.4400]], color: '#d946ef' },
  { name: 'Sunset District', bounds: [[37.7380, -122.5080], [37.7620, -122.4630]], color: '#22c55e' },
  { name: 'Richmond District', bounds: [[37.7730, -122.5090], [37.7860, -122.4570]], color: '#eab308' },
  { name: 'Bayview-Hunters Pt', bounds: [[37.7080, -122.3920], [37.7350, -122.3750]], color: '#f97316' },
  { name: 'Excelsior', bounds: [[37.7160, -122.4420], [37.7380, -122.4150]], color: '#84cc16' },
  { name: 'Twin Peaks', bounds: [[37.7450, -122.4600], [37.7570, -122.4410]], color: '#6366f1' },
  { name: 'Marina', bounds: [[37.8000, -122.4480], [37.8080, -122.4270]], color: '#3b82f6' },
  { name: 'Pacific Heights', bounds: [[37.7890, -122.4450], [37.7975, -122.4230]], color: '#06b6d4' },
  { name: 'Financial District', bounds: [[37.7910, -122.4050], [37.7975, -122.3960]], color: '#10b981' },
  { name: 'Chinatown', bounds: [[37.7920, -122.4100], [37.7960, -122.4040]], color: '#f59e0b' },
];