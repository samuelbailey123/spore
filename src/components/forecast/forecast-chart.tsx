"use client";

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
import { format, parseISO } from "date-fns";
import type { DailyForecast } from "@/types/pollen";
import { CATEGORY_COLORS, RISK_LABELS } from "@/lib/pollen/thresholds";

interface ForecastChartProps {
  forecast: DailyForecast[];
}

export function ForecastChart({ forecast }: ForecastChartProps) {
  const chartData = forecast.map((day) => {
    const tree = day.indices.find((i) => i.category === "tree");
    const grass = day.indices.find((i) => i.category === "grass");
    const weed = day.indices.find((i) => i.category === "weed");

    return {
      date: day.date,
      label: format(parseISO(day.date), "EEE, MMM d"),
      Tree: tree?.value ?? 0,
      Grass: grass?.value ?? 0,
      Weed: weed?.value ?? 0,
      treeRisk: tree?.risk ?? "none",
      grassRisk: grass?.risk ?? "none",
      weedRisk: weed?.risk ?? "none",
    };
  });

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold">5-Day Pollen Forecast</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Universal Pollen Index (0-5) by category
      </p>

      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    <p className="mb-2 text-sm font-semibold">{label}</p>
                    {payload.map((entry) => {
                      const riskKey = `${(entry.name as string).toLowerCase()}Risk` as keyof typeof chartData[0];
                      const risk = chartData.find((d) => d.label === label)?.[riskKey] as string;
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>{entry.name}:</span>
                          <span className="font-medium">
                            {entry.value}/5
                          </span>
                          <span className="text-zinc-500">
                            ({RISK_LABELS[risk as keyof typeof RISK_LABELS] ?? risk})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
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
  );
}
