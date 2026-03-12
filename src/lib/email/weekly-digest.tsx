import type { PersonalizedDay } from "@/types/allergen";
import { RISK_LABELS, RISK_COLORS } from "@/lib/pollen/thresholds";

interface WeeklyDigestProps {
  locationName: string;
  days: PersonalizedDay[];
  worstDayIndex: number;
  tips: string[];
  unsubscribeUrl: string;
}

/**
 * Generates an HTML email string for the weekly allergen digest.
 */
export function renderWeeklyDigest({
  locationName,
  days,
  worstDayIndex,
  tips,
  unsubscribeUrl,
}: WeeklyDigestProps): string {
  const dayRows = days
    .map((day, i) => {
      const isWorst = i === worstDayIndex && day.impactScore > 0;
      const color = RISK_COLORS[day.risk];
      const label = RISK_LABELS[day.risk];
      const date = new Date(day.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const species = day.relevantSpecies
        .sort((a, b) => b.indexValue - a.indexValue)
        .map((s) => `${s.name} (${s.indexValue.toFixed(1)})`)
        .join(", ");

      return `
        <tr style="${isWorst ? "background-color:#fef2f2;" : ""}">
          <td style="padding:12px;border-bottom:1px solid #e4e4e7;">
            <strong>${date}</strong>
            ${isWorst ? '<span style="color:#dc2626;font-size:12px;"> (Worst Day)</span>' : ""}
          </td>
          <td style="padding:12px;border-bottom:1px solid #e4e4e7;">
            <span style="background-color:${color};color:white;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500;">
              ${label}
            </span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #e4e4e7;font-size:13px;color:#52525b;">
            ${species || "No data"}
          </td>
        </tr>`;
    })
    .join("");

  const tipsList = tips
    .map((t) => `<li style="margin-bottom:8px;color:#52525b;">${t}</li>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background-color:#052e16;padding:24px;border-radius:12px 12px 0 0;">
      <h1 style="color:#22c55e;margin:0;font-size:24px;">Spore</h1>
      <p style="color:#86efac;margin:4px 0 0;font-size:14px;">Your Weekly Allergen Forecast</p>
    </div>

    <div style="background-color:white;padding:24px;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 16px;color:#3f3f46;">
        Here's your personalized pollen forecast for <strong>${locationName}</strong> this week.
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background-color:#fafafa;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#71717a;text-transform:uppercase;">Day</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#71717a;text-transform:uppercase;">Risk</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#71717a;text-transform:uppercase;">Allergens</th>
          </tr>
        </thead>
        <tbody>
          ${dayRows}
        </tbody>
      </table>

      ${
        tips.length > 0
          ? `
      <div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px;">
        <h3 style="margin:0 0 8px;font-size:14px;color:#92400e;">Tips for Your Allergens</h3>
        <ul style="margin:0;padding-left:20px;font-size:13px;">
          ${tipsList}
        </ul>
      </div>`
          : ""
      }

      <p style="font-size:12px;color:#a1a1aa;text-align:center;">
        <a href="${unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe</a> from weekly digests
      </p>
    </div>
  </div>
</body>
</html>`;
}
