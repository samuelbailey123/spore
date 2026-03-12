"use client";

import { useLocation } from "@/context/location-context";
import { usePollen } from "@/hooks/use-pollen";
import { PollenOverview } from "@/components/dashboard/pollen-overview";
import { SpeciesBreakdown } from "@/components/dashboard/species-breakdown";
import { HealthTipsCard } from "@/components/dashboard/health-tips-card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import type { RiskLevel } from "@/types/pollen";

function getOverallRisk(indices: { risk: RiskLevel }[]): RiskLevel {
  const levels: RiskLevel[] = ["none", "low", "moderate", "high", "very_high"];
  let maxIdx = 0;
  for (const index of indices) {
    const idx = levels.indexOf(index.risk);
    if (idx > maxIdx) maxIdx = idx;
  }
  return levels[maxIdx];
}

export default function DashboardPage() {
  const { lat, lng, name, loading: locationLoading } = useLocation();
  const { pollen, error, isLoading } = usePollen(lat, lng, name);

  if (locationLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pollen Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Loading your location...</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pollen Dashboard</h1>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              Unable to load pollen data
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {error.message}. Try refreshing the page or changing your location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overallRisk = pollen ? getOverallRisk(pollen.indices) : "none";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pollen Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {pollen?.location.name ?? name}
          </p>
        </div>
        {pollen?.timestamp && (
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {format(new Date(pollen.timestamp), "h:mm a")}</span>
          </div>
        )}
      </div>

      {pollen && (
        <>
          <PollenOverview indices={pollen.indices} />
          <div className="grid gap-6 lg:grid-cols-2">
            <SpeciesBreakdown species={pollen.species} />
            <HealthTipsCard
              overallRisk={overallRisk}
              apiRecommendations={pollen.healthRecommendations}
            />
          </div>
        </>
      )}

      {!pollen && (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No pollen data available. This may be because pollen monitoring is not available
            for your current location or it is currently off-season.
          </p>
        </div>
      )}
    </div>
  );
}
