import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRequest(query: string): Request {
  return new Request(`http://localhost/api/geocode?q=${encodeURIComponent(query)}`);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/geocode", () => {
  it("returns 400 when query is missing", async () => {
    const req = new Request("http://localhost/api/geocode");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Search query is required");
    expect(json.data).toEqual([]);
  });

  it("returns 400 when query is empty", async () => {
    const req = new Request("http://localhost/api/geocode?q=");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns geocoded results for a valid query", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "29.7604",
          lon: "-95.3698",
          display_name: "Houston, Harris County, Texas, USA",
          type: "city",
          address: {
            city: "Houston",
            state: "Texas",
            country: "USA",
          },
        },
      ],
    });

    const res = await GET(makeRequest("Houston, TX"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toEqual({
      lat: 29.7604,
      lng: -95.3698,
      name: "Houston, Texas",
      fullAddress: "Houston, Harris County, Texas, USA",
    });
  });

  it("formats name with town when city is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "30.0",
          lon: "-90.0",
          display_name: "Smalltown, County, State, USA",
          type: "town",
          address: {
            town: "Smalltown",
            state: "Louisiana",
            country: "USA",
          },
        },
      ],
    });

    const res = await GET(makeRequest("Smalltown"));
    const json = await res.json();
    expect(json.data[0].name).toBe("Smalltown, Louisiana");
  });

  it("formats name with village when city and town are missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "30.0",
          lon: "-90.0",
          display_name: "Tiny Village, County, State, USA",
          type: "village",
          address: {
            village: "Tiny Village",
            state: "Texas",
          },
        },
      ],
    });

    const res = await GET(makeRequest("Tiny Village"));
    const json = await res.json();
    expect(json.data[0].name).toBe("Tiny Village, Texas");
  });

  it("uses postcode when no city/town/village", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "29.7",
          lon: "-95.3",
          display_name: "77001, Houston, Texas, USA",
          type: "postcode",
          address: {
            postcode: "77001",
            state: "Texas",
          },
        },
      ],
    });

    const res = await GET(makeRequest("77001"));
    const json = await res.json();
    expect(json.data[0].name).toBe("77001, Texas");
  });

  it("falls back to display_name when no address details", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "29.7",
          lon: "-95.3",
          display_name: "Some Place, Somewhere Far, Long Country Name",
          type: "place",
        },
      ],
    });

    const res = await GET(makeRequest("Some Place"));
    const json = await res.json();
    expect(json.data[0].name).toBe("Some Place, Somewhere Far");
  });

  it("falls back to display_name when address has no useful fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "29.7",
          lon: "-95.3",
          display_name: "Unknown Area, Region, Country",
          type: "place",
          address: { country: "Country" },
        },
      ],
    });

    const res = await GET(makeRequest("Unknown Area"));
    const json = await res.json();
    expect(json.data[0].name).toBe("Unknown Area, Region");
  });

  it("returns 502 when Nominatim is unavailable", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const res = await GET(makeRequest("Houston"));
    expect(res.status).toBe(502);

    const json = await res.json();
    expect(json.error).toBe("Geocoding service unavailable");
    expect(json.data).toEqual([]);
  });

  it("returns empty results when Nominatim returns nothing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const res = await GET(makeRequest("xyznonexistent123"));
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.error).toBeNull();
  });

  it("sends correct parameters to Nominatim", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await GET(makeRequest("Houston TX"));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("nominatim.openstreetmap.org/search");
    expect(calledUrl).toContain("q=Houston+TX");
    expect(calledUrl).toContain("format=json");
    expect(calledUrl).toContain("limit=5");
    expect(calledUrl).toContain("addressdetails=1");
  });

  it("sends correct headers to Nominatim", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await GET(makeRequest("test"));

    const options = mockFetch.mock.calls[0][1] as RequestInit;
    expect(options.headers).toEqual(
      expect.objectContaining({
        "User-Agent": "Spore/1.0 (pollen dashboard)",
        Accept: "application/json",
      })
    );
  });

  it("handles multiple results from Nominatim", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "29.7604",
          lon: "-95.3698",
          display_name: "Houston, Texas, USA",
          type: "city",
          address: { city: "Houston", state: "Texas" },
        },
        {
          lat: "37.7749",
          lon: "-122.4194",
          display_name: "San Francisco, California, USA",
          type: "city",
          address: { city: "San Francisco", state: "California" },
        },
      ],
    });

    const res = await GET(makeRequest("city"));
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.data[0].name).toBe("Houston, Texas");
    expect(json.data[1].name).toBe("San Francisco, California");
  });
});
