"use client";

import { cn } from "@/lib/utils";
import type { SpeciesProfile } from "@/types/species";

const severityColors = {
  mild: "text-green-600 dark:text-green-400",
  moderate: "text-amber-600 dark:text-amber-400",
  severe: "text-red-600 dark:text-red-400",
};

const severityLabels = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface AllergenToggleCardProps {
  species: SpeciesProfile;
  selected: boolean;
  onToggle: (slug: string) => void;
}

/**
 * Toggleable card showing a species name, severity badge, and bloom period.
 */
export function AllergenToggleCard({
  species,
  selected,
  onToggle,
}: AllergenToggleCardProps) {
  const bloomRange = `${monthNames[species.bloomPeriod.start - 1]}–${monthNames[species.bloomPeriod.end - 1]}`;

  return (
    <button
      type="button"
      onClick={() => onToggle(species.slug)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
      )}
      aria-pressed={selected}
      data-testid={`allergen-toggle-${species.slug}`}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          selected
            ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400"
            : "border-zinc-300 dark:border-zinc-600"
        )}
      >
        {selected && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" aria-hidden="true">
            <path
              d="M10 3L4.5 8.5L2 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{species.name}</span>
          <span className={cn("text-xs font-medium", severityColors[species.allergySeverity])}>
            {severityLabels[species.allergySeverity]}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Bloom: {bloomRange}
        </p>
      </div>
    </button>
  );
}
