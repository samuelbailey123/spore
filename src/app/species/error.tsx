"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SpeciesError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="font-medium text-red-800 dark:text-red-200">
          Unable to load species data
        </p>
      </div>
      <p className="text-sm text-red-600 dark:text-red-400">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="self-start rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}
