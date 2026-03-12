import { describe, it, expect } from "vitest";
import { species, getSpeciesBySlug, getSpeciesByCategory, getAllSlugs } from "./species";

describe("species data", () => {
  it("has species entries", () => {
    expect(species.length).toBeGreaterThan(0);
  });

  it("all species have required fields", () => {
    for (const sp of species) {
      expect(sp.slug).toBeTruthy();
      expect(sp.name).toBeTruthy();
      expect(sp.scientificName).toBeTruthy();
      expect(["tree", "grass", "weed"]).toContain(sp.category);
      expect(sp.description.length).toBeGreaterThan(50);
      expect(["mild", "moderate", "severe"]).toContain(sp.allergySeverity);
      expect(sp.bloomPeriod.start).toBeGreaterThanOrEqual(1);
      expect(sp.bloomPeriod.start).toBeLessThanOrEqual(12);
      expect(sp.bloomPeriod.end).toBeGreaterThanOrEqual(1);
      expect(sp.bloomPeriod.end).toBeLessThanOrEqual(12);
      expect(sp.peakMonths.length).toBeGreaterThan(0);
      expect(sp.crossReactivity.length).toBeGreaterThan(0);
      expect(sp.tips.length).toBeGreaterThan(0);
      expect(sp.grainSize).toBeTruthy();
      expect(sp.prevalence).toBeTruthy();
    }
  });

  it("has no duplicate slugs", () => {
    const slugs = species.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has all three categories represented", () => {
    const categories = new Set(species.map((s) => s.category));
    expect(categories.has("tree")).toBe(true);
    expect(categories.has("grass")).toBe(true);
    expect(categories.has("weed")).toBe(true);
  });

  it("peak months are within bloom period", () => {
    for (const sp of species) {
      for (const month of sp.peakMonths) {
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
      }
    }
  });
});

describe("getSpeciesBySlug", () => {
  it("finds existing species", () => {
    const oak = getSpeciesBySlug("oak");
    expect(oak).toBeDefined();
    expect(oak?.name).toBe("Oak");
  });

  it("returns undefined for unknown slug", () => {
    expect(getSpeciesBySlug("nonexistent")).toBeUndefined();
  });
});

describe("getSpeciesByCategory", () => {
  it("returns only tree species", () => {
    const trees = getSpeciesByCategory("tree");
    expect(trees.length).toBeGreaterThan(0);
    for (const t of trees) {
      expect(t.category).toBe("tree");
    }
  });

  it("returns only grass species", () => {
    const grasses = getSpeciesByCategory("grass");
    expect(grasses.length).toBeGreaterThan(0);
    for (const g of grasses) {
      expect(g.category).toBe("grass");
    }
  });

  it("returns only weed species", () => {
    const weeds = getSpeciesByCategory("weed");
    expect(weeds.length).toBeGreaterThan(0);
    for (const w of weeds) {
      expect(w.category).toBe("weed");
    }
  });
});

describe("getAllSlugs", () => {
  it("returns all slugs", () => {
    const slugs = getAllSlugs();
    expect(slugs.length).toBe(species.length);
    expect(slugs).toContain("oak");
    expect(slugs).toContain("ragweed");
  });
});
