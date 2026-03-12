"use client";

import Link from "next/link";
import { RiskIndicator } from "./risk-indicator";
import { cn } from "@/lib/utils";
import type { SpeciesCount } from "@/types/pollen";

const categoryColors = {
  tree: "text-emerald-600 dark:text-emerald-400",
  grass: "text-blue-600 dark:text-blue-400",
  weed: "text-purple-600 dark:text-purple-400",
};

interface SpeciesBreakdownProps {
  species: SpeciesCount[];
}

export function SpeciesBreakdown({ species }: SpeciesBreakdownProps) {
  if (species.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold">Species Breakdown</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Detailed species data is not available for this location right now. This could be because
          it&apos;s outside of the pollen season or the location is not covered by species-level monitoring.
        </p>
      </div>
    );
  }

  const sorted = [...species].sort((a, b) => b.indexValue - a.indexValue);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold">Species Breakdown</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Individual species currently in season, ranked by severity
      </p>

      <div className="mt-4 space-y-2">
        {sorted.map((s) => (
          <Link
            key={s.slug}
            href={`/species/${s.slug}`}
            className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    s.category === "tree"
                      ? "#22c55e"
                      : s.category === "grass"
                        ? "#3b82f6"
                        : "#a855f7",
                }}
              />
              <span className="font-medium">{s.name}</span>
              <span
                className={cn(
                  "text-xs font-medium uppercase",
                  categoryColors[s.category]
                )}
              >
                {s.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {s.indexValue}/5
              </span>
              <RiskIndicator risk={s.risk} size="sm" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
