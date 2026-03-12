import type { Metadata } from "next";
import { species, getSpeciesByCategory } from "@/data/species";
import { SpeciesCard } from "@/components/species/species-card";

export const metadata: Metadata = {
  title: "Pollen Species Guide",
  description:
    "Detailed profiles of allergenic pollen species: bloom periods, severity, cross-reactivity, and practical tips for managing exposure.",
};

export default function SpeciesIndexPage() {
  const trees = getSpeciesByCategory("tree");
  const grasses = getSpeciesByCategory("grass");
  const weeds = getSpeciesByCategory("weed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pollen Species Guide</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          {species.length} species profiles covering trees, grasses, and weeds
        </p>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Trees ({trees.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trees.map((s) => (
            <SpeciesCard key={s.slug} species={s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Grasses ({grasses.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grasses.map((s) => (
            <SpeciesCard key={s.slug} species={s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3 rounded-full bg-purple-500" />
          Weeds ({weeds.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weeds.map((s) => (
            <SpeciesCard key={s.slug} species={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
