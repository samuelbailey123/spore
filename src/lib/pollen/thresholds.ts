import type { PollenCategory, RiskLevel } from "@/types/pollen";

/**
 * NAB (National Allergy Bureau) pollen count thresholds.
 * Values represent grains per cubic metre of air.
 */
export const NAB_THRESHOLDS: Record<
  PollenCategory,
  { low: number; moderate: number; high: number; veryHigh: number }
> = {
  tree: { low: 15, moderate: 90, high: 1500, veryHigh: 1500 },
  grass: { low: 5, moderate: 20, high: 200, veryHigh: 200 },
  weed: { low: 10, moderate: 50, high: 500, veryHigh: 500 },
};

/**
 * Map a UPI index value (0-5) from Google Pollen API to a RiskLevel.
 */
export function upiToRisk(value: number): RiskLevel {
  if (value <= 0) return "none";
  if (value <= 1) return "low";
  if (value <= 2) return "moderate";
  if (value <= 3) return "high";
  return "very_high";
}

/**
 * Map a grain count to a RiskLevel based on NAB thresholds.
 */
export function grainCountToRisk(
  count: number,
  category: PollenCategory
): RiskLevel {
  const t = NAB_THRESHOLDS[category];
  if (count <= 0) return "none";
  if (count < t.low) return "low";
  if (count < t.moderate) return "moderate";
  if (count < t.high) return "high";
  return "very_high";
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  none: "None",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very High",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  none: "#10b981",
  low: "#34d399",
  moderate: "#fbbf24",
  high: "#f97316",
  very_high: "#ef4444",
};

export const CATEGORY_COLORS: Record<PollenCategory, string> = {
  tree: "#22c55e",
  grass: "#3b82f6",
  weed: "#a855f7",
};

/**
 * Human-readable explanations for each risk level, broken down by category.
 */
export const RISK_EXPLANATIONS: Record<
  PollenCategory,
  Record<RiskLevel, string>
> = {
  tree: {
    none: "No tree pollen detected. Safe for even the most sensitive individuals.",
    low: "Tree pollen counts are under 15 grains/m³. Most people will not experience symptoms. Only the most sensitive individuals may notice mild effects.",
    moderate:
      "Tree pollen counts are between 15-90 grains/m³. Many allergy sufferers will begin experiencing symptoms — sneezing, itchy eyes, and nasal congestion are common.",
    high: "Tree pollen counts are between 90-1,500 grains/m³. Most allergy sufferers will experience significant symptoms. Consider limiting outdoor time and taking antihistamines.",
    very_high:
      "Tree pollen counts exceed 1,500 grains/m³. This is an extreme level. Even people who don't usually suffer from allergies may experience symptoms. Stay indoors when possible.",
  },
  grass: {
    none: "No grass pollen detected. Air quality is excellent for outdoor activities.",
    low: "Grass pollen counts are under 5 grains/m³. Minimal impact expected. Enjoy outdoor activities freely.",
    moderate:
      "Grass pollen counts are between 5-20 grains/m³. Sensitive individuals should start taking precautions. Symptoms like sneezing and watery eyes may appear.",
    high: "Grass pollen counts are between 20-200 grains/m³. Significant allergy risk. Many people will experience symptoms. Limit time outdoors during peak hours (morning).",
    very_high:
      "Grass pollen counts exceed 200 grains/m³. Extreme levels that affect most allergy sufferers severely. Keep windows closed, shower after outdoor exposure, and use air purifiers.",
  },
  weed: {
    none: "No weed pollen detected. No precautions needed.",
    low: "Weed pollen counts are under 10 grains/m³. Only the most sensitive individuals may notice mild irritation.",
    moderate:
      "Weed pollen counts are between 10-50 grains/m³. Ragweed and other weed pollens are triggering symptoms in many allergy sufferers.",
    high: "Weed pollen counts are between 50-500 grains/m³. High levels of weed pollen. Ragweed is a major trigger at these levels. Antihistamines strongly recommended.",
    very_high:
      "Weed pollen counts exceed 500 grains/m³. Extreme weed pollen levels. Ragweed season is at its peak. Limit all outdoor exposure and keep medications readily available.",
  },
};

/**
 * Percentage of allergy sufferers likely affected at each risk level.
 */
export const AFFECTED_PERCENTAGE: Record<RiskLevel, string> = {
  none: "0%",
  low: "~10% of allergy sufferers",
  moderate: "~40% of allergy sufferers",
  high: "~70% of allergy sufferers",
  very_high: "~90%+ of allergy sufferers",
};

/**
 * General health tips for each risk level.
 */
export const HEALTH_TIPS: Record<RiskLevel, string[]> = {
  none: ["Enjoy outdoor activities freely."],
  low: [
    "Most people can enjoy outdoor activities without issue.",
    "Very sensitive individuals may want to keep antihistamines handy.",
  ],
  moderate: [
    "Take antihistamines before symptoms start — they work best preventatively.",
    "Wear sunglasses outdoors to protect your eyes from pollen.",
    "Shower and change clothes after extended outdoor time.",
  ],
  high: [
    "Limit outdoor activities, especially in the morning when pollen counts peak.",
    "Keep windows and doors closed — use air conditioning instead.",
    "Take antihistamines daily and consider nasal corticosteroid sprays.",
    "Dry clothes indoors rather than on a clothesline.",
  ],
  very_high: [
    "Stay indoors as much as possible, especially between 5am-10am.",
    "Use a HEPA air purifier in your bedroom.",
    "Shower immediately after any outdoor exposure.",
    "Consider wearing an N95 mask for necessary outdoor activities.",
    "Consult your doctor about adjusting your allergy medications.",
    "Keep car windows closed and use recirculated air in the vehicle.",
  ],
};
