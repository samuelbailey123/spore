"use client";

import { useAllergens } from "@/context/allergen-context";
import { getSpeciesByCategory } from "@/data/species";
import { AllergenToggleCard } from "@/components/allergens/allergen-toggle-card";
import { Check, X } from "lucide-react";
import Link from "next/link";

/**
 * Page for users to select which pollen species they are allergic to.
 * Selections persist in localStorage via AllergenContext.
 */
export default function MyAllergensPage() {
  const { allergens, toggleAllergen, clearAllergens } = useAllergens();

  const trees = getSpeciesByCategory("tree");
  const grasses = getSpeciesByCategory("grass");
  const weeds = getSpeciesByCategory("weed");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Allergens</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Select the species you&apos;re allergic to for a personalized forecast.
          </p>
        </div>
        {allergens.length > 0 && (
          <button
            onClick={clearAllergens}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {allergens.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
          <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {allergens.length} allergen{allergens.length !== 1 ? "s" : ""} selected.{" "}
            <Link
              href="/my-forecast"
              className="font-medium underline underline-offset-2"
            >
              View your personalized forecast
            </Link>
          </p>
        </div>
      )}

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Trees ({trees.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trees.map((s) => (
            <AllergenToggleCard
              key={s.slug}
              species={s}
              selected={allergens.includes(s.slug)}
              onToggle={toggleAllergen}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Grasses ({grasses.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grasses.map((s) => (
            <AllergenToggleCard
              key={s.slug}
              species={s}
              selected={allergens.includes(s.slug)}
              onToggle={toggleAllergen}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3 rounded-full bg-purple-500" />
          Weeds ({weeds.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weeds.map((s) => (
            <AllergenToggleCard
              key={s.slug}
              species={s}
              selected={allergens.includes(s.slug)}
              onToggle={toggleAllergen}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
