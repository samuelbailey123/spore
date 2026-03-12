"use client";

import useSWR from "swr";
import type { HistoricalDataPoint, ApiResponse } from "@/types/pollen";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHistory(
  lat: number | null,
  lng: number | null,
  from: string | null,
  to: string | null
) {
  const key =
    lat !== null && lng !== null && from && to
      ? `/api/pollen/history?lat=${lat}&lng=${lng}&from=${from}&to=${to}`
      : null;

  const { data, error, isLoading } = useSWR<ApiResponse<HistoricalDataPoint[]>>(
    key,
    fetcher,
    {
      refreshInterval: 0,
      dedupingInterval: 10 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    history: data?.data ?? null,
    error: error ?? (data?.error ? new Error(data.error) : null),
    isLoading,
  };
}
