import type { DailyForecast, RiskLevel, SpeciesCount } from "@/types/pollen";
import type { PersonalizedDay } from "@/types/allergen";
import { upiToRisk } from "./thresholds";
import { getSpeciesBySlug } from "@/data/species";

/**
 * Filter a forecast to only include species the user is allergic to,
 * and compute a personalized impact score for each day.
 */
export function filterForecastByAllergens(
  forecast: DailyForecast[],
  allergens: string[]
): PersonalizedDay[] {
  if (allergens.length === 0) return [];
  const slugSet = new Set(allergens);

  return forecast.map((day) => {
    const relevant = day.species.filter((s) => slugSet.has(s.slug));
    const impact = calculateDayImpact(day, allergens);
    const worst =
      relevant.length > 0
        ? relevant.reduce((a, b) => (b.indexValue > a.indexValue ? b : a))
        : null;

    return {
      date: day.date,
      relevantSpecies: relevant,
      impactScore: impact,
      worstAllergen: worst?.name ?? null,
      risk: impactToRisk(impact),
    };
  });
}

/**
 * Sum UPI values across all allergen species for a given day.
 */
export function calculateDayImpact(
  day: DailyForecast,
  allergens: string[]
): number {
  const slugSet = new Set(allergens);
  return day.species
    .filter((s) => slugSet.has(s.slug))
    .reduce((sum, s) => sum + s.indexValue, 0);
}

/**
 * Return the index of the day with the highest impact score.
 * Returns 0 if the array is empty.
 */
export function findWorstDay(days: PersonalizedDay[]): number {
  if (days.length === 0) return 0;
  let worst = 0;
  for (let i = 1; i < days.length; i++) {
    if (days[i].impactScore > days[worst].impactScore) {
      worst = i;
    }
  }
  return worst;
}

/**
 * Gather actionable tips for the user's selected allergens.
 */
export function getAllergenTips(allergens: string[]): string[] {
  const tips: string[] = [];
  for (const slug of allergens) {
    const profile = getSpeciesBySlug(slug);
    if (profile && profile.tips.length > 0) {
      tips.push(profile.tips[0]);
    }
  }
  return tips;
}

/**
 * Map a cumulative impact score to a risk level.
 * Thresholds are calibrated to the 0-5 UPI scale summed across species.
 */
function impactToRisk(score: number): RiskLevel {
  if (score <= 0) return "none";
  if (score <= 2) return "low";
  if (score <= 5) return "moderate";
  if (score <= 10) return "high";
  return "very_high";
}
