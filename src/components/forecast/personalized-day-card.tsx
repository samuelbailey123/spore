"use client";

import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { RISK_LABELS, RISK_COLORS } from "@/lib/pollen/thresholds";
import type { PersonalizedDay } from "@/types/allergen";

interface PersonalizedDayCardProps {
  day: PersonalizedDay;
  isWorst: boolean;
  index: number;
}

/**
 * Displays a single day's personalized allergen forecast
 * with impact bar, species list, and risk badge.
 */
export function PersonalizedDayCard({
  day,
  isWorst,
  index,
}: PersonalizedDayCardProps) {
  const maxBar = 20;
  const barWidth = Math.min((day.impactScore / maxBar) * 100, 100);
  const dateLabel =
    index === 0
      ? "Today"
      : index === 1
        ? "Tomorrow"
        : format(parseISO(day.date), "EEE, MMM d");

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-shadow",
        isWorst
          ? "border-red-300 bg-red-50 shadow-md dark:border-red-800 dark:bg-red-950"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      )}
      data-testid={`personalized-day-${index}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{dateLabel}</span>
          {isWorst && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
              Worst Day
            </span>
          )}
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: RISK_COLORS[day.risk] }}
        >
          {RISK_LABELS[day.risk]}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Impact Score</span>
          <span>{day.impactScore.toFixed(1)}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${barWidth}%`,
              backgroundColor: RISK_COLORS[day.risk],
            }}
          />
        </div>
      </div>

      {day.relevantSpecies.length > 0 && (
        <div className="mt-3 space-y-1">
          {day.relevantSpecies
            .sort((a, b) => b.indexValue - a.indexValue)
            .map((s) => (
              <div
                key={s.slug}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700 dark:text-zinc-300">
                  {s.name}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: RISK_COLORS[s.risk] }}
                >
                  {s.indexValue.toFixed(1)} UPI
                </span>
              </div>
            ))}
        </div>
      )}

      {day.relevantSpecies.length === 0 && (
        <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
          No data for your allergens on this day.
        </p>
      )}
    </div>
  );
}
