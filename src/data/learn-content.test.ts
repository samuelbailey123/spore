import { describe, it, expect } from "vitest";
import { pollenTypeSections, faqs } from "./learn-content";

describe("learn content", () => {
  it("has sections", () => {
    expect(pollenTypeSections.length).toBeGreaterThan(0);
  });

  it("all sections have required fields", () => {
    for (const section of pollenTypeSections) {
      expect(section.slug).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content.length).toBeGreaterThan(100);
    }
  });

  it("has no duplicate slugs", () => {
    const slugs = pollenTypeSections.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers key topics", () => {
    const slugs = pollenTypeSections.map((s) => s.slug);
    expect(slugs).toContain("what-is-pollen");
    expect(slugs).toContain("tree-pollen");
    expect(slugs).toContain("grass-pollen");
    expect(slugs).toContain("weed-pollen");
    expect(slugs).toContain("understanding-counts");
    expect(slugs).toContain("cross-reactivity");
  });
});

describe("FAQs", () => {
  it("has FAQ entries", () => {
    expect(faqs.length).toBeGreaterThan(0);
  });

  it("all FAQs have question and answer", () => {
    for (const faq of faqs) {
      expect(faq.question).toBeTruthy();
      expect(faq.answer.length).toBeGreaterThan(20);
    }
  });
});
