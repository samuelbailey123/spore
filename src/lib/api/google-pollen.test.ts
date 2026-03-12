import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import type { fetchGooglePollen as FetchType } from "./google-pollen";

function makeFetchResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

const VALID_GOOGLE_RESPONSE = {
  regionCode: "US",
  dailyInfo: [
    {
      date: { year: 2026, month: 3, day: 11 },
      pollenTypeInfo: [
        {
          code: "TREE",
          displayName: "Tree",
          indexInfo: { code: "UPI", displayName: "UPI", value: 3, category: "High", indexDescription: "" },
          healthRecommendations: ["Limit outdoor exposure.", "Take antihistamines."],
          inSeason: true,
        },
        {
          code: "GRASS",
          displayName: "Grass",
          indexInfo: { code: "UPI", displayName: "UPI", value: 1, category: "Low", indexDescription: "" },
          healthRecommendations: [],
          inSeason: true,
        },
        {
          code: "WEED",
          displayName: "Weed",
          indexInfo: { code: "UPI", displayName: "UPI", value: 0, category: "None", indexDescription: "" },
          healthRecommendations: [],
          inSeason: false,
        },
        {
          code: "UNKNOWN",
          displayName: "Unknown",
          indexInfo: { code: "UPI", displayName: "UPI", value: 2, category: "Moderate", indexDescription: "" },
          inSeason: true,
        },
      ],
      plantInfo: [
        {
          code: "OAK",
          displayName: "Oak",
          inSeason: true,
          indexInfo: { code: "UPI", displayName: "UPI", value: 4, category: "Very High", indexDescription: "" },
        },
        {
          code: "BIRCH",
          displayName: "Birch",
          inSeason: true,
          indexInfo: { code: "UPI", displayName: "UPI", value: 2, category: "Moderate", indexDescription: "" },
        },
        {
          code: "ELM",
          displayName: "Elm",
          inSeason: false,
          indexInfo: { code: "UPI", displayName: "UPI", value: 1, category: "Low", indexDescription: "" },
        },
        {
          code: "GRASS",
          displayName: "Bermuda Grass",
          inSeason: true,
          indexInfo: { code: "UPI", displayName: "UPI", value: 1, category: "Low", indexDescription: "" },
        },
        {
          code: "RAGWEED",
          displayName: "Ragweed",
          inSeason: true,
          indexInfo: { code: "UPI", displayName: "UPI", value: 1, category: "Low", indexDescription: "" },
        },
        {
          code: "MUGWORT",
          displayName: "Mugwort",
          inSeason: true,
          indexInfo: { code: "UPI", displayName: "UPI", value: 1, category: "Low", indexDescription: "" },
        },
      ],
    },
  ],
};

let fetchGooglePollen: typeof FetchType;

beforeAll(async () => {
  process.env.GOOGLE_POLLEN_API_KEY = "test-api-key";
  vi.resetModules();
  const mod = await import("./google-pollen");
  fetchGooglePollen = mod.fetchGooglePollen;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchGooglePollen", () => {
  describe("successful responses", () => {
    it("returns normalized data on 200", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result).not.toBeNull();
      expect(result!.dailyForecasts).toHaveLength(1);
    });

    it("formats date correctly from year/month/day components", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].date).toBe("2026-03-11");
    });

    it("normalizes tree, grass, and weed indices", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      const indices = result!.dailyForecasts[0].indices;
      expect(indices).toHaveLength(3);
      expect(indices.map((i) => i.category)).toEqual(
        expect.arrayContaining(["tree", "grass", "weed"])
      );
    });

    it("filters out unknown pollen type codes", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      const categories = result!.dailyForecasts[0].indices.map((i) => i.category);
      expect(categories).not.toContain("unknown");
      expect(categories).toHaveLength(3);
    });

    it("assigns correct risk levels via upiToRisk", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      const tree = result!.dailyForecasts[0].indices.find((i) => i.category === "tree")!;
      const grass = result!.dailyForecasts[0].indices.find((i) => i.category === "grass")!;
      const weed = result!.dailyForecasts[0].indices.find((i) => i.category === "weed")!;
      expect(tree.risk).toBe("high");
      expect(grass.risk).toBe("low");
      expect(weed.risk).toBe("none");
    });

    it("assigns correct colors for each category", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      const indices = result!.dailyForecasts[0].indices;
      expect(indices.find((i) => i.category === "tree")!.color).toBe("#22c55e");
      expect(indices.find((i) => i.category === "grass")!.color).toBe("#3b82f6");
      expect(indices.find((i) => i.category === "weed")!.color).toBe("#a855f7");
    });

    it("sets inSeason from pollenTypeInfo", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].indices.find((i) => i.category === "tree")!.inSeason).toBe(true);
      expect(result!.dailyForecasts[0].indices.find((i) => i.category === "weed")!.inSeason).toBe(false);
    });

    it("only includes in-season plants in species list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      const names = result!.dailyForecasts[0].species.map((s) => s.name);
      expect(names).not.toContain("Elm");
      expect(names).toContain("Oak");
    });

    it("categorises grass and weed plant codes correctly", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      const species = result!.dailyForecasts[0].species;
      expect(species.find((s) => s.name === "Bermuda Grass")!.category).toBe("grass");
      expect(species.find((s) => s.name === "Ragweed")!.category).toBe("weed");
      expect(species.find((s) => s.name === "Mugwort")!.category).toBe("weed");
    });

    it("slugifies plant display names", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].species.find((s) => s.name === "Bermuda Grass")!.slug).toBe("bermuda-grass");
    });

    it("collects health recommendations from all pollen types", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(VALID_GOOGLE_RESPONSE));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].healthRecommendations).toContain("Limit outdoor exposure.");
      expect(result!.dailyForecasts[0].healthRecommendations).toContain("Take antihistamines.");
    });

    it("uses zero as default when indexInfo is absent", async () => {
      const response = {
        regionCode: "US",
        dailyInfo: [{
          date: { year: 2026, month: 3, day: 11 },
          pollenTypeInfo: [{ code: "TREE", displayName: "Tree", inSeason: false }],
          plantInfo: [{ code: "OAK", displayName: "Oak", inSeason: true }],
        }],
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].indices[0].value).toBe(0);
      expect(result!.dailyForecasts[0].species[0].indexValue).toBe(0);
    });

    it("handles missing pollenTypeInfo gracefully", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({
        regionCode: "US", dailyInfo: [{ date: { year: 2026, month: 1, day: 5 }, plantInfo: [] }],
      }));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].indices).toEqual([]);
    });

    it("handles missing plantInfo gracefully", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({
        regionCode: "US", dailyInfo: [{ date: { year: 2026, month: 1, day: 5 }, pollenTypeInfo: [] }],
      }));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].species).toEqual([]);
    });

    it("handles empty dailyInfo array", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ regionCode: "US", dailyInfo: [] }));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts).toEqual([]);
    });

    it("handles missing dailyInfo key", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ regionCode: "US" }));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts).toEqual([]);
    });

    it("pads single-digit month and day to two digits", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({
        regionCode: "US", dailyInfo: [{ date: { year: 2026, month: 1, day: 5 }, pollenTypeInfo: [], plantInfo: [] }],
      }));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].date).toBe("2026-01-05");
    });

    it("caps days parameter at 5", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ regionCode: "US", dailyInfo: [] }));
      await fetchGooglePollen(29.76, -95.37, 10);
      expect(fetchSpy.mock.calls[0][0] as string).toContain("days=5");
    });

    it("passes lat, lng, and days in the request URL", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ regionCode: "US", dailyInfo: [] }));
      await fetchGooglePollen(29.76, -95.37, 3);
      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("location.latitude=29.76");
      expect(url).toContain("location.longitude=-95.37");
      expect(url).toContain("days=3");
    });

    it("passes an AbortSignal to fetch", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ regionCode: "US", dailyInfo: [] }));
      await fetchGooglePollen(29.76, -95.37);
      expect((fetchSpy.mock.calls[0][1] as RequestInit).signal).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("returns null on non-200 status", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(null, false, 403));
      expect(await fetchGooglePollen(29.76, -95.37)).toBeNull();
    });

    it("returns null when fetch throws a network error", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));
      expect(await fetchGooglePollen(29.76, -95.37)).toBeNull();
    });

    it("returns null when fetch is aborted", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));
      expect(await fetchGooglePollen(29.76, -95.37)).toBeNull();
    });

    it("returns null when response.json() throws", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new SyntaxError("Unexpected token"); },
      } as unknown as Response);
      expect(await fetchGooglePollen(29.76, -95.37)).toBeNull();
    });
  });

  describe("fallback branches", () => {
    it("defaults inSeason to false on pollenTypeInfo when inSeason is undefined", async () => {
      const response = {
        regionCode: "US",
        dailyInfo: [{
          date: { year: 2026, month: 3, day: 11 },
          pollenTypeInfo: [{
            code: "TREE",
            displayName: "Tree",
            indexInfo: { code: "UPI", displayName: "UPI", value: 2, category: "Moderate", indexDescription: "" },
            healthRecommendations: [],
          }],
          plantInfo: [],
        }],
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].indices.find((i) => i.category === "tree")!.inSeason).toBe(false);
    });

    it("defaults inSeason to false on plantInfo when inSeason is undefined", async () => {
      const response = {
        regionCode: "US",
        dailyInfo: [{
          date: { year: 2026, month: 3, day: 11 },
          pollenTypeInfo: [],
          plantInfo: [{
            code: "OAK",
            displayName: "Oak",
            indexInfo: { code: "UPI", displayName: "UPI", value: 1, category: "Low", indexDescription: "" },
          }],
        }],
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
      const result = await fetchGooglePollen(29.76, -95.37);
      expect(result!.dailyForecasts[0].species).toHaveLength(0);
    });
  });
});

describe("timeout behavior", () => {
  it("returns null when fetch exceeds timeout", async () => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockImplementation(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          if (init?.signal) {
            init.signal.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }
        })
    );
    const promise = fetchGooglePollen(29.76, -95.37);
    await vi.advanceTimersByTimeAsync(11_000);
    const result = await promise;
    expect(result).toBeNull();
    vi.useRealTimers();
  });
});

// No-API-key test needs a separate module load
describe("fetchGooglePollen without API key", () => {
  afterEach(() => {
    process.env.GOOGLE_POLLEN_API_KEY = "test-api-key";
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns null without calling fetch", async () => {
    delete process.env.GOOGLE_POLLEN_API_KEY;
    vi.resetModules();
    const mod = await import("./google-pollen");
    const fetchSpy = vi.spyOn(global, "fetch");
    const result = await mod.fetchGooglePollen(29.76, -95.37);
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
