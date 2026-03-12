"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/context/location-context";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/forecast", label: "Forecast" },
  { href: "/learn", label: "Learn" },
  { href: "/species", label: "Species" },
  { href: "/trends", label: "Trends" },
];

export function Header() {
  const pathname = usePathname();
  const { name, requestGeolocation, loading } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="#052e16" />
              <circle cx="16" cy="16" r="9" fill="none" stroke="#22c55e" strokeWidth="0.8" opacity="0.4" />
              <circle cx="16" cy="16" r="6.5" fill="#166534" />
              <circle cx="16" cy="16" r="5" fill="#15803d" />
              <circle cx="13" cy="14" r="1.5" fill="#22c55e" opacity="0.6" />
              <circle cx="19" cy="14" r="1.5" fill="#22c55e" opacity="0.6" />
              <circle cx="16" cy="19" r="1.5" fill="#22c55e" opacity="0.6" />
              <circle cx="16" cy="16" r="2" fill="#4ade80" opacity="0.3" />
            </svg>
            <span className="text-lg font-semibold tracking-tight">Spore</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={requestGeolocation}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {loading ? (
            <Navigation className="h-3.5 w-3.5 animate-pulse" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
          <span className="max-w-[150px] truncate">{name}</span>
        </button>
      </div>

      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-1.5 md:hidden dark:border-zinc-800">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
