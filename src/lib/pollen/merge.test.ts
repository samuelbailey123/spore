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

  it("includes species data from Google forecast", () => {
    const result = mergeForecastData(mockGoogleData, null);
    expect(result[0].species).toHaveLength(2);
  });
});
