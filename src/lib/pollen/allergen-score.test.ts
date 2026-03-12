import { describe, it, expect } from "vitest";
import {
  filterForecastByAllergens,
  calculateDayImpact,
  findWorstDay,
  getAllergenTips,
} from "./allergen-score";
import type { DailyForecast } from "@/types/pollen";
import type { PersonalizedDay } from "@/types/allergen";

const mockForecast: DailyForecast[] = [
  {
    date: "2026-03-12",
    indices: [
      {
        category: "tree",
        displayName: "Tree",
        value: 3,
        risk: "high",
        inSeason: true,
        color: "#22c55e",
      },
    ],
    species: [
      {
        name: "Oak",
        slug: "oak",
        category: "tree",
        indexValue: 4,
        risk: "very_high",
        inSeason: true,
      },
      {
        name: "Birch",
        slug: "birch",
        category: "tree",
        indexValue: 2,
        risk: "moderate",
        inSeason: true,
      },
      {
        name: "Ragweed",
        slug: "ragweed",
        category: "weed",
        indexValue: 1,
        risk: "low",
        inSeason: false,
      },
    ],
  },
  {
    date: "2026-03-13",
    indices: [
      {
        category: "tree",
        displayName: "Tree",
        value: 1,
        risk: "low",
        inSeason: true,
        color: "#22c55e",
      },
    ],
    species: [
      {
        name: "Oak",
        slug: "oak",
        category: "tree",
        indexValue: 1,
        risk: "low",
        inSeason: true,
      },
      {
        name: "Birch",
        slug: "birch",
        category: "tree",
        indexValue: 0.5,
        risk: "low",
        inSeason: true,
      },
    ],
  },
  {
    date: "2026-03-14",
    indices: [],
    species: [
      {
        name: "Oak",
        slug: "oak",
        category: "tree",
        indexValue: 3,
        risk: "high",
        inSeason: true,
      },
    ],
  },
];

describe("filterForecastByAllergens", () => {
  it("returns empty array when no allergens selected", () => {
    const result = filterForecastByAllergens(mockForecast, []);
    expect(result).toEqual([]);
  });

  it("filters to only selected allergens", () => {
    const result = filterForecastByAllergens(mockForecast, ["oak"]);
    expect(result).toHaveLength(3);
    expect(result[0].relevantSpecies).toHaveLength(1);
    expect(result[0].relevantSpecies[0].slug).toBe("oak");
  });

  it("calculates impact score as sum of UPI values", () => {
    const result = filterForecastByAllergens(mockForecast, ["oak", "birch"]);
    expect(result[0].impactScore).toBe(6);
    expect(result[1].impactScore).toBe(1.5);
  });

  it("identifies the worst allergen per day", () => {
    const result = filterForecastByAllergens(mockForecast, ["oak", "birch"]);
    expect(result[0].worstAllergen).toBe("Oak");
  });

  it("picks second species as worst when it has higher UPI", () => {
    const forecast: DailyForecast[] = [
      {
        date: "2026-03-12",
        indices: [],
        species: [
          { name: "Birch", slug: "birch", category: "tree", indexValue: 1, risk: "low", inSeason: true },
          { name: "Oak", slug: "oak", category: "tree", indexValue: 5, risk: "very_high", inSeason: true },
        ],
      },
    ];
    const result = filterForecastByAllergens(forecast, ["birch", "oak"]);
    expect(result[0].worstAllergen).toBe("Oak");
  });

  it("assigns risk levels based on impact score", () => {
    const result = filterForecastByAllergens(mockForecast, ["oak", "birch"]);
    expect(result[0].risk).toBe("high");
    expect(result[1].risk).toBe("low");
  });

  it("assigns very_high risk when impact score exceeds 10", () => {
    const highForecast: DailyForecast[] = [
      {
        date: "2026-03-12",
        indices: [],
        species: [
          { name: "Oak", slug: "oak", category: "tree", indexValue: 5, risk: "very_high", inSeason: true },
          { name: "Birch", slug: "birch", category: "tree", indexValue: 4, risk: "very_high", inSeason: true },
          { name: "Ragweed", slug: "ragweed", category: "weed", indexValue: 3, risk: "high", inSeason: true },
        ],
      },
    ];
    const result = filterForecastByAllergens(highForecast, ["oak", "birch", "ragweed"]);
    expect(result[0].impactScore).toBe(12);
    expect(result[0].risk).toBe("very_high");
  });

  it("assigns moderate risk for impact scores between 2 and 5", () => {
    const modForecast: DailyForecast[] = [
      {
        date: "2026-03-12",
        indices: [],
        species: [
          { name: "Oak", slug: "oak", category: "tree", indexValue: 3, risk: "high", inSeason: true },
        ],
      },
    ];
    const result = filterForecastByAllergens(modForecast, ["oak"]);
    expect(result[0].impactScore).toBe(3);
    expect(result[0].risk).toBe("moderate");
  });

  it("sets worstAllergen to null when no matching species", () => {
    const result = filterForecastByAllergens(mockForecast, ["mugwort"]);
    expect(result[0].worstAllergen).toBeNull();
    expect(result[0].impactScore).toBe(0);
  });
});

describe("calculateDayImpact", () => {
  it("sums UPI values for selected allergens", () => {
    const impact = calculateDayImpact(mockForecast[0], ["oak", "ragweed"]);
    expect(impact).toBe(5);
  });

  it("returns 0 when no matching species", () => {
    const impact = calculateDayImpact(mockForecast[0], ["mugwort"]);
    expect(impact).toBe(0);
  });

  it("handles a single allergen", () => {
    const impact = calculateDayImpact(mockForecast[0], ["birch"]);
    expect(impact).toBe(2);
  });
});

describe("findWorstDay", () => {
  it("returns the index of the day with highest impact", () => {
    const days: PersonalizedDay[] = [
      { date: "2026-03-12", relevantSpecies: [], impactScore: 2, worstAllergen: null, risk: "low" },
      { date: "2026-03-13", relevantSpecies: [], impactScore: 8, worstAllergen: null, risk: "high" },
      { date: "2026-03-14", relevantSpecies: [], impactScore: 5, worstAllergen: null, risk: "moderate" },
    ];
    expect(findWorstDay(days)).toBe(1);
  });

  it("returns 0 for an empty array", () => {
    expect(findWorstDay([])).toBe(0);
  });

  it("returns first occurrence when tied", () => {
    const days: PersonalizedDay[] = [
      { date: "2026-03-12", relevantSpecies: [], impactScore: 5, worstAllergen: null, risk: "moderate" },
      { date: "2026-03-13", relevantSpecies: [], impactScore: 5, worstAllergen: null, risk: "moderate" },
    ];
    expect(findWorstDay(days)).toBe(0);
  });
});

describe("getAllergenTips", () => {
  it("returns first tip from each selected species", () => {
    const tips = getAllergenTips(["oak", "ragweed"]);
    expect(tips).toHaveLength(2);
    expect(tips[0]).toContain("Oak season peaks");
    expect(tips[1]).toContain("Ragweed season");
  });

  it("returns empty array for unknown slugs", () => {
    const tips = getAllergenTips(["nonexistent"]);
    expect(tips).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(getAllergenTips([])).toEqual([]);
  });
});
