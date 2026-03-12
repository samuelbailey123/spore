import { describe, it, expect, vi } from "vitest";

vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    constructor(public element: unknown, public options: unknown) {}
  },
}));

describe("opengraph-image", () => {
  it("exports correct metadata", async () => {
    const mod = await import("./opengraph-image");
    expect(mod.alt).toBe("Spore — Pollen Intelligence Dashboard");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
    expect(mod.runtime).toBe("edge");
  });

  it("returns an ImageResponse", async () => {
    const mod = await import("./opengraph-image");
    const result = await mod.default();
    expect(result).toBeDefined();
  });
});
