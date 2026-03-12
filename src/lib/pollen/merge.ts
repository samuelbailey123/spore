import type { PollenSnapshot, DailyForecast, PollenIndex, SpeciesCount } from "@/types/pollen";
import type { GoogleNormalized } from "@/lib/api/google-pollen";
import type { AmbeeNormalized } from "@/lib/api/ambee-pollen";
import { upiToRisk } from "./thresholds";

/**
 * Merges Google and Ambee data into a unified PollenSnapshot.
 * Google is primary (better species data), Ambee fills grain counts.
 */
export function mergeCurrentData(
  google: GoogleNormalized | null,
  ambee: AmbeeNormalized | null,
  location: { lat: number; lng: number; name: string }
): PollenSnapshot {
  const today = google?.dailyForecasts?.[0];

  const indices: PollenIndex[] = today?.indices ?? buildIndicesFromAmbee(ambee);
  const species: SpeciesCount[] = today?.species ?? [];
  const healthRecommendations = today?.healthRecommendations ?? [];

  return {
    location,
    timestamp: ambee?.timestamp ?? new Date().toISOString(),
    indices,
    species,
    healthRecommendations,
  };
}

/**
 * Merges Google forecast data into DailyForecast array.
 * Falls back to Ambee forecast if Google is unavailable.
 */
export function mergeForecastData(
  google: GoogleNormalized | null,
  ambeeForecast: AmbeeNormalized[] | null
): DailyForecast[] {
  if (google?.dailyForecasts?.length) {
    return google.dailyForecasts.map((day) => ({
      date: day.date,
      indices: day.indices,
      species: day.species,
    }));
  }

  if (ambeeForecast?.length) {
    const grouped = groupByDate(ambeeForecast);
    return Object.entries(grouped).map(([date, entries]) => {
      const avg = averageAmbeeEntries(entries);
      return {
        date,
        indices: buildIndicesFromAmbee(avg),
        species: [],
      };
    });
  }

  return [];
}

function buildIndicesFromAmbee(ambee: AmbeeNormalized | null): PollenIndex[] {
  if (!ambee) return [];
  return [
    {
      category: "tree",
      displayName: "Tree",
      value: scaleGrainToUPI(ambee.treePollen, "tree"),
      risk: ambee.treeRisk,
      inSeason: ambee.treePollen > 0,
      color: "#22c55e",
    },
    {
      category: "grass",
      displayName: "Grass",
      value: scaleGrainToUPI(ambee.grassPollen, "grass"),
      risk: ambee.grassRisk,
      inSeason: ambee.grassPollen > 0,
      color: "#3b82f6",
    },
    {
      category: "weed",
      displayName: "Weed",
      value: scaleGrainToUPI(ambee.weedPollen, "weed"),
      risk: ambee.weedRisk,
      inSeason: ambee.weedPollen > 0,
      color: "#a855f7",
    },
  ];
}

/**
 * Approximate mapping of grain counts to 0-5 UPI scale.
 * This is a rough heuristic for display consistency.
 */
function scaleGrainToUPI(
  count: number,
  _category: string
): number {
  if (count <= 0) return 0;
  if (count < 10) return 1;
  if (count < 50) return 2;
  if (count < 200) return 3;
  if (count < 1000) return 4;
  return 5;
}

function groupByDate(
  entries: AmbeeNormalized[]
): Record<string, AmbeeNormalized[]> {
  const grouped: Record<string, AmbeeNormalized[]> = {};
  for (const entry of entries) {
    const date = entry.timestamp.split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  }
  return grouped;
}

function averageAmbeeEntries(entries: AmbeeNormalized[]): AmbeeNormalized {
  const count = entries.length || 1;
  const totalTree = entries.reduce((sum, e) => sum + e.treePollen, 0);
  const totalGrass = entries.reduce((sum, e) => sum + e.grassPollen, 0);
  const totalWeed = entries.reduce((sum, e) => sum + e.weedPollen, 0);
  const risk = entries[entries.length - 1] ?? entries[0];
  return {
    treePollen: Math.round(totalTree / count),
    grassPollen: Math.round(totalGrass / count),
    weedPollen: Math.round(totalWeed / count),
    treeRisk: risk.treeRisk,
    grassRisk: risk.grassRisk,
    weedRisk: risk.weedRisk,
    species: [],
    timestamp: entries[0]?.timestamp ?? new Date().toISOString(),
  };
}
