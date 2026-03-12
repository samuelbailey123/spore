import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Info, Lightbulb } from "lucide-react";
import { species, getSpeciesBySlug } from "@/data/species";
import { BloomCalendar } from "@/components/species/bloom-calendar";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return species.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = getSpeciesBySlug(slug);
  if (!sp) return { title: "Species Not Found" };
  return {
    title: `${sp.name} Pollen — Species Profile`,
    description: sp.description.slice(0, 160),
  };
}

const severityColors = {
  mild: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  moderate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  severe: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const categoryColors = {
  tree: "text-emerald-600 dark:text-emerald-400",
  grass: "text-blue-600 dark:text-blue-400",
  weed: "text-purple-600 dark:text-purple-400",
};

export default async function SpeciesPage({ params }: PageProps) {
  const { slug } = await params;
  const sp = getSpeciesBySlug(slug);

  if (!sp) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/species"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        All Species
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{sp.name}</h1>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium uppercase",
              severityColors[sp.allergySeverity]
            )}
          >
            {sp.allergySeverity} allergen
          </span>
        </div>
        <p className="mt-1 text-lg italic text-zinc-500 dark:text-zinc-400">
          {sp.scientificName}
        </p>
        <p className={cn("mt-0.5 text-sm font-medium uppercase", categoryColors[sp.category])}>
          {sp.category} pollen
        </p>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-300">
          {sp.description}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Grain Size</p>
          <p className="mt-1 text-lg font-semibold">{sp.grainSize}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Prevalence</p>
          <p className="mt-1 text-sm leading-relaxed">{sp.prevalence}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Allergy Severity</p>
          <p className="mt-1 text-lg font-semibold capitalize">{sp.allergySeverity}</p>
        </div>
      </div>

      {/* Bloom calendar */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <BloomCalendar
          start={sp.bloomPeriod.start}
          end={sp.bloomPeriod.end}
          peakMonths={sp.peakMonths}
        />
      </div>

      {/* Cross-reactivity */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Cross-Reactivity</h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          If you&apos;re allergic to {sp.name.toLowerCase()} pollen, you may also react to:
        </p>
        <ul className="mt-3 space-y-1.5">
          {sp.crossReactivity.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Practical Tips</h2>
        </div>
        <ul className="mt-3 space-y-2">
          {sp.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
