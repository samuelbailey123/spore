"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface AllergenContextValue {
  allergens: string[];
  toggleAllergen: (slug: string) => void;
  setAllergens: (slugs: string[]) => void;
  clearAllergens: () => void;
}

const AllergenContext = createContext<AllergenContextValue | null>(null);

const STORAGE_KEY = "spore-allergens";

/**
 * Provides allergen selection state persisted to localStorage.
 */
export function AllergenProvider({ children }: { children: ReactNode }) {
  const [allergens, setAllergensState] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAllergensState(parsed);
        }
      } catch {
        // Ignore corrupt data
      }
    }
  }, []);

  const persist = useCallback((slugs: string[]) => {
    setAllergensState(slugs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, []);

  const toggleAllergen = useCallback(
    (slug: string) => {
      persist(
        allergens.includes(slug)
          ? allergens.filter((s) => s !== slug)
          : [...allergens, slug]
      );
    },
    [allergens, persist]
  );

  const setAllergens = useCallback(
    (slugs: string[]) => {
      persist(slugs);
    },
    [persist]
  );

  const clearAllergens = useCallback(() => {
    persist([]);
  }, [persist]);

  return (
    <AllergenContext.Provider
      value={{ allergens, toggleAllergen, setAllergens, clearAllergens }}
    >
      {children}
    </AllergenContext.Provider>
  );
}

/**
 * Access the current allergen selections and mutation methods.
 */
export function useAllergens(): AllergenContextValue {
  const context = useContext(AllergenContext);
  if (!context) {
    throw new Error("useAllergens must be used within an AllergenProvider");
  }
  return context;
}
