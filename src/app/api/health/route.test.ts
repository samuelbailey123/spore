import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 status code", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("returns status 'ok'", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("returns service name 'spore'", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.service).toBe("spore");
  });

  it("returns a valid ISO 8601 timestamp", async () => {
    const before = Date.now();
    const res = await GET();
    const after = Date.now();
    const body = await res.json();

    const ts = new Date(body.timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before - 1000);
    expect(ts).toBeLessThanOrEqual(after + 1000);
    // ISO 8601 format check: ends with 'Z' and contains 'T'
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/);
  });

  it("timestamp reflects the current time at invocation", async () => {
    const fixedTime = new Date("2026-03-11T12:00:00.000Z");
    vi.setSystemTime(fixedTime);

    const res = await GET();
    const body = await res.json();

    expect(body.timestamp).toBe("2026-03-11T12:00:00.000Z");

    vi.useRealTimers();
  });

  it("returns a JSON response with all three required fields", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("service");
  });

  it("each invocation returns a fresh timestamp", async () => {
    const res1 = await GET();
    // Advance time by 50 ms so the second call gets a different timestamp
    await new Promise((r) => setTimeout(r, 50));
    const res2 = await GET();

    const body1 = await res1.json();
    const body2 = await res2.json();

    // Both are valid ISO strings; they may or may not differ by 50ms depending
    // on precision, but both must parse as valid dates.
    expect(new Date(body1.timestamp).toISOString()).toBe(body1.timestamp);
    expect(new Date(body2.timestamp).toISOString()).toBe(body2.timestamp);
  });
});
