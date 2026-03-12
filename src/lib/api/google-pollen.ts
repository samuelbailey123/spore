import type { PollenCategory, PollenIndex, SpeciesCount } from "@/types/pollen";
import { upiToRisk } from "@/lib/pollen/thresholds";

const API_KEY = process.env.GOOGLE_POLLEN_API_KEY;
const BASE_URL = "https://pollen.googleapis.com/v1/forecast:lookup";
const TIMEOUT_MS = 10_000;

interface GooglePollenResponse {
  regionCode: string;
  dailyInfo: GoogleDailyInfo[];
}

interface GoogleDailyInfo {
  date: { year: number; month: number; day: number };
  pollenTypeInfo?: GooglePollenTypeInfo[];
  plantInfo?: GooglePlantInfo[];
}

interface GooglePollenTypeInfo {
  code: string;
  displayName: string;
  indexInfo?: {
    code: string;
    displayName: string;
    value: number;
    category: string;
    indexDescription: string;
    color?: { red?: number; green?: number; blue?: number };
  };
  healthRecommendations?: string[];
  inSeason?: boolean;
}

interface GooglePlantInfo {
  code: string;
  displayName: string;
  inSeason?: boolean;
  indexInfo?: {
    code: string;
    displayName: string;
    value: number;
    category: string;
    indexDescription: string;
    color?: { red?: number; green?: number; blue?: number };
  };
  plantDescription?: {
    type: string;
    family: string;
    season: string;
    specialColors: string;
    specialShapes: string;
    crossReaction: string;
    picture: string;
    pictureCloseup: string;
  };
}

export interface GoogleNormalized {
  dailyForecasts: {
    date: string;
    indices: PollenIndex[];
    species: SpeciesCount[];
    healthRecommendations: string[];
  }[];
}

const CATEGORY_MAP: Record<string, PollenCategory> = {
  TREE: "tree",
  GRASS: "grass",
  WEED: "weed",
};

const CATEGORY_COLORS: Record<PollenCategory, string> = {
  tree: "#22c55e",
  grass: "#3b82f6",
  weed: "#a855f7",
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function categoryForPlant(code: string): PollenCategory {
  const grassCodes = ["GRASS"];
  const weedCodes = ["RAGWEED", "MUGWORT"];
  if (grassCodes.includes(code)) return "grass";
  if (weedCodes.includes(code)) return "weed";
  return "tree";
}

/**
 * Fetches pollen forecast data from the Google Pollen API.
 * Returns normalized data or null if the API is unavailable.
 */
export async function fetchGooglePollen(
  lat: number,
  lng: number,
  days: number = 5
): Promise<GoogleNormalized | null> {
  if (!API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("location.longitude", lng.toString());
    url.searchParams.set("location.latitude", lat.toString());
    url.searchParams.set("days", Math.min(days, 5).toString());
    url.searchParams.set("languageCode", "en");

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data: GooglePollenResponse = await response.json();
    return normalizeGoogleResponse(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeGoogleResponse(data: GooglePollenResponse): GoogleNormalized {
  const dailyForecasts = (data.dailyInfo ?? []).map((day) => {
    const date = `${day.date.year}-${String(day.date.month).padStart(2, "0")}-${String(day.date.day).padStart(2, "0")}`;

    const indices: PollenIndex[] = (day.pollenTypeInfo ?? [])
      .map((info) => {
        const category = CATEGORY_MAP[info.code];
        if (!category) return null;
        const value = info.indexInfo?.value ?? 0;
        return {
          category,
          displayName: info.displayName,
          value,
          risk: upiToRisk(value),
          inSeason: info.inSeason ?? false,
          color: CATEGORY_COLORS[category],
        };
      })
      .filter((x): x is PollenIndex => x !== null);

    const species: SpeciesCount[] = (day.plantInfo ?? [])
      .map((plant) => {
        const value = plant.indexInfo?.value ?? 0;
        const category = categoryForPlant(plant.code);
        return {
          name: plant.displayName,
          slug: slugify(plant.displayName),
          category,
          indexValue: value,
          risk: upiToRisk(value),
          inSeason: plant.inSeason ?? false,
        };
      })
      .filter((s) => s.inSeason);

    const healthRecommendations: string[] = (day.pollenTypeInfo ?? []).flatMap(
      (info) => info.healthRecommendations ?? []
    );

    return { date, indices, species, healthRecommendations };
  });

  return { dailyForecasts };
}
