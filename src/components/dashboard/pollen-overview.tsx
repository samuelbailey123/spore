"use client";

import { PollenIndexCard } from "./pollen-index-card";
import type { PollenIndex } from "@/types/pollen";

interface PollenOverviewProps {
  indices: PollenIndex[];
}

export function PollenOverview({ indices }: PollenOverviewProps) {
  if (indices.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">
          No pollen data available for this location.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {indices.map((index) => (
        <PollenIndexCard key={index.category} index={index} expanded />
      ))}
    </div>
  );
}
