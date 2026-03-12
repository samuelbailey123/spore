"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Search, X, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/context/location-context";
import type { GeocodeResult } from "@/app/api/geocode/route";

const RECENT_KEY = "spore-recent-locations";
const MAX_RECENT = 5;

interface RecentLocation {
  lat: number;
  lng: number;
  name: string;
}

function getRecentLocations(): RecentLocation[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RecentLocation[];
  } catch {
    return [];
  }
}

function saveRecentLocation(location: RecentLocation): void {
  const existing = getRecentLocations();
  const filtered = existing.filter(
    (l) => !(l.lat === location.lat && l.lng === location.lng)
  );
  const updated = [location, ...filtered].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export function LocationPicker() {
  const { name, setLocation, requestGeolocation, loading } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      setRecentLocations(getRecentLocations());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        setSearchError(json.error ?? "Search failed");
        setResults([]);
      } else {
        setResults(json.data);
        if (json.data.length === 0) {
          setSearchError("No results found");
        }
      }
    } catch {
      setSearchError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function selectLocation(lat: number, lng: number, locationName: string) {
    setLocation(lat, lng, locationName);
    saveRecentLocation({ lat, lng, name: locationName });
    setOpen(false);
    setQuery("");
    setResults([]);
    setSearchError(null);
  }

  function handleUseCurrentLocation() {
    requestGeolocation();
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {loading ? (
          <Navigation className="h-3.5 w-3.5 animate-pulse" />
        ) : (
          <MapPin className="h-3.5 w-3.5" />
        )}
        <span className="max-w-[150px] truncate">{name}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Location picker"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-100 p-3 dark:border-zinc-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search address, city, or zip code..."
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-8 text-sm outline-none placeholder:text-zinc-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setSearchError(null);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <button
              onClick={handleUseCurrentLocation}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Navigation className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <span>Use my current location</span>
            </button>

            {searching && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            )}

            {searchError && !searching && (
              <div className="px-3 py-3 text-sm text-zinc-500">{searchError}</div>
            )}

            {results.length > 0 && (
              <div className="border-t border-zinc-100 dark:border-zinc-800">
                <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 uppercase">
                  Search Results
                </div>
                {results.map((result, i) => (
                  <button
                    key={`${result.lat}-${result.lng}-${i}`}
                    onClick={() => selectLocation(result.lat, result.lng, result.name)}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <div className="min-w-0">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {result.name}
                      </div>
                      <div className="truncate text-xs text-zinc-400">
                        {result.fullAddress}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searching && results.length === 0 && !searchError && recentLocations.length > 0 && (
              <div className="border-t border-zinc-100 dark:border-zinc-800">
                <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 uppercase">
                  Recent
                </div>
                {recentLocations.map((loc, i) => (
                  <button
                    key={`recent-${loc.lat}-${loc.lng}-${i}`}
                    onClick={() => selectLocation(loc.lat, loc.lng, loc.name)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="truncate">{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
