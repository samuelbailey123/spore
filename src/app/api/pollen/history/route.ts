import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { fetchAmbeeHistory } from "@/lib/api/ambee-pollen";
import { cacheGet, cacheSet, TTL } from "@/lib/api/cache";
import type { HistoricalDataPoint } from "@/types/pollen";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Invalid parameters. Required: lat, lng, from (YYYY-MM-DD), to (YYYY-MM-DD)", source: "ambee" },
      { status: 400 }
    );
  }

  const { lat, lng, from, to } = parsed.data;
  const cacheKey = `history:${lat.toFixed(2)}:${lng.toFixed(2)}:${from}:${to}`;

  const cached = cacheGet<HistoricalDataPoint[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, error: null, source: "cache" });
  }

  const history = await fetchAmbeeHistory(lat, lng, from, to);

  if (!history) {
    return NextResponse.json(
      { data: null, error: "Unable to fetch historical data", source: "ambee" },
      { status: 502 }
    );
  }

  cacheSet(cacheKey, history, TTL.HISTORY);

  return NextResponse.json({ data: history, error: null, source: "ambee" });
}
