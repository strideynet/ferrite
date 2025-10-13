// Types for S-parameter data and amateur radio bands

export interface SParameterPoint {
  frequency: number; // Hz
  s11Real: number;
  s11Imag: number;
  s21Real?: number; // Optional for S2P files
  s21Imag?: number;
  s12Real?: number;
  s12Imag?: number;
  s22Real?: number;
  s22Imag?: number;
}

export interface SParameterData {
  points: SParameterPoint[];
  format: 's1p' | 's2p';
  referenceImpedance: number; // Usually 50 ohms
}

export interface Band {
  name: string;
  startFreq: number; // Hz
  endFreq: number; // Hz
  color: string; // For chart display
}

export interface SWRPoint {
  frequency: number; // Hz
  swr: number;
}

export interface BandSWRData {
  band: Band;
  swrPoints: SWRPoint[];
  minSWR: number;
  maxSWR: number;
  avgSWR: number;
}

// Amateur radio band definitions (in Hz)
export const AMATEUR_BANDS: Band[] = [
  { name: '160m', startFreq: 1800000, endFreq: 2000000, color: '#FF6384' },
  { name: '80m', startFreq: 3500000, endFreq: 4000000, color: '#36A2EB' },
  { name: '40m', startFreq: 7000000, endFreq: 7300000, color: '#FFCE56' },
  { name: '30m', startFreq: 10100000, endFreq: 10150000, color: '#4BC0C0' },
  { name: '20m', startFreq: 14000000, endFreq: 14350000, color: '#9966FF' },
  { name: '17m', startFreq: 18068000, endFreq: 18168000, color: '#FF9F40' },
  { name: '15m', startFreq: 21000000, endFreq: 21450000, color: '#FF6384' },
  { name: '12m', startFreq: 24890000, endFreq: 24990000, color: '#C9CBCF' },
  { name: '10m', startFreq: 28000000, endFreq: 29700000, color: '#36A2EB' },
  { name: '6m', startFreq: 50000000, endFreq: 54000000, color: '#FFCE56' },
  { name: '2m', startFreq: 144000000, endFreq: 148000000, color: '#4BC0C0' },
  { name: '70cm', startFreq: 420000000, endFreq: 450000000, color: '#9966FF' },
];