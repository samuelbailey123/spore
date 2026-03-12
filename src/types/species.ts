import type { PollenCategory } from "./pollen";

export interface SpeciesProfile {
  slug: string;
  name: string;
  scientificName: string;
  category: PollenCategory;
  description: string;
  allergySeverity: "mild" | "moderate" | "severe";
  bloomPeriod: {
    start: number;
    end: number;
  };
  peakMonths: number[];
  crossReactivity: string[];
  prevalence: string;
  grainSize: string;
  tips: string[];
}
