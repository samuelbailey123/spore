"use client";

import { format, parseISO } from "date-fns";
import { PollenIndexCard } from "@/components/dashboard/pollen-index-card";
import { SpeciesBreakdown } from "@/components/dashboard/species-breakdown";
import type { DailyForecast } from "@/types/pollen";

interface DayDetailProps {
  day: DailyForecast;
}

export function DayDetail({ day }: DayDetailProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {format(parseISO(day.date), "EEEE, MMMM d, yyyy")}
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {day.indices.map((index) => (
          <PollenIndexCard key={index.category} index={index} expanded />
        ))}
      </div>
      {day.species.length > 0 && <SpeciesBreakdown species={day.species} />}
    </div>
  );
}
