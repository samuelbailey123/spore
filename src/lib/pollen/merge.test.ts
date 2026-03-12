import { describe, it, expect } from "vitest";
import { mergeCurrentData, mergeForecastData } from "./merge";
import type { GoogleNormalized } from "@/lib/api/google-pollen";
import type { AmbeeNormalized } from "@/lib/api/ambee-pollen";

const mockLocation = { lat: 29.76, lng: -95.37, name: "Houston, TX" };

const mockGoogleData: GoogleNormalized = {
  dailyForecasts: [
    {
      date: "2026-03-11",
      indices: [
        { category: "tree", displayName: "Tree", value: 3, risk: "high", inSeason: true, color: "#22c55e" },
        { category: "grass", displayName: "Grass", value: 1, risk: "low", inSeason: true, color: "#3b82f6" },
        { category: "weed", displayName: "Weed", value: 0, risk: "none", inSeason: false, color: "#a855f7" },
      ],
      species: [
        { name: "Oak", slug: "oak", category: "tree", indexValue: 4, risk: "very_high", inSeason: true },
        { name: "Birch", slug: "birch", category: "tree", indexValue: 2, risk: "moderate", inSeason: true },
      ],
      healthRecommendations: ["Limit outdoor exposure."],
    },
  ],
};

const mockAmbeeData: AmbeeNormalized = {
  treePollen: 450,
  grassPollen: 12,
  weedPollen: 0,
  treeRisk: "high",
  grassRisk: "moderate",
  weedRisk: "none",
  species: [{ name: "Oak", category: "tree", count: 300 }],
  timestamp: "2026-03-11T10:00:00Z",
};

describe("mergeCurrentData", () => {
  it("returns Google data when both sources available", () => {
    const result = mergeCurrentData(mockGoogleData, mockAmbeeData, mockLocation);
    expect(result.indices).toHaveLength(3);
    expect(result.indices[0].category).toBe("tree");
    expect(result.indices[0].value).toBe(3);
    expect(result.species).toHaveLength(2);
    expect(result.location).toEqual(mockLocation);
    expect(result.healthRecommendations).toContain("Limit outdoor exposure.");
  });

  it("falls back to Ambee when Google unavailable", () => {
    const result = mergeCurrentData(null, mockAmbeeData, mockLocation);
    expect(result.indices).toHaveLength(3);
    expect(result.indices[0].category).toBe("tree");
    expect(result.timestamp).toBe("2026-03-11T10:00:00Z");
  });

  it("returns empty data when both sources fail", () => {
    const result = mergeCurrentData(null, null, mockLocation);
    expect(result.indices).toHaveLength(0);
    expect(result.species).toHaveLength(0);
  });

  it("uses Google species over Ambee", () => {
    const result = mergeCurrentData(mockGoogleData, mockAmbeeData, mockLocation);
    expect(result.species.find(s => s.name === "Oak")).toBeDefined();
    expect(result.species.find(s => s.name === "Birch")).toBeDefined();
  });

  it("includes location info", () => {
    const result = mergeCurrentData(mockGoogleData, null, mockLocation);
    expect(result.location.name).toBe("Houston, TX");
    expect(result.location.lat).toBe(29.76);
  });
});

describe("mergeForecastData", () => {
  it("returns Google forecast when available", () => {
    const result = mergeForecastData(mockGoogleData, null);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2026-03-11");
    expect(result[0].indices).toHaveLength(3);
  });

  it("falls back to Ambee forecast", () => {
    const ambeeForecasts: AmbeeNormalized[] = [
      { ...mockAmbeeData, timestamp: "2026-03-11T10:00:00Z" },
      { ...mockAmbeeData, timestamp: "2026-03-12T10:00:00Z" },
    ];
    const result = mergeForecastData(null, ambeeForecasts);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns empty when both fail", () => {
    const result = mergeForecastData(null, null);
    expect(result).toHaveLength(0);
  });

  it("returns empty for empty arrays", () => {
    const result = mergeForecastData({ dailyForecasts: [] }, []);
    expect(result).toHaveLength(0);
  });

  it("groups and averages same-date Ambee entries", () => {
    const ambeeForecasts: AmbeeNormalized[] = [
      { ...mockAmbeeData, treePollen: 100, timestamp: "2026-03-11T08:00:00Z" },
      { ...mockAmbeeData, treePollen: 200, timestamp: "2026-03-11T16:00:00Z" },
    ];
    const result = mergeForecastData(null, ambeeForecasts);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2026-03-11");
    // Average of 100 and 200 = 150, scaled to UPI
    const treeIndex = result[0].indices.find(i => i.category === "tree");
    expect(treeIndex).toBeDefined();
  });

  it("includes species data from Google forecast", () => {
    const result = mergeForecastData(mockGoogleData, null);
    expect(result[0].species).toHaveLength(2);
  });
});

describe("mergeForecastData edge cases", () => {
  it("handles Ambee entries with same-date grouping preserving risk from last entry", () => {
    const entries: AmbeeNormalized[] = [
      {
        treePollen: 100,
        grassPollen: 0,
        weedPollen: 0,
        treeRisk: "low",
        grassRisk: "none",
        weedRisk: "none",
        species: [],
        timestamp: "2026-03-11T08:00:00Z",
      },
      {
        treePollen: 300,
        grassPollen: 20,
        weedPollen: 0,
        treeRisk: "high",
        grassRisk: "moderate",
        weedRisk: "none",
        species: [],
        timestamp: "2026-03-11T16:00:00Z",
      },
    ];
    const result = mergeForecastData(null, entries);
    expect(result).toHaveLength(1);
    // Average tree: (100+300)/2=200, average grass: (0+20)/2=10
    // Risk from last entry
    const treeIdx = result[0].indices.find(i => i.category === "tree")!;
    expect(treeIdx.risk).toBe("high");
  });
});

describe("scaleGrainToUPI (via buildIndicesFromAmbee)", () => {
  it("maps count >= 1000 to UPI value 5", () => {
    const highCountAmbee: AmbeeNormalized = {
      treePollen: 1500,
      grassPollen: 1000,
      weedPollen: 2000,
      treeRisk: "very_high",
      grassRisk: "very_high",
      weedRisk: "very_high",
      species: [],
      timestamp: "2026-03-11T10:00:00Z",
    };
    const result = mergeCurrentData(null, highCountAmbee, mockLocation);
    expect(result.indices[0].value).toBe(5);
    expect(result.indices[1].value).toBe(5);
    expect(result.indices[2].value).toBe(5);
  });

  it("maps count 0 to UPI value 0", () => {
    const zeroAmbee: AmbeeNormalized = {
      treePollen: 0,
      grassPollen: 0,
      weedPollen: 0,
      treeRisk: "none",
      grassRisk: "none",
      weedRisk: "none",
      species: [],
      timestamp: "2026-03-11T10:00:00Z",
    };
    const result = mergeCurrentData(null, zeroAmbee, mockLocation);
    expect(result.indices[0].value).toBe(0);
  });

  it("maps count 5 to UPI value 1", () => {
    const lowAmbee: AmbeeNormalized = {
      treePollen: 5,
      grassPollen: 0,
      weedPollen: 0,
      treeRisk: "low",
      grassRisk: "none",
      weedRisk: "none",
      species: [],
      timestamp: "2026-03-11T10:00:00Z",
    };
    const result = mergeCurrentData(null, lowAmbee, mockLocation);
    expect(result.indices[0].value).toBe(1);
  });

  it("maps count 49 to UPI value 2", () => {
    const modAmbee: AmbeeNormalized = {
      treePollen: 49,
      grassPollen: 0,
      weedPollen: 0,
      treeRisk: "moderate",
      grassRisk: "none",
      weedRisk: "none",
      species: [],
      timestamp: "2026-03-11T10:00:00Z",
    };
    const result = mergeCurrentData(null, modAmbee, mockLocation);
    expect(result.indices[0].value).toBe(2);
  });

  it("maps count 199 to UPI value 3", () => {
    const highAmbee: AmbeeNormalized = {
      treePollen: 199,
      grassPollen: 0,
      weedPollen: 0,
      treeRisk: "high",
      grassRisk: "none",
      weedRisk: "none",
      species: [],
      timestamp: "2026-03-11T10:00:00Z",
    };
    const result = mergeCurrentData(null, highAmbee, mockLocation);
    expect(result.indices[0].value).toBe(3);
  });
});
