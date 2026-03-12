export type PollenCategory = "tree" | "grass" | "weed";

export type RiskLevel = "none" | "low" | "moderate" | "high" | "very_high";

export interface PollenIndex {
  category: PollenCategory;
  displayName: string;
  value: number;
  risk: RiskLevel;
  inSeason: boolean;
  color: string;
}

export interface SpeciesCount {
  name: string;
  slug: string;
  category: PollenCategory;
  indexValue: number;
  risk: RiskLevel;
  inSeason: boolean;
}

export interface PollenSnapshot {
  location: LocationInfo;
  timestamp: string;
  indices: PollenIndex[];
  species: SpeciesCount[];
  healthRecommendations: string[];
}

export interface LocationInfo {
  lat: number;
  lng: number;
  name: string;
}

export interface DailyForecast {
  date: string;
  indices: PollenIndex[];
  species: SpeciesCount[];
}

export interface HistoricalDataPoint {
  date: string;
  treeCount: number;
  grassCount: number;
  weedCount: number;
  treeRisk: RiskLevel;
  grassRisk: RiskLevel;
  weedRisk: RiskLevel;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  source: "google" | "ambee" | "merged" | "cache";
}
