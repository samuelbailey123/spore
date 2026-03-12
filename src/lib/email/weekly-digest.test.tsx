import { describe, it, expect } from "vitest";
import { renderWeeklyDigest } from "./weekly-digest";
import type { PersonalizedDay } from "@/types/allergen";

const mockDays: PersonalizedDay[] = [
  {
    date: "2026-03-15",
    relevantSpecies: [
      { name: "Oak", slug: "oak", category: "tree", indexValue: 4, risk: "very_high", inSeason: true },
    ],
    impactScore: 4,
    worstAllergen: "Oak",
    risk: "very_high",
  },
  {
    date: "2026-03-16",
    relevantSpecies: [
      { name: "Oak", slug: "oak", category: "tree", indexValue: 1, risk: "low", inSeason: true },
    ],
    impactScore: 1,
    worstAllergen: "Oak",
    risk: "low",
  },
];

describe("renderWeeklyDigest", () => {
  it("returns valid HTML string", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: ["Take antihistamines early."],
      unsubscribeUrl: "https://spore.example.com/api/unsubscribe?email=test@test.com",
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("includes location name", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    expect(html).toContain("Houston, TX");
  });

  it("marks the worst day", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    expect(html).toContain("Worst Day");
  });

  it("includes species names and UPI values", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    expect(html).toContain("Oak (4.0)");
  });

  it("includes tips when provided", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: ["Wear a mask", "Stay indoors"],
      unsubscribeUrl: "#",
    });

    expect(html).toContain("Wear a mask");
    expect(html).toContain("Stay indoors");
    expect(html).toContain("Tips for Your Allergens");
  });

  it("omits tips section when no tips", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    expect(html).not.toContain("Tips for Your Allergens");
  });

  it("includes unsubscribe link", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "https://spore.example.com/unsub",
    });

    expect(html).toContain("https://spore.example.com/unsub");
    expect(html).toContain("Unsubscribe");
  });

  it("shows risk level badges", () => {
    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: mockDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    expect(html).toContain("Very High");
    expect(html).toContain("Low");
  });

  it("sorts species by UPI value descending", () => {
    const multiSpeciesDays: PersonalizedDay[] = [
      {
        date: "2026-03-15",
        relevantSpecies: [
          { name: "Birch", slug: "birch", category: "tree", indexValue: 1, risk: "low", inSeason: true },
          { name: "Oak", slug: "oak", category: "tree", indexValue: 4, risk: "very_high", inSeason: true },
        ],
        impactScore: 5,
        worstAllergen: "Oak",
        risk: "moderate",
      },
    ];

    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: multiSpeciesDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    const oakIdx = html.indexOf("Oak (4.0)");
    const birchIdx = html.indexOf("Birch (1.0)");
    expect(oakIdx).toBeLessThan(birchIdx);
  });

  it("shows No data for days without species", () => {
    const emptyDays: PersonalizedDay[] = [
      {
        date: "2026-03-15",
        relevantSpecies: [],
        impactScore: 0,
        worstAllergen: null,
        risk: "none",
      },
    ];

    const html = renderWeeklyDigest({
      locationName: "Houston, TX",
      days: emptyDays,
      worstDayIndex: 0,
      tips: [],
      unsubscribeUrl: "#",
    });

    expect(html).toContain("No data");
  });
});
