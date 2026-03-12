import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { renderWeeklyDigest } from "@/lib/email/weekly-digest";
import {
  filterForecastByAllergens,
  findWorstDay,
  getAllergenTips,
} from "@/lib/pollen/allergen-score";
import type { DailyForecast, ApiResponse } from "@/types/pollen";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/weekly-digest
 * Called by Vercel cron on Sundays at 8am UTC.
 * Lists all Resend contacts, fetches forecasts, sends personalized emails.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return NextResponse.json(
      { error: "RESEND_AUDIENCE_ID not configured" },
      { status: 503 }
    );
  }

  try {
    const resend = getResend();
    const { data: contactList } = await resend.contacts.list({ audienceId });
    const contacts = (contactList?.data?.filter((c) => !c.unsubscribed) ?? []) as unknown as ContactRecord[];

    if (contacts.length === 0) {
      return NextResponse.json({ sent: 0, message: "No active subscribers" });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://spore.decimahosted.com";

    let sent = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        const allergens = parseContactAllergens(contact);
        const location = parseContactLocation(contact);

        if (allergens.length === 0 || !location) continue;

        const forecast = await fetchForecast(location.lat, location.lng);
        if (!forecast) continue;

        const personalized = filterForecastByAllergens(forecast, allergens);
        const worstIndex = findWorstDay(personalized);
        const tips = getAllergenTips(allergens);

        const html = renderWeeklyDigest({
          locationName: location.name,
          days: personalized,
          worstDayIndex: worstIndex,
          tips,
          unsubscribeUrl: `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(contact.email)}`,
        });

        await resend.emails.send({
          from: "Spore <contact@decimamedia.com>",
          to: contact.email,
          subject: `Your weekly pollen forecast for ${location.name}`,
          html,
        });

        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${contact.email}: ${msg}`);
      }
    }

    return NextResponse.json({ sent, total: contacts.length, errors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cron job failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface ContactRecord {
  id: string;
  email: string;
  unsubscribed: boolean;
  firstName?: string | null;
}

/**
 * Parse allergens from Resend contact custom properties.
 * Resend stores custom data in the firstName field as JSON (workaround).
 */
function parseContactAllergens(contact: ContactRecord): string[] {
  try {
    if (!contact.firstName) return [];
    const data = JSON.parse(contact.firstName);
    return Array.isArray(data.allergens) ? data.allergens : [];
  } catch {
    return [];
  }
}

/**
 * Parse location from Resend contact custom properties.
 */
function parseContactLocation(
  contact: ContactRecord
): { lat: number; lng: number; name: string } | null {
  try {
    if (!contact.firstName) return null;
    const data = JSON.parse(contact.firstName);
    if (typeof data.lat === "number" && typeof data.lng === "number") {
      return { lat: data.lat, lng: data.lng, name: data.locationName ?? "Your Location" };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch forecast data from the internal API.
 */
async function fetchForecast(
  lat: number,
  lng: number
): Promise<DailyForecast[] | null> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(
      `${siteUrl}/api/pollen/forecast?lat=${lat}&lng=${lng}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json: ApiResponse<DailyForecast[]> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
