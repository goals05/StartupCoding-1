export type CongestionLevel = '여유' | '보통' | '혼잡' | '매우혼잡';

export interface CongestionData {
  time: number; // 0-23
  waitTime: number; // minutes
}

export interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  currentCongestion: CongestionLevel;
  currentWaitTime: number;
  congestionHistory: CongestionData[];
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  naverMapUrl?: string;
  openHours?: {
    open: number; // 0-23
    close: number; // 0-23
  };
  breakTime?: {
    start: number;
    end: number;
  };
}

export interface RouteStep {
  placeId: string;
  arrivalTime: string;
  departureTime: string;
  waitTime: number;
  travelTime: number; // minutes from previous step
}

export interface RegionCongestion {
  id: string;
  name: string; // e.g., "서울시", "한남동", "대전시"
  province: string; // e.g., "서울", "경기", "강원"
  level: CongestionLevel;
  trend: 'rising' | 'falling' | 'stable';
  avgWaitTime: number;
  populationDensity: number; // 0-100
  history: CongestionData[];
}

export interface OptimizedRoute {
  steps: RouteStep[];
  totalDuration: number;
}
