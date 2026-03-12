import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { cacheClear } from "@/lib/api/cache";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/api/google-pollen", () => ({
  fetchGooglePollen: vi.fn(),
}));

vi.mock("@/lib/api/ambee-pollen", () => ({
  fetchAmbeeForecast: vi.fn(),
}));

vi.mock("@/lib/pollen/merge", () => ({
  mergeForecastData: vi.fn(),
}));

import { fetchGooglePollen } from "@/lib/api/google-pollen";
import { fetchAmbeeForecast } from "@/lib/api/ambee-pollen";
import { mergeForecastData } from "@/lib/pollen/merge";

const mockFetchGooglePollen = vi.mocked(fetchGooglePollen);
const mockFetchAmbeeForecast = vi.mocked(fetchAmbeeForecast);
const mockMergeForecastData = vi.mocked(mergeForecastData);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_FORECAST: import("@/types/pollen").DailyForecast[] = [
  {
    date: "2026-03-11",
    indices: [
      { category: "tree", displayName: "Tree", value: 3, risk: "high", inSeason: true, color: "#22c55e" },
    ],
    species: [],
  },
  {
    date: "2026-03-12",
    indices: [
      { category: "tree", displayName: "Tree", value: 2, risk: "moderate", inSeason: true, color: "#22c55e" },
    ],
    species: [],
  },
];

const MOCK_GOOGLE = {
  dailyForecasts: MOCK_FORECAST.map((d) => ({
    ...d,
    healthRecommendations: [],
  })),
};

const MOCK_AMBEE_FORECAST = [
  {
    treePollen: 450,
    grassPollen: 12,
    weedPollen: 0,
    treeRisk: "high" as const,
    grassRisk: "moderate" as const,
    weedRisk: "none" as const,
    species: [],
    timestamp: "2026-03-11T10:00:00Z",
  },
];

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/pollen/forecast");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/pollen/forecast", () => {
  beforeEach(() => {
    cacheClear();
    mockFetchGooglePollen.mockReset();
    mockFetchAmbeeForecast.mockReset();
    mockMergeForecastData.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---- Parameter validation ------------------------------------------------

  describe("parameter validation", () => {
    it("returns 400 when lat is missing", async () => {
      const req = makeRequest({ lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Invalid coordinates");
      expect(body.data).toBeNull();
    });

    it("returns 400 when lng is missing", async () => {
      const req = makeRequest({ lat: "29.76" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lat exceeds 90", async () => {
      const req = makeRequest({ lat: "91", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lat is below -90", async () => {
      const req = makeRequest({ lat: "-91", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lng exceeds 180", async () => {
      const req = makeRequest({ lat: "29.76", lng: "181" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lng is below -180", async () => {
      const req = makeRequest({ lat: "29.76", lng: "-181" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lat is non-numeric", async () => {
      const req = makeRequest({ lat: "abc", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when no parameters provided", async () => {
      const req = makeRequest();
      const res = await GET(req);

      expect(res.status).toBe(400);
    });
  });

  // ---- Successful responses ------------------------------------------------

  describe("successful responses", () => {
    it("returns 200 with forecast when both APIs succeed", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeForecast.mockResolvedValueOnce(MOCK_AMBEE_FORECAST);
      mockMergeForecastData.mockReturnValueOnce(MOCK_FORECAST);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual(MOCK_FORECAST);
      expect(body.error).toBeNull();
      expect(body.source).toBe("merged");
    });

    it("returns 200 when only Google succeeds", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeForecast.mockResolvedValueOnce(null);
      mockMergeForecastData.mockReturnValueOnce(MOCK_FORECAST);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockMergeForecastData).toHaveBeenCalledWith(MOCK_GOOGLE, null);
    });

    it("returns 200 when only Ambee succeeds", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(null);
      mockFetchAmbeeForecast.mockResolvedValueOnce(MOCK_AMBEE_FORECAST);
      mockMergeForecastData.mockReturnValueOnce(MOCK_FORECAST);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockMergeForecastData).toHaveBeenCalledWith(null, MOCK_AMBEE_FORECAST);
    });

    it("calls fetchGooglePollen with days=5", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeForecast.mockResolvedValueOnce(null);
      mockMergeForecastData.mockReturnValueOnce(MOCK_FORECAST);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      await GET(req);

      expect(mockFetchGooglePollen).toHaveBeenCalledWith(29.76, -95.37, 5);
    });

    it("passes parsed numeric coordinates to the API clients", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(null);
      mockFetchAmbeeForecast.mockResolvedValueOnce(MOCK_AMBEE_FORECAST);
      mockMergeForecastData.mockReturnValueOnce(MOCK_FORECAST);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      await GET(req);

      expect(mockFetchAmbeeForecast).toHaveBeenCalledWith(29.76, -95.37);
    });
  });

  // ---- Both APIs fail -------------------------------------------------------

  describe("when both APIs fail", () => {
    it("returns 502 when both return null", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(null);
      mockFetchAmbeeForecast.mockResolvedValueOnce(null);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toBe("Unable to fetch forecast data");
      expect(body.data).toBeNull();
      expect(body.source).toBe("merged");
    });

    it("returns 502 when both throw", async () => {
      mockFetchGooglePollen.mockRejectedValueOnce(new Error("timeout"));
      mockFetchAmbeeForecast.mockRejectedValueOnce(new Error("timeout"));

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(502);
    });
  });

  // ---- Cache behaviour ------------------------------------------------------

  describe("cache behaviour", () => {
    it("serves cached forecast on second request", async () => {
      mockFetchGooglePollen.mockResolvedValue(MOCK_GOOGLE);
      mockFetchAmbeeForecast.mockResolvedValue(MOCK_AMBEE_FORECAST);
      mockMergeForecastData.mockReturnValue(MOCK_FORECAST);

      await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));

      mockFetchGooglePollen.mockClear();
      mockFetchAmbeeForecast.mockClear();

      const res2 = await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
      const body = await res2.json();

      expect(body.source).toBe("cache");
      expect(mockFetchGooglePollen).not.toHaveBeenCalled();
      expect(mockFetchAmbeeForecast).not.toHaveBeenCalled();
    });

    it("cache miss for different coordinates triggers new API calls", async () => {
      mockFetchGooglePollen.mockResolvedValue(MOCK_GOOGLE);
      mockFetchAmbeeForecast.mockResolvedValue(MOCK_AMBEE_FORECAST);
      mockMergeForecastData.mockReturnValue(MOCK_FORECAST);

      await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
      mockFetchGooglePollen.mockClear();

      await GET(makeRequest({ lat: "51.50", lng: "-0.12" }));
      expect(mockFetchGooglePollen).toHaveBeenCalledTimes(1);
    });
  });
});
