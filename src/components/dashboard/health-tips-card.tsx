"use client";

import { ShieldCheck } from "lucide-react";
import { HEALTH_TIPS } from "@/lib/pollen/thresholds";
import type { RiskLevel } from "@/types/pollen";

interface HealthTipsCardProps {
  overallRisk: RiskLevel;
  apiRecommendations?: string[];
}

export function HealthTipsCard({ overallRisk, apiRecommendations }: HealthTipsCardProps) {
  const tips = apiRecommendations?.length
    ? apiRecommendations
    : HEALTH_TIPS[overallRisk];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-semibold">Health Tips</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
