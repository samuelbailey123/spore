import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/geocode/reverse");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/geocode/reverse", () => {
  it("returns 400 when lat is missing", async () => {
    const res = await GET(makeRequest({ lng: "-95.37" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Valid lat and lng are required");
    expect(json.name).toBeNull();
  });

  it("returns 400 when lng is missing", async () => {
    const res = await GET(makeRequest({ lat: "29.76" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when no parameters provided", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("returns 400 when lat is out of range", async () => {
    const res = await GET(makeRequest({ lat: "91", lng: "-95.37" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lng is out of range", async () => {
    const res = await GET(makeRequest({ lat: "29.76", lng: "-181" }));
    expect(res.status).toBe(400);
  });

  it("returns city and state for a valid location", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Houston, Harris County, Texas, USA",
        address: {
          city: "Houston",
          state: "Texas",
          country: "USA",
        },
      }),
    });

    const res = await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("Houston, Texas");
    expect(json.error).toBeNull();
  });

  it("uses town when city is unavailable", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Smalltown, State, Country",
        address: {
          town: "Smalltown",
          state: "Iowa",
        },
      }),
    });

    const res = await GET(makeRequest({ lat: "42.0", lng: "-93.0" }));
    const json = await res.json();
    expect(json.name).toBe("Smalltown, Iowa");
  });

  it("uses village when city and town are unavailable", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Tiny Village, State, Country",
        address: {
          village: "Tiny Village",
          state: "Vermont",
        },
      }),
    });

    const res = await GET(makeRequest({ lat: "44.0", lng: "-72.0" }));
    const json = await res.json();
    expect(json.name).toBe("Tiny Village, Vermont");
  });

  it("falls back to 'Your Location' when no address fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Somewhere",
        address: { country: "USA" },
      }),
    });

    const res = await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
    const json = await res.json();
    expect(json.name).toBe("Your Location");
  });

  it("falls back to 'Your Location' when no address object", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Somewhere",
      }),
    });

    const res = await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
    const json = await res.json();
    expect(json.name).toBe("Your Location");
  });

  it("returns 502 when Nominatim is unavailable", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const res = await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe("Reverse geocoding service unavailable");
    expect(json.name).toBeNull();
  });

  it("sends correct parameters to Nominatim", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Houston, TX",
        address: { city: "Houston", state: "Texas" },
      }),
    });

    await GET(makeRequest({ lat: "29.76", lng: "-95.37" }));

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("nominatim.openstreetmap.org/reverse");
    expect(calledUrl).toContain("lat=29.76");
    expect(calledUrl).toContain("lon=-95.37");
    expect(calledUrl).toContain("format=json");
    expect(calledUrl).toContain("addressdetails=1");
  });

  it("returns state only when city is present without state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Austin, TX",
        address: { city: "Austin" },
      }),
    });

    const res = await GET(makeRequest({ lat: "30.27", lng: "-97.74" }));
    const json = await res.json();
    expect(json.name).toBe("Austin");
  });
});
