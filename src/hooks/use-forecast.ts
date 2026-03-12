"use client";

import useSWR from "swr";
import type { DailyForecast, ApiResponse } from "@/types/pollen";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useForecast(lat: number | null, lng: number | null) {
  const key =
    lat !== null && lng !== null
      ? `/api/pollen/forecast?lat=${lat}&lng=${lng}`
      : null;

  const { data, error, isLoading } = useSWR<ApiResponse<DailyForecast[]>>(
    key,
    fetcher,
    {
      refreshInterval: 3 * 60 * 60 * 1000,
      dedupingInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    forecast: data?.data ?? null,
    error: error ?? (data?.error ? new Error(data.error) : null),
    isLoading,
  };
}
