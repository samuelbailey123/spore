"use client";

import { AlertCircle } from "lucide-react";

export default function MyForecastError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Forecast</h1>
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      </div>
    </div>
  );
}
