import { describe, it, expect } from "vitest";
import {
  upiToRisk,
  grainCountToRisk,
  NAB_THRESHOLDS,
  RISK_LABELS,
  RISK_COLORS,
  CATEGORY_COLORS,
  RISK_EXPLANATIONS,
  AFFECTED_PERCENTAGE,
  HEALTH_TIPS,
} from "./thresholds";

describe("upiToRisk", () => {
  it("maps 0 to none", () => {
    expect(upiToRisk(0)).toBe("none");
  });

  it("maps negative to none", () => {
    expect(upiToRisk(-1)).toBe("none");
  });

  it("maps 0.5 to low", () => {
    expect(upiToRisk(0.5)).toBe("low");
  });

  it("maps 1 to low", () => {
    expect(upiToRisk(1)).toBe("low");
  });

  it("maps 1.5 to moderate", () => {
    expect(upiToRisk(1.5)).toBe("moderate");
  });

  it("maps 2 to moderate", () => {
    expect(upiToRisk(2)).toBe("moderate");
  });

  it("maps 3 to high", () => {
    expect(upiToRisk(3)).toBe("high");
  });

  it("maps 4 to very_high", () => {
    expect(upiToRisk(4)).toBe("very_high");
  });

  it("maps 5 to very_high", () => {
    expect(upiToRisk(5)).toBe("very_high");
  });
});

describe("grainCountToRisk", () => {
  it("maps 0 to none for all categories", () => {
    expect(grainCountToRisk(0, "tree")).toBe("none");
    expect(grainCountToRisk(0, "grass")).toBe("none");
    expect(grainCountToRisk(0, "weed")).toBe("none");
  });

  it("maps negative to none", () => {
    expect(grainCountToRisk(-5, "tree")).toBe("none");
  });

  it("maps tree counts correctly", () => {
    expect(grainCountToRisk(10, "tree")).toBe("low");
    expect(grainCountToRisk(50, "tree")).toBe("moderate");
    expect(grainCountToRisk(500, "tree")).toBe("high");
    expect(grainCountToRisk(2000, "tree")).toBe("very_high");
  });

  it("maps grass counts correctly", () => {
    expect(grainCountToRisk(3, "grass")).toBe("low");
    expect(grainCountToRisk(10, "grass")).toBe("moderate");
    expect(grainCountToRisk(100, "grass")).toBe("high");
    expect(grainCountToRisk(300, "grass")).toBe("very_high");
  });

  it("maps weed counts correctly", () => {
    expect(grainCountToRisk(5, "weed")).toBe("low");
    expect(grainCountToRisk(30, "weed")).toBe("moderate");
    expect(grainCountToRisk(200, "weed")).toBe("high");
    expect(grainCountToRisk(600, "weed")).toBe("very_high");
  });

  it("handles boundary values for tree", () => {
    expect(grainCountToRisk(14, "tree")).toBe("low");
    expect(grainCountToRisk(15, "tree")).toBe("moderate");
    expect(grainCountToRisk(89, "tree")).toBe("moderate");
    expect(grainCountToRisk(90, "tree")).toBe("high");
  });
});

describe("NAB_THRESHOLDS", () => {
  it("has thresholds for all categories", () => {
    expect(NAB_THRESHOLDS.tree).toBeDefined();
    expect(NAB_THRESHOLDS.grass).toBeDefined();
    expect(NAB_THRESHOLDS.weed).toBeDefined();
  });

  it("has ascending thresholds", () => {
    for (const cat of ["tree", "grass", "weed"] as const) {
      const t = NAB_THRESHOLDS[cat];
      expect(t.low).toBeLessThan(t.moderate);
      expect(t.moderate).toBeLessThan(t.high);
    }
  });
});

describe("constant data completeness", () => {
  const riskLevels = ["none", "low", "moderate", "high", "very_high"] as const;
  const categories = ["tree", "grass", "weed"] as const;

  it("RISK_LABELS covers all levels", () => {
    for (const level of riskLevels) {
      expect(RISK_LABELS[level]).toBeTruthy();
    }
  });

  it("RISK_COLORS covers all levels", () => {
    for (const level of riskLevels) {
      expect(RISK_COLORS[level]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("CATEGORY_COLORS covers all categories", () => {
    for (const cat of categories) {
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("RISK_EXPLANATIONS covers all combinations", () => {
    for (const cat of categories) {
      for (const level of riskLevels) {
        expect(RISK_EXPLANATIONS[cat][level]).toBeTruthy();
        expect(typeof RISK_EXPLANATIONS[cat][level]).toBe("string");
      }
    }
  });

  it("AFFECTED_PERCENTAGE covers all levels", () => {
    for (const level of riskLevels) {
      expect(AFFECTED_PERCENTAGE[level]).toBeTruthy();
    }
  });

  it("HEALTH_TIPS covers all levels with arrays", () => {
    for (const level of riskLevels) {
      expect(Array.isArray(HEALTH_TIPS[level])).toBe(true);
      expect(HEALTH_TIPS[level].length).toBeGreaterThan(0);
    }
  });
});
