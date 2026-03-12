"use client";

import useSWR from "swr";
import type { DailyForecast, ApiResponse } from "@/types/pollen";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
};

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
