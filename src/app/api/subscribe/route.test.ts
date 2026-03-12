import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn().mockResolvedValue({ data: { id: "contact-1" } });

vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    contacts: { create: mockCreate },
  }),
}));

const originalEnv = { ...process.env };

import { POST } from "./route";

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_AUDIENCE_ID = "audience-123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function makeRequest(body: unknown) {
    return new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("creates a contact with valid input", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("stores allergen data in firstName field", async () => {
    await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak", "birch"],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    const call = mockCreate.mock.calls[0][0];
    const parsed = JSON.parse(call.firstName);
    expect(parsed.allergens).toEqual(["oak", "birch"]);
    expect(parsed.lat).toBe(29.76);
    expect(parsed.lng).toBe(-95.37);
    expect(parsed.locationName).toBe("Houston");
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(
      makeRequest({
        email: "not-an-email",
        allergens: ["oak"],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for empty allergens", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: [],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid coordinates", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 999,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 503 when RESEND_AUDIENCE_ID is not set", async () => {
    delete process.env.RESEND_AUDIENCE_ID;

    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(503);
  });

  it("returns 500 when Resend throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Resend API error"));

    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Resend API error");
  });

  it("returns 500 with generic message for non-Error exception", async () => {
    mockCreate.mockRejectedValueOnce("string error");

    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 29.76,
        lng: -95.37,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Subscription failed");
  });

  it("returns 400 for missing locationName", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 29.76,
        lng: -95.37,
        locationName: "",
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid longitude", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        allergens: ["oak"],
        lat: 29.76,
        lng: -999,
        locationName: "Houston",
      })
    );

    expect(res.status).toBe(400);
  });
});
