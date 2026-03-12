import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SpeciesProfile } from "@/types/species";

const categoryColors = {
  tree: "border-l-emerald-500",
  grass: "border-l-blue-500",
  weed: "border-l-purple-500",
};

const severityLabels = {
  mild: "Mild Allergen",
  moderate: "Moderate Allergen",
  severe: "Severe Allergen",
};

const severityColors = {
  mild: "text-green-600 dark:text-green-400",
  moderate: "text-amber-600 dark:text-amber-400",
  severe: "text-red-600 dark:text-red-400",
};

interface SpeciesCardProps {
  species: SpeciesProfile;
}

export function SpeciesCard({ species }: SpeciesCardProps) {
  return (
    <Link href={`/species/${species.slug}`}>
      <div
        className={cn(
          "h-full rounded-lg border border-l-4 border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900",
          categoryColors[species.category]
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{species.name}</h3>
            <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
              {species.scientificName}
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-medium uppercase",
              categoryColors[species.category].replace("border-l-", "text-")
            )}
          >
            {species.category}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
          {species.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className={cn("text-xs font-medium", severityColors[species.allergySeverity])}>
            {severityLabels[species.allergySeverity]}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {species.grainSize}
          </span>
        </div>
      </div>
    </Link>
  );
}
