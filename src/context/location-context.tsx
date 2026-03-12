"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface LocationState {
  lat: number | null;
  lng: number | null;
  name: string;
  loading: boolean;
  error: string | null;
}

interface LocationContextValue extends LocationState {
  setLocation: (lat: number, lng: number, name: string) => void;
  requestGeolocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = "spore-location";
const DEFAULT_LAT = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? "29.7604");
const DEFAULT_LNG = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? "-95.3698");

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    name: "Loading...",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({
          lat: parsed.lat,
          lng: parsed.lng,
          name: parsed.name ?? "Your Location",
          loading: false,
          error: null,
        });
        return;
      } catch {
        // Fall through to geolocation
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location",
            loading: false,
            error: null,
          };
          setState(loc);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
        },
        () => {
          setState({
            lat: DEFAULT_LAT,
            lng: DEFAULT_LNG,
            name: "Houston, TX (default)",
            loading: false,
            error: null,
          });
        },
        { timeout: 10000 }
      );
    } else {
      setState({
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
        name: "Houston, TX (default)",
        loading: false,
        error: null,
      });
    }
  }, []);

  const setLocation = useCallback((lat: number, lng: number, name: string) => {
    const loc = { lat, lng, name, loading: false, error: null };
    setState(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  const requestGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, error: "Geolocation not supported" }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Current Location",
          loading: false,
          error: null,
        };
        setState(loc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      },
      { timeout: 10000 }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ ...state, setLocation, requestGeolocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
