import type { RiskLevel, SpeciesCount } from "./pollen";

export interface AllergenProfile {
  allergens: string[];
  updatedAt: string;
}

export interface PersonalizedDay {
  date: string;
  relevantSpecies: SpeciesCount[];
  impactScore: number;
  worstAllergen: string | null;
  risk: RiskLevel;
}
