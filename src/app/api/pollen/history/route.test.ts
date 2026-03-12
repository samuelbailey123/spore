import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { cacheClear } from "@/lib/api/cache";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/api/ambee-pollen", () => ({
  fetchAmbeeHistory: vi.fn(),
}));

import { fetchAmbeeHistory } from "@/lib/api/ambee-pollen";

const mockFetchAmbeeHistory = vi.mocked(fetchAmbeeHistory);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_HISTORY: import("@/types/pollen").HistoricalDataPoint[] = [
  {
    date: "2026-03-10T10:00:00Z",
    treeCount: 100,
    grassCount: 5,
    weedCount: 0,
    treeRisk: "low",
    grassRisk: "low",
    weedRisk: "none",
  },
  {
    date: "2026-03-11T10:00:00Z",
    treeCount: 250,
    grassCount: 12,
    weedCount: 3,
    treeRisk: "moderate",
    grassRisk: "moderate",
    weedRisk: "low",
  },
];

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/pollen/history");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

const VALID_PARAMS = {
  lat: "29.76",
  lng: "-95.37",
  from: "2026-03-10",
  to: "2026-03-11",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/pollen/history", () => {
  beforeEach(() => {
    cacheClear();
    mockFetchAmbeeHistory.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---- Parameter validation ------------------------------------------------

  describe("parameter validation", () => {
    it("returns 400 when lat is missing", async () => {
      const req = makeRequest({ lng: "-95.37", from: "2026-03-10", to: "2026-03-11" });
      const res = await GET(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.data).toBeNull();
      expect(body.source).toBe("ambee");
      expect(body.error).toContain("Required");
    });

    it("returns 400 when lng is missing", async () => {
      const req = makeRequest({ lat: "29.76", from: "2026-03-10", to: "2026-03-11" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when from is missing", async () => {
      const req = makeRequest({ lat: "29.76", lng: "-95.37", to: "2026-03-11" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when to is missing", async () => {
      const req = makeRequest({ lat: "29.76", lng: "-95.37", from: "2026-03-10" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when from has invalid date format", async () => {
      const req = makeRequest({ ...VALID_PARAMS, from: "10-03-2026" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when to has invalid date format", async () => {
      const req = makeRequest({ ...VALID_PARAMS, to: "March 11 2026" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lat is out of range", async () => {
      const req = makeRequest({ ...VALID_PARAMS, lat: "91" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when lng is out of range", async () => {
      const req = makeRequest({ ...VALID_PARAMS, lng: "-181" });
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 when no parameters are provided", async () => {
      const req = makeRequest();
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("accepts valid YYYY-MM-DD date format", async () => {
      mockFetchAmbeeHistory.mockResolvedValueOnce(MOCK_HISTORY);

      const req = makeRequest(VALID_PARAMS);
      const res = await GET(req);

      expect(res.status).toBe(200);
    });
  });

  // ---- Successful responses ------------------------------------------------

  describe("successful responses", () => {
    it("returns 200 with history data on success", async () => {
      mockFetchAmbeeHistory.mockResolvedValueOnce(MOCK_HISTORY);

      const req = makeRequest(VALID_PARAMS);
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual(MOCK_HISTORY);
      expect(body.error).toBeNull();
      expect(body.source).toBe("ambee");
    });

    it("passes parsed coordinates and date strings to fetchAmbeeHistory", async () => {
      mockFetchAmbeeHistory.mockResolvedValueOnce(MOCK_HISTORY);

      const req = makeRequest(VALID_PARAMS);
      await GET(req);

      expect(mockFetchAmbeeHistory).toHaveBeenCalledWith(
        29.76,
        -95.37,
        "2026-03-10",
        "2026-03-11"
      );
    });

    it("returns an empty array body when history is empty", async () => {
      mockFetchAmbeeHistory.mockResolvedValueOnce([]);

      const req = makeRequest(VALID_PARAMS);
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  // ---- API failure ---------------------------------------------------------

  describe("when Ambee API fails", () => {
    it("returns 502 when fetchAmbeeHistory returns null", async () => {
      mockFetchAmbeeHistory.mockResolvedValueOnce(null);

      const req = makeRequest(VALID_PARAMS);
      const res = await GET(req);

      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toBe("Unable to fetch historical data");
      expect(body.data).toBeNull();
      expect(body.source).toBe("ambee");
    });
  });

  // ---- Cache behaviour ------------------------------------------------------

  describe("cache behaviour", () => {
    it("serves cached history on second request", async () => {
      mockFetchAmbeeHistory.mockResolvedValue(MOCK_HISTORY);

      await GET(makeRequest(VALID_PARAMS));

      mockFetchAmbeeHistory.mockClear();

      const res2 = await GET(makeRequest(VALID_PARAMS));
      const body = await res2.json();

      expect(body.source).toBe("cache");
      expect(mockFetchAmbeeHistory).not.toHaveBeenCalled();
    });

    it("cache miss for different date range triggers new API call", async () => {
      mockFetchAmbeeHistory.mockResolvedValue(MOCK_HISTORY);

      await GET(makeRequest(VALID_PARAMS));
      mockFetchAmbeeHistory.mockClear();

      await GET(makeRequest({ ...VALID_PARAMS, from: "2026-03-08", to: "2026-03-09" }));
      expect(mockFetchAmbeeHistory).toHaveBeenCalledTimes(1);
    });

    it("cache miss for different coordinates triggers new API call", async () => {
      mockFetchAmbeeHistory.mockResolvedValue(MOCK_HISTORY);

      await GET(makeRequest(VALID_PARAMS));
      mockFetchAmbeeHistory.mockClear();

      await GET(makeRequest({ ...VALID_PARAMS, lat: "40.71", lng: "-74.00" }));
      expect(mockFetchAmbeeHistory).toHaveBeenCalledTimes(1);
    });
  });
});
