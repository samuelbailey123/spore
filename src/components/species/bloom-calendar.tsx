import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface BloomCalendarProps {
  start: number;
  end: number;
  peakMonths: number[];
}

export function BloomCalendar({ start, end, peakMonths }: BloomCalendarProps) {
  function isInRange(month: number): boolean {
    if (start <= end) return month >= start && month <= end;
    return month >= start || month <= end;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Bloom Period
      </h4>
      <div className="grid grid-cols-12 gap-1">
        {MONTHS.map((label, i) => {
          const month = i + 1;
          const inRange = isInRange(month);
          const isPeak = peakMonths.includes(month);
          return (
            <div key={label} className="text-center">
              <div
                className={cn(
                  "mx-auto h-6 w-full rounded",
                  inRange
                    ? isPeak
                      ? "bg-amber-400 dark:bg-amber-500"
                      : "bg-amber-200 dark:bg-amber-800"
                    : "bg-zinc-100 dark:bg-zinc-800"
                )}
              />
              <span className="mt-1 block text-[10px] text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-amber-200 dark:bg-amber-800" /> Bloom
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-amber-400 dark:bg-amber-500" /> Peak
        </span>
      </div>
    </div>
  );
}
