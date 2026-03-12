"use client";

import useSWR from "swr";
import type { PollenSnapshot, ApiResponse } from "@/types/pollen";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePollen(lat: number | null, lng: number | null, name?: string) {
  const key =
    lat !== null && lng !== null
      ? `/api/pollen/current?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name ?? "Your Location")}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PollenSnapshot>>(
    key,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000,
      dedupingInterval: 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    pollen: data?.data ?? null,
    error: error ?? (data?.error ? new Error(data.error) : null),
    isLoading,
    refresh: mutate,
  };
}
