"use client";

import { useAllergens } from "@/context/allergen-context";
import { useLocation } from "@/context/location-context";
import { useForecast } from "@/hooks/use-forecast";
import {
  filterForecastByAllergens,
  findWorstDay,
  getAllergenTips,
} from "@/lib/pollen/allergen-score";
import { PersonalizedDayCard } from "@/components/forecast/personalized-day-card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { AlertCircle, Lightbulb } from "lucide-react";
import Link from "next/link";

/**
 * Personalized 5-day forecast filtered to the user's selected allergens.
 */
export default function MyForecastPage() {
  const { allergens } = useAllergens();
  const { lat, lng, name, loading: locationLoading } = useLocation();
  const { forecast, error, isLoading } = useForecast(lat, lng);

  if (locationLoading || isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Forecast</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (allergens.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Forecast</h1>
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-300">
            You haven&apos;t selected any allergens yet.
          </p>
          <Link
            href="/my-allergens"
            className="mt-3 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Select your allergens
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Forecast</h1>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!forecast?.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Forecast</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          No forecast data available for your location.
        </p>
      </div>
    );
  }

  const personalized = filterForecastByAllergens(forecast, allergens);
  const worstIndex = findWorstDay(personalized);
  const tips = getAllergenTips(allergens);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Forecast</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Personalized {personalized.length}-day outlook for {name} based on{" "}
          {allergens.length} allergen{allergens.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personalized.map((day, i) => (
          <PersonalizedDayCard
            key={day.date}
            day={day}
            isWorst={i === worstIndex && day.impactScore > 0}
            index={i}
          />
        ))}
      </div>

      {tips.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Tips for your allergens
            </h3>
          </div>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-amber-700 dark:text-amber-300"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
