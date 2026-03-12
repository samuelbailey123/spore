import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import type { fetchAmbeeCurrent as FetchCurrentType, fetchAmbeeHistory as FetchHistoryType, fetchAmbeeForecast as FetchForecastType } from "./ambee-pollen";

function makeFetchResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as unknown as Response;
}

const CURRENT_RESPONSE = {
  message: "success",
  data: [
    {
      Count: { grass_pollen: 10, tree_pollen: 50, weed_pollen: 0 },
      Risk: { grass_pollen: "Low", tree_pollen: "Moderate", weed_pollen: "Low" },
      Species: {
        Tree: { Oak: 30, Birch: 20, Pine: 0 },
        Grass: { Bermuda: 10 },
        Weed: { Ragweed: 0 },
      },
      updatedAt: "2026-03-11T12:00:00Z",
    },
  ],
};

let fetchAmbeeCurrent: typeof FetchCurrentType;
let fetchAmbeeHistory: typeof FetchHistoryType;
let fetchAmbeeForecast: typeof FetchForecastType;

beforeAll(async () => {
  process.env.AMBEE_API_KEY = "test-ambee-key";
  vi.resetModules();
  const mod = await import("./ambee-pollen");
  fetchAmbeeCurrent = mod.fetchAmbeeCurrent;
  fetchAmbeeHistory = mod.fetchAmbeeHistory;
  fetchAmbeeForecast = mod.fetchAmbeeForecast;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchAmbeeCurrent", () => {
  it("returns normalized data on successful response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result).not.toBeNull();
    expect(result!.treePollen).toBe(50);
    expect(result!.grassPollen).toBe(10);
    expect(result!.weedPollen).toBe(0);
  });

  it("maps risk levels correctly", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.treeRisk).toBe("moderate");
    expect(result!.grassRisk).toBe("low");
    expect(result!.weedRisk).toBe("low");
  });

  it("maps very high risk level", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 0, weed_pollen: 100 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Very High" },
        updatedAt: "2026-03-11T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.weedRisk).toBe("very_high");
  });

  it("maps high risk level", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 100, weed_pollen: 0 },
        Risk: { grass_pollen: "Low", tree_pollen: "High", weed_pollen: "Low" },
        updatedAt: "2026-03-11T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.treeRisk).toBe("high");
  });

  it("maps unknown risk to none", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 0, weed_pollen: 0 },
        Risk: { grass_pollen: "Unknown", tree_pollen: "Low", weed_pollen: "Low" },
        updatedAt: "2026-03-11T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.grassRisk).toBe("none");
  });

  it("includes species with count > 0 only", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    const names = result!.species.map((s) => s.name);
    expect(names).toContain("Oak");
    expect(names).toContain("Birch");
    expect(names).toContain("Bermuda");
    expect(names).not.toContain("Pine");
    expect(names).not.toContain("Ragweed");
  });

  it("assigns correct categories to species", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.species.find((s) => s.name === "Oak")!.category).toBe("tree");
    expect(result!.species.find((s) => s.name === "Bermuda")!.category).toBe("grass");
  });

  it("uses updatedAt as timestamp", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.timestamp).toBe("2026-03-11T12:00:00Z");
  });

  it("falls back to current time when updatedAt is absent", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 0, weed_pollen: 0 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(new Date(result!.timestamp).getFullYear()).toBe(new Date().getFullYear());
  });

  it("handles missing Species field", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 5, tree_pollen: 10, weed_pollen: 0 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
        updatedAt: "2026-03-11T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.species).toEqual([]);
  });

  it("excludes zero-count Grass and Weed species", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 10, weed_pollen: 0 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
        Species: {
          Tree: { Oak: 10 },
          Grass: { Bermuda: 0, Rye: 0 },
          Weed: { Ragweed: 0 },
        },
        updatedAt: "2026-03-11T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    const names = result!.species.map((s) => s.name);
    expect(names).toContain("Oak");
    expect(names).not.toContain("Bermuda");
    expect(names).not.toContain("Ragweed");
  });

  it("includes Weed species with non-zero count", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 0, weed_pollen: 5 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
        Species: {
          Grass: { Bermuda: 0 },
          Weed: { Ragweed: 5 },
        },
        updatedAt: "2026-03-11T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeCurrent(29.76, -95.37);
    expect(result!.species.find((s) => s.name === "Ragweed")!.category).toBe("weed");
  });

  it("constructs the correct URL", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    await fetchAmbeeCurrent(29.76, -95.37);
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("lat=29.76");
    expect(url).toContain("lng=-95.37");
  });

  it("sends the x-api-key header", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(CURRENT_RESPONSE));
    await fetchAmbeeCurrent(29.76, -95.37);
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("test-ambee-key");
  });

  it("returns null on non-200 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(null, false));
    expect(await fetchAmbeeCurrent(29.76, -95.37)).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("fail"));
    expect(await fetchAmbeeCurrent(29.76, -95.37)).toBeNull();
  });

  it("returns null when data array is empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success", data: [] }));
    expect(await fetchAmbeeCurrent(29.76, -95.37)).toBeNull();
  });
});

describe("fetchAmbeeHistory", () => {
  it("returns historical data points", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 5, tree_pollen: 20, weed_pollen: 3 },
        Risk: { grass_pollen: "Low", tree_pollen: "Moderate", weed_pollen: "Low" },
        updatedAt: "2026-03-10T12:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeHistory(29.76, -95.37, "2026-03-10", "2026-03-11");
    expect(result).toHaveLength(1);
    expect(result![0].treeCount).toBe(20);
    expect(result![0].date).toBe("2026-03-10T12:00:00Z");
  });

  it("falls back to createdAt when updatedAt is absent", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 0, weed_pollen: 0 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
        createdAt: "2026-03-09T08:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeHistory(29.76, -95.37, "2026-03-09", "2026-03-10");
    expect(result![0].date).toBe("2026-03-09T08:00:00Z");
  });

  it("falls back to current date when both updatedAt and createdAt are absent", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 0, tree_pollen: 0, weed_pollen: 0 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02");
    expect(new Date(result![0].date).getFullYear()).toBe(new Date().getFullYear());
  });

  it("returns empty array when data is empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success", data: [] }));
    expect(await fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02")).toEqual([]);
  });

  it("handles response where data.data is undefined", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success" }));
    const result = await fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02");
    expect(result).toEqual([]);
  });

  it("constructs the correct history URL", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success", data: [] }));
    await fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02");
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("history/pollen");
    expect(url).toContain("from=2026-03-01");
  });

  it("returns null on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({ ok: false, json: async () => null } as unknown as Response);
    expect(await fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02")).toBeNull();
  });

  it("returns null on error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("fail"));
    expect(await fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02")).toBeNull();
  });
});

describe("fetchAmbeeForecast", () => {
  it("returns normalized entries", async () => {
    const response = {
      message: "success",
      data: [{
        Count: { grass_pollen: 5, tree_pollen: 10, weed_pollen: 2 },
        Risk: { grass_pollen: "Low", tree_pollen: "Low", weed_pollen: "Low" },
        updatedAt: "2026-03-12T00:00:00Z",
      }],
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse(response));
    const result = await fetchAmbeeForecast(29.76, -95.37);
    expect(result).toHaveLength(1);
    expect(result![0].treePollen).toBe(10);
  });

  it("returns empty array when data is empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success", data: [] }));
    expect(await fetchAmbeeForecast(29.76, -95.37)).toEqual([]);
  });

  it("handles response where data.data is undefined", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success" }));
    const result = await fetchAmbeeForecast(29.76, -95.37);
    expect(result).toEqual([]);
  });

  it("constructs the forecast URL", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(makeFetchResponse({ message: "success", data: [] }));
    await fetchAmbeeForecast(29.76, -95.37);
    expect(fetchSpy.mock.calls[0][0] as string).toContain("forecast/v2/pollen/120hr");
  });

  it("returns null on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({ ok: false, json: async () => null } as unknown as Response);
    expect(await fetchAmbeeForecast(29.76, -95.37)).toBeNull();
  });

  it("returns null on error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("fail"));
    expect(await fetchAmbeeForecast(29.76, -95.37)).toBeNull();
  });
});

describe("timeout behavior", () => {
  function mockFetchWithAbort(): vi.Mock {
    return vi.spyOn(global, "fetch").mockImplementation(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          if (init?.signal) {
            init.signal.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }
        })
    ) as unknown as vi.Mock;
  }

  it("fetchAmbeeCurrent returns null when fetch exceeds timeout", async () => {
    vi.useFakeTimers();
    mockFetchWithAbort();
    const promise = fetchAmbeeCurrent(29.76, -95.37);
    await vi.advanceTimersByTimeAsync(11_000);
    const result = await promise;
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it("fetchAmbeeHistory returns null when fetch exceeds timeout", async () => {
    vi.useFakeTimers();
    mockFetchWithAbort();
    const promise = fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02");
    await vi.advanceTimersByTimeAsync(11_000);
    const result = await promise;
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it("fetchAmbeeForecast returns null when fetch exceeds timeout", async () => {
    vi.useFakeTimers();
    mockFetchWithAbort();
    const promise = fetchAmbeeForecast(29.76, -95.37);
    await vi.advanceTimersByTimeAsync(11_000);
    const result = await promise;
    expect(result).toBeNull();
    vi.useRealTimers();
  });
});

// No-API-key tests need a separate module load without the key
describe("no API key behavior", () => {
  beforeEach(() => {
    delete process.env.AMBEE_API_KEY;
  });

  afterEach(() => {
    process.env.AMBEE_API_KEY = "test-ambee-key";
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function loadModuleWithoutKey() {
    return await import("./ambee-pollen");
  }

  it("fetchAmbeeCurrent returns null when API key is absent", async () => {
    const mod = await loadModuleWithoutKey();
    expect(await mod.fetchAmbeeCurrent(29.76, -95.37)).toBeNull();
  });

  it("fetchAmbeeHistory returns null when API key is absent", async () => {
    const mod = await loadModuleWithoutKey();
    expect(await mod.fetchAmbeeHistory(29.76, -95.37, "2026-03-01", "2026-03-02")).toBeNull();
  });

  it("fetchAmbeeForecast returns null when API key is absent", async () => {
    const mod = await loadModuleWithoutKey();
    expect(await mod.fetchAmbeeForecast(29.76, -95.37)).toBeNull();
  });
});
