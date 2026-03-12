import type { PollenCategory, RiskLevel, HistoricalDataPoint } from "@/types/pollen";
import { grainCountToRisk } from "@/lib/pollen/thresholds";

const API_KEY = process.env.AMBEE_API_KEY;
const BASE_URL = "https://api.ambeedata.com";
const TIMEOUT_MS = 10_000;

interface AmbeePollenResponse {
  message: string;
  data: AmbeePollenData[];
}

interface AmbeePollenData {
  Count: {
    grass_pollen: number;
    tree_pollen: number;
    weed_pollen: number;
  };
  Risk: {
    grass_pollen: string;
    tree_pollen: string;
    weed_pollen: string;
  };
  Species?: {
    Grass?: Record<string, number>;
    Tree?: Record<string, number>;
    Weed?: Record<string, number>;
  };
  updatedAt?: string;
  createdAt?: string;
}

export interface AmbeeNormalized {
  treePollen: number;
  grassPollen: number;
  weedPollen: number;
  treeRisk: RiskLevel;
  grassRisk: RiskLevel;
  weedRisk: RiskLevel;
  species: {
    name: string;
    category: PollenCategory;
    count: number;
  }[];
  timestamp: string;
}

function mapAmbeeRisk(risk: string): RiskLevel {
  const lower = risk.toLowerCase();
  if (lower === "low") return "low";
  if (lower === "moderate") return "moderate";
  if (lower === "high") return "high";
  if (lower === "very high") return "very_high";
  return "none";
}

/**
 * Fetches current pollen data from the Ambee API.
 * Returns normalized counts and risk levels.
 */
export async function fetchAmbeeCurrent(
  lat: number,
  lng: number
): Promise<AmbeeNormalized | null> {
  if (!API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${BASE_URL}/latest/pollen/by-lat-lng?lat=${lat}&lng=${lng}`,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) return null;

    const data: AmbeePollenResponse = await response.json();
    return normalizeAmbeeResponse(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches historical pollen data from the Ambee API.
 * Date range is limited to 48-hour windows.
 */
export async function fetchAmbeeHistory(
  lat: number,
  lng: number,
  from: string,
  to: string
): Promise<HistoricalDataPoint[] | null> {
  if (!API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${BASE_URL}/history/pollen/by-lat-lng?lat=${lat}&lng=${lng}&from=${from}&to=${to}`,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) return null;

    const data: AmbeePollenResponse = await response.json();
    return normalizeAmbeeHistory(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches 5-day pollen forecast from the Ambee API.
 */
export async function fetchAmbeeForecast(
  lat: number,
  lng: number
): Promise<AmbeeNormalized[] | null> {
  if (!API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${BASE_URL}/forecast/v2/pollen/120hr/by-lat-lng?lat=${lat}&lng=${lng}`,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) return null;

    const data: AmbeePollenResponse = await response.json();
    return (data.data ?? []).map((entry) =>
      normalizeAmbeeEntry(entry)
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeAmbeeResponse(data: AmbeePollenResponse): AmbeeNormalized | null {
  const entry = data.data?.[0];
  if (!entry) return null;
  return normalizeAmbeeEntry(entry);
}

function normalizeAmbeeEntry(entry: AmbeePollenData): AmbeeNormalized {
  const species: AmbeeNormalized["species"] = [];

  if (entry.Species?.Tree) {
    for (const [name, count] of Object.entries(entry.Species.Tree)) {
      if (count > 0) species.push({ name, category: "tree", count });
    }
  }
  if (entry.Species?.Grass) {
    for (const [name, count] of Object.entries(entry.Species.Grass)) {
      if (count > 0) species.push({ name, category: "grass", count });
    }
  }
  if (entry.Species?.Weed) {
    for (const [name, count] of Object.entries(entry.Species.Weed)) {
      if (count > 0) species.push({ name, category: "weed", count });
    }
  }

  return {
    treePollen: entry.Count.tree_pollen,
    grassPollen: entry.Count.grass_pollen,
    weedPollen: entry.Count.weed_pollen,
    treeRisk: mapAmbeeRisk(entry.Risk.tree_pollen),
    grassRisk: mapAmbeeRisk(entry.Risk.grass_pollen),
    weedRisk: mapAmbeeRisk(entry.Risk.weed_pollen),
    species,
    timestamp: entry.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeAmbeeHistory(data: AmbeePollenResponse): HistoricalDataPoint[] {
  return (data.data ?? []).map((entry) => ({
    date: entry.updatedAt ?? entry.createdAt ?? new Date().toISOString(),
    treeCount: entry.Count.tree_pollen,
    grassCount: entry.Count.grass_pollen,
    weedCount: entry.Count.weed_pollen,
    treeRisk: grainCountToRisk(entry.Count.tree_pollen, "tree"),
    grassRisk: grainCountToRisk(entry.Count.grass_pollen, "grass"),
    weedRisk: grainCountToRisk(entry.Count.weed_pollen, "weed"),
  }));
}
