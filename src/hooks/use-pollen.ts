"use client";

import useSWR from "swr";
import type { PollenSnapshot, ApiResponse } from "@/types/pollen";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
};

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
