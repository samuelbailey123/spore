"use client";

import { TreePine, Flower2, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskIndicator } from "./risk-indicator";
import {
  RISK_EXPLANATIONS,
  AFFECTED_PERCENTAGE,
} from "@/lib/pollen/thresholds";
import type { PollenIndex } from "@/types/pollen";

const categoryIcons = {
  tree: TreePine,
  grass: Flower2,
  weed: Leaf,
};

const categoryBorders = {
  tree: "border-l-emerald-500",
  grass: "border-l-blue-500",
  weed: "border-l-purple-500",
};

interface PollenIndexCardProps {
  index: PollenIndex;
  expanded?: boolean;
}

export function PollenIndexCard({ index, expanded = false }: PollenIndexCardProps) {
  const Icon = categoryIcons[index.category];
  const explanation = RISK_EXPLANATIONS[index.category][index.risk];
  const affected = AFFECTED_PERCENTAGE[index.risk];

  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
        categoryBorders[index.category]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${index.color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: index.color }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{index.displayName} Pollen</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Index: {index.value}/5 {!index.inSeason && "(Out of Season)"}
            </p>
          </div>
        </div>
        <RiskIndicator risk={index.risk} size="lg" />
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-full max-w-[200px] rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-5 rounded-full transition-all"
                style={{
                  width: `${(index.value / 5) * 100}%`,
                  backgroundColor: index.color,
                }}
              />
            </div>
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {affected}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
