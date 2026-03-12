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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <span className="text-sm font-bold">S</span>
            </div>
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
