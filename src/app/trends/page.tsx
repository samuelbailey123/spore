"use client";

import { useState } from "react";
import { useLocation } from "@/context/location-context";
import { useHistory } from "@/hooks/use-history";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CATEGORY_COLORS } from "@/lib/pollen/thresholds";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "24h", days: 1 },
  { label: "48h", days: 2 },
] as const;

export default function TrendsPage() {
  const { lat, lng, loading: locationLoading } = useLocation();
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[1]);

  const now = new Date();
  const from = format(subDays(now, range.days), "yyyy-MM-dd");
  const to = format(now, "yyyy-MM-dd");

  const { history, error, isLoading } = useHistory(lat, lng, from, to);

  if (locationLoading || isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pollen Trends</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pollen Trends</h1>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const chartData = (history ?? []).map((point) => ({
    time: format(new Date(point.date), "MMM d, h:mm a"),
    Tree: point.treeCount,
    Grass: point.grassCount,
    Weed: point.weedCount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pollen Trends</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Historical grain counts (grains/m³) from Ambee
          </p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                r.label === range.label
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-zinc-500" />
            <h3 className="font-semibold">Grain Count Over Time</h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e4e4e7",
                  }}
                  formatter={(value, name) => [
                    `${value} grains/m³`,
                    `${name}`,
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Tree"
                  stroke={CATEGORY_COLORS.tree}
                  fill={CATEGORY_COLORS.tree}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Grass"
                  stroke={CATEGORY_COLORS.grass}
                  fill={CATEGORY_COLORS.grass}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Weed"
                  stroke={CATEGORY_COLORS.weed}
                  fill={CATEGORY_COLORS.weed}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No historical data available for this location and time range.
            Historical pollen data requires the Ambee API key to be configured.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">About Historical Data</h3>
        <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <p>
            Historical pollen data is sourced from Ambee and shows actual grain counts
            per cubic metre of air (grains/m³). Unlike the index-based dashboard data,
            these are raw measurements.
          </p>
          <p>
            <strong>Why grain counts matter:</strong> The index (0-5 scale) on the dashboard
            is normalised for easy understanding, but grain counts give you the precise
            concentration. Medical research and clinical thresholds reference grain counts,
            making this data valuable for tracking your personal exposure and correlating
            with symptom severity.
          </p>
          <p>
            Ambee provides historical data from 2016 to present, queried in 48-hour windows.
            Data is sampled at hourly intervals.
          </p>
        </div>
      </div>
    </div>
  );
}
