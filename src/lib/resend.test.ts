import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("resend", () => ({
  Resend: class MockResend {
    contacts = {};
    emails = {};
  },
}));

const originalEnv = { ...process.env };

describe("getResend", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const { getResend } = await import("./resend");
    expect(() => getResend()).toThrow("RESEND_API_KEY environment variable is not set");
  });

  it("returns a Resend instance when key is set", async () => {
    process.env.RESEND_API_KEY = "re_test_123";
    const { getResend } = await import("./resend");
    const client = getResend();
    expect(client).toBeDefined();
    expect(client.contacts).toBeDefined();
  });

  it("returns the same instance on subsequent calls", async () => {
    process.env.RESEND_API_KEY = "re_test_456";
    const { getResend } = await import("./resend");
    const first = getResend();
    const second = getResend();
    expect(first).toBe(second);
  });
});
