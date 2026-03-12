import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { fetchGooglePollen } from "@/lib/api/google-pollen";
import { fetchAmbeeCurrent } from "@/lib/api/ambee-pollen";
import { mergeCurrentData } from "@/lib/pollen/merge";
import { cacheGet, cacheSet, TTL } from "@/lib/api/cache";
import type { PollenSnapshot } from "@/types/pollen";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  name: z.string().optional().default("Your Location"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Invalid coordinates", source: "merged" },
      { status: 400 }
    );
  }

  const { lat, lng, name } = parsed.data;
  const cacheKey = `current:${lat.toFixed(2)}:${lng.toFixed(2)}`;

  const cached = cacheGet<PollenSnapshot>(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, error: null, source: "cache" });
  }

  const [googleResult, ambeeResult] = await Promise.allSettled([
    fetchGooglePollen(lat, lng, 1),
    fetchAmbeeCurrent(lat, lng),
  ]);

  const google = googleResult.status === "fulfilled" ? googleResult.value : null;
  const ambee = ambeeResult.status === "fulfilled" ? ambeeResult.value : null;

  if (!google && !ambee) {
    return NextResponse.json(
      { data: null, error: "Unable to fetch pollen data from any source", source: "merged" },
      { status: 502 }
    );
  }

  const snapshot = mergeCurrentData(google, ambee, { lat, lng, name });
  cacheSet(cacheKey, snapshot, TTL.CURRENT);

  return NextResponse.json({ data: snapshot, error: null, source: "merged" });
}
