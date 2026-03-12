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
  fetchAmbeeCurrent: vi.fn(),
}));

vi.mock("@/lib/pollen/merge", () => ({
  mergeCurrentData: vi.fn(),
}));

import { fetchGooglePollen } from "@/lib/api/google-pollen";
import { fetchAmbeeCurrent } from "@/lib/api/ambee-pollen";
import { mergeCurrentData } from "@/lib/pollen/merge";

const mockFetchGooglePollen = vi.mocked(fetchGooglePollen);
const mockFetchAmbeeCurrent = vi.mocked(fetchAmbeeCurrent);
const mockMergeCurrentData = vi.mocked(mergeCurrentData);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_SNAPSHOT = {
  location: { lat: 29.76, lng: -95.37, name: "Your Location" },
  timestamp: "2026-03-11T10:00:00Z",
  indices: [
    { category: "tree", displayName: "Tree", value: 3, risk: "high", inSeason: true, color: "#22c55e" },
  ],
  species: [],
  healthRecommendations: [],
};

const MOCK_GOOGLE = {
  dailyForecasts: [
    {
      date: "2026-03-11",
      indices: MOCK_SNAPSHOT.indices,
      species: [],
      healthRecommendations: [],
    },
  ],
};

const MOCK_AMBEE = {
  treePollen: 450,
  grassPollen: 12,
  weedPollen: 0,
  treeRisk: "high" as const,
  grassRisk: "moderate" as const,
  weedRisk: "none" as const,
  species: [],
  timestamp: "2026-03-11T10:00:00Z",
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/pollen/current");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/pollen/current", () => {
  beforeEach(() => {
    cacheClear();
    mockFetchGooglePollen.mockReset();
    mockFetchAmbeeCurrent.mockReset();
    mockMergeCurrentData.mockReset();
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
      const body = await res.json();
      expect(body.error).toBe("Invalid coordinates");
    });

    it("returns 400 when lat is out of range (> 90)", async () => {
      const req = makeRequest({ lat: "91", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lat is out of range (< -90)", async () => {
      const req = makeRequest({ lat: "-91", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lng is out of range (> 180)", async () => {
      const req = makeRequest({ lat: "29.76", lng: "181" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lng is out of range (< -180)", async () => {
      const req = makeRequest({ lat: "29.76", lng: "-181" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lat is not a number", async () => {
      const req = makeRequest({ lat: "not-a-number", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when no parameters are provided", async () => {
      const req = makeRequest();
      const res = await GET(req);

      expect(res.status).toBe(400);
    });
  });

  // ---- Successful responses ------------------------------------------------

  describe("successful responses", () => {
    it("returns 200 with snapshot when both APIs succeed", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValueOnce(MOCK_SNAPSHOT);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual(MOCK_SNAPSHOT);
      expect(body.error).toBeNull();
      expect(body.source).toBe("merged");
    });

    it("returns 200 when only Google succeeds", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(null);
      mockMergeCurrentData.mockReturnValueOnce(MOCK_SNAPSHOT);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockMergeCurrentData).toHaveBeenCalledWith(
        MOCK_GOOGLE,
        null,
        expect.objectContaining({ lat: 29.76, lng: -95.37 })
      );
    });

    it("returns 200 when only Ambee succeeds", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(null);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValueOnce(MOCK_SNAPSHOT);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockMergeCurrentData).toHaveBeenCalledWith(
        null,
        MOCK_AMBEE,
        expect.objectContaining({ lat: 29.76, lng: -95.37 })
      );
    });

    it("uses the name parameter in the location passed to mergeCurrentData", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValueOnce(MOCK_SNAPSHOT);

      const req = makeRequest({ lat: "29.76", lng: "-95.37", name: "Houston, TX" });
      await GET(req);

      expect(mockMergeCurrentData).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ name: "Houston, TX" })
      );
    });

    it("defaults name to 'Your Location' when not provided", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValueOnce(MOCK_SNAPSHOT);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      await GET(req);

      expect(mockMergeCurrentData).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ name: "Your Location" })
      );
    });

    it("calls fetchGooglePollen with days=1", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValueOnce(MOCK_SNAPSHOT);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      await GET(req);

      expect(mockFetchGooglePollen).toHaveBeenCalledWith(29.76, -95.37, 1);
    });
  });

  // ---- Both APIs fail -------------------------------------------------------

  describe("when both APIs fail", () => {
    it("returns 502 when both APIs return null", async () => {
      mockFetchGooglePollen.mockResolvedValueOnce(null);
      mockFetchAmbeeCurrent.mockResolvedValueOnce(null);

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toBe("Unable to fetch pollen data from any source");
      expect(body.data).toBeNull();
    });

    it("returns 502 when both APIs throw", async () => {
      mockFetchGooglePollen.mockRejectedValueOnce(new Error("google down"));
      mockFetchAmbeeCurrent.mockRejectedValueOnce(new Error("ambee down"));

      const req = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res = await GET(req);

      expect(res.status).toBe(502);
    });
  });

  // ---- Cache behaviour ------------------------------------------------------

  describe("cache behaviour", () => {
    it("returns cached data on second request without calling APIs", async () => {
      mockFetchGooglePollen.mockResolvedValue(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValue(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValue(MOCK_SNAPSHOT);

      const req1 = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res1 = await GET(req1);
      expect(res1.status).toBe(200);

      // Reset call counts but keep return values — a second call should not
      // reach the API clients at all.
      mockFetchGooglePollen.mockClear();
      mockFetchAmbeeCurrent.mockClear();

      const req2 = makeRequest({ lat: "29.76", lng: "-95.37" });
      const res2 = await GET(req2);

      expect(res2.status).toBe(200);
      const body = await res2.json();
      expect(body.source).toBe("cache");
      expect(mockFetchGooglePollen).not.toHaveBeenCalled();
      expect(mockFetchAmbeeCurrent).not.toHaveBeenCalled();
    });

    it("uses different cache keys for different coordinates", async () => {
      mockFetchGooglePollen.mockResolvedValue(MOCK_GOOGLE);
      mockFetchAmbeeCurrent.mockResolvedValue(MOCK_AMBEE);
      mockMergeCurrentData.mockReturnValue(MOCK_SNAPSHOT);

      await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
      mockFetchGooglePollen.mockClear();
      mockFetchAmbeeCurrent.mockClear();

      await GET(makeRequest({ lat: "40.71", lng: "-74.00" }));

      // Different coordinates = cache miss, APIs should be called again
      expect(mockFetchGooglePollen).toHaveBeenCalledTimes(1);
    });
  });
});
