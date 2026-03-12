import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { cacheGet, cacheSet, cacheInvalidate, cacheClear, cacheSize, TTL } from "./cache";

describe("cache", () => {
  beforeEach(() => {
    cacheClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null for missing keys", () => {
    expect(cacheGet("nonexistent")).toBeNull();
  });

  it("stores and retrieves values", () => {
    cacheSet("key1", { foo: "bar" }, TTL.CURRENT);
    expect(cacheGet("key1")).toEqual({ foo: "bar" });
  });

  it("returns null for expired entries", () => {
    vi.useFakeTimers();
    cacheSet("key2", "value", 1000);
    vi.advanceTimersByTime(1001);
    expect(cacheGet("key2")).toBeNull();
    vi.useRealTimers();
  });

  it("returns value before expiry", () => {
    vi.useFakeTimers();
    cacheSet("key3", "value", 5000);
    vi.advanceTimersByTime(4999);
    expect(cacheGet("key3")).toBe("value");
    vi.useRealTimers();
  });

  it("invalidates specific keys", () => {
    cacheSet("a", 1, TTL.CURRENT);
    cacheSet("b", 2, TTL.CURRENT);
    cacheInvalidate("a");
    expect(cacheGet("a")).toBeNull();
    expect(cacheGet("b")).toBe(2);
  });

  it("clears all entries", () => {
    cacheSet("a", 1, TTL.CURRENT);
    cacheSet("b", 2, TTL.CURRENT);
    cacheClear();
    expect(cacheSize()).toBe(0);
  });

  it("tracks cache size", () => {
    expect(cacheSize()).toBe(0);
    cacheSet("x", 1, TTL.CURRENT);
    expect(cacheSize()).toBe(1);
    cacheSet("y", 2, TTL.CURRENT);
    expect(cacheSize()).toBe(2);
  });

  it("overwrites existing keys", () => {
    cacheSet("key", "old", TTL.CURRENT);
    cacheSet("key", "new", TTL.CURRENT);
    expect(cacheGet("key")).toBe("new");
    expect(cacheSize()).toBe(1);
  });

  it("has correct TTL constants", () => {
    expect(TTL.CURRENT).toBe(3_600_000);
    expect(TTL.FORECAST).toBe(10_800_000);
    expect(TTL.HISTORY).toBe(86_400_000);
    expect(TTL.GEOCODE).toBe(604_800_000);
  });

  it("removes expired entries on get", () => {
    vi.useFakeTimers();
    cacheSet("exp", "val", 100);
    vi.advanceTimersByTime(101);
    cacheGet("exp");
    expect(cacheSize()).toBe(0);
    vi.useRealTimers();
  });
});
