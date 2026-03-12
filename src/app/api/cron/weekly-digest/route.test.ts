import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
const mockContactsList = vi.fn().mockResolvedValue({
  data: {
    data: [
      {
        id: "c1",
        email: "test@example.com",
        unsubscribed: false,
        firstName: JSON.stringify({
          allergens: ["oak"],
          lat: 29.76,
          lng: -95.37,
          locationName: "Houston, TX",
        }),
      },
    ],
  },
});

vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    contacts: { list: mockContactsList },
    emails: { send: mockSend },
  }),
}));

const mockFetchResponse = {
  ok: true,
  json: () =>
    Promise.resolve({
      data: [
        {
          date: "2026-03-15",
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
      ],
    }),
};

vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockFetchResponse));

const originalEnv = { ...process.env };

import { GET } from "./route";

describe("GET /api/cron/weekly-digest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    process.env.RESEND_AUDIENCE_ID = "audience-123";
    process.env.NEXT_PUBLIC_SITE_URL = "https://spore.example.com";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function makeRequest(token?: string) {
    return new Request("http://localhost/api/cron/weekly-digest", {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
  }

  it("returns 401 without auth", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong token", async () => {
    const res = await GET(makeRequest("wrong-token"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when RESEND_AUDIENCE_ID is not set", async () => {
    delete process.env.RESEND_AUDIENCE_ID;
    const res = await GET(makeRequest("test-secret"));
    expect(res.status).toBe(503);
  });

  it("sends emails to active subscribers", async () => {
    const res = await GET(makeRequest("test-secret"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.sent).toBe(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("sends from contact@decimamedia.com", async () => {
    await GET(makeRequest("test-secret"));

    const call = mockSend.mock.calls[0][0];
    expect(call.from).toBe("Spore <contact@decimamedia.com>");
  });

  it("includes location in subject", async () => {
    await GET(makeRequest("test-secret"));

    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toContain("Houston, TX");
  });

  it("skips contacts without allergen data", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          { id: "c1", email: "test@example.com", unsubscribed: false, firstName: "John" },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("skips unsubscribed contacts", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: true,
            firstName: JSON.stringify({ allergens: ["oak"], lat: 29.76, lng: -95.37, locationName: "Houston" }),
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("handles zero subscribers", async () => {
    mockContactsList.mockResolvedValueOnce({ data: { data: [] } });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
    expect(json.message).toBe("No active subscribers");
  });

  it("reports errors for individual contacts without failing the batch", async () => {
    mockSend.mockRejectedValueOnce(new Error("Send failed"));

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
    expect(json.errors).toHaveLength(1);
    expect(json.errors[0]).toContain("Send failed");
  });

  it("reports non-Error exceptions as Unknown error", async () => {
    mockSend.mockRejectedValueOnce("string error");

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.errors[0]).toContain("Unknown error");
  });

  it("returns 500 when contacts list throws", async () => {
    mockContactsList.mockRejectedValueOnce(new Error("API failure"));

    const res = await GET(makeRequest("test-secret"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("API failure");
  });

  it("returns 500 with generic message for non-Error exception", async () => {
    mockContactsList.mockRejectedValueOnce("not an Error");

    const res = await GET(makeRequest("test-secret"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Cron job failed");
  });

  it("skips contacts without location data", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: false,
            firstName: JSON.stringify({ allergens: ["oak"] }),
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("skips contacts when forecast fetch fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("returns total count alongside sent count", async () => {
    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.total).toBe(1);
  });

  it("returns 401 when CRON_SECRET is not set", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(makeRequest("any-token"));
    expect(res.status).toBe(401);
  });

  it("handles contacts with corrupt firstName JSON", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: false,
            firstName: "not-json{{{",
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("handles contacts with null firstName", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: false,
            firstName: null,
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("handles contacts with non-array allergens in firstName", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: false,
            firstName: JSON.stringify({ allergens: "not-an-array", lat: 29.76, lng: -95.37 }),
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("uses default locationName when not provided", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: false,
            firstName: JSON.stringify({ allergens: ["oak"], lat: 29.76, lng: -95.37 }),
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toContain("Your Location");
  });

  it("handles fetch throwing an error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });

  it("handles contactList with null data", async () => {
    mockContactsList.mockResolvedValueOnce({ data: null });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
    expect(json.message).toBe("No active subscribers");
  });

  it("uses fallback site URL when NEXT_PUBLIC_SITE_URL is not set", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const res = await GET(makeRequest("test-secret"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sent).toBe(1);
  });

  it("handles contacts with non-numeric lat/lng", async () => {
    mockContactsList.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "c1",
            email: "test@example.com",
            unsubscribed: false,
            firstName: JSON.stringify({ allergens: ["oak"], lat: "not-a-number", lng: -95.37 }),
          },
        ],
      },
    });

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();
    expect(json.sent).toBe(0);
  });
});
