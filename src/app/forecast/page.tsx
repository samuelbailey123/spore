"use client";

import { useState } from "react";
import { useLocation } from "@/context/location-context";
import { useForecast } from "@/hooks/use-forecast";
import { ForecastChart } from "@/components/forecast/forecast-chart";
import { DayDetail } from "@/components/forecast/day-detail";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function ForecastPage() {
  const { lat, lng, loading: locationLoading } = useLocation();
  const { forecast, error, isLoading } = useForecast(lat, lng);
  const [selectedDay, setSelectedDay] = useState(0);

  if (locationLoading || isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pollen Forecast</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pollen Forecast</h1>
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
        <h1 className="text-2xl font-bold">Pollen Forecast</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          No forecast data available for your location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pollen Forecast</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {forecast.length}-day pollen outlook for your area
        </p>
      </div>

      <ForecastChart forecast={forecast} />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {forecast.map((day, i) => (
          <button
            key={day.date}
            onClick={() => setSelectedDay(i)}
            className={cn(
              "whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors",
              i === selectedDay
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
            )}
          >
            {i === 0
              ? "Today"
              : i === 1
                ? "Tomorrow"
                : format(parseISO(day.date), "EEE, MMM d")}
          </button>
        ))}
      </div>

      <DayDetail day={forecast[selectedDay]} />
    </div>
  );
}
