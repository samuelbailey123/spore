import { cn } from "@/lib/utils";
import { RISK_LABELS } from "@/lib/pollen/thresholds";
import type { RiskLevel } from "@/types/pollen";

const riskStyles: Record<RiskLevel, string> = {
  none: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  moderate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  very_high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface RiskIndicatorProps {
  risk: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RiskIndicator({ risk, size = "md", className }: RiskIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        riskStyles[risk],
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-base",
        className
      )}
    >
      {RISK_LABELS[risk]}
    </span>
  );
}
