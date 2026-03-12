import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockList = vi.fn().mockResolvedValue({
  data: {
    data: [
      { id: "c1", email: "test@example.com", unsubscribed: false },
    ],
  },
});
const mockUpdate = vi.fn().mockResolvedValue({ data: {} });

vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    contacts: { list: mockList, update: mockUpdate },
  }),
}));

const originalEnv = { ...process.env };

import { POST } from "./route";

describe("POST /api/unsubscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_AUDIENCE_ID = "audience-123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function makeRequest(body: unknown) {
    return new Request("http://localhost/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("marks a known contact as unsubscribed", async () => {
    const res = await POST(makeRequest({ email: "test@example.com" }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      audienceId: "audience-123",
      id: "c1",
      unsubscribed: true,
    });
  });

  it("succeeds silently for unknown email", async () => {
    const res = await POST(makeRequest({ email: "unknown@example.com" }));

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ email: "not-valid" }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when RESEND_AUDIENCE_ID is not set", async () => {
    delete process.env.RESEND_AUDIENCE_ID;

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(503);
  });

  it("returns 500 when Resend throws", async () => {
    mockList.mockRejectedValueOnce(new Error("API down"));

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("API down");
  });

  it("returns 500 with generic message for non-Error exception", async () => {
    mockList.mockRejectedValueOnce("string error");

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Unsubscribe failed");
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("handles null contacts list gracefully", async () => {
    mockList.mockResolvedValueOnce({ data: { data: null } });

    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
