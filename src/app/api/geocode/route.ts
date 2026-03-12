import { NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().min(1).max(200),
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  name: string;
  fullAddress: string;
}

function formatName(result: NominatimResult): string {
  const addr = result.address;
  if (!addr) return result.display_name.split(",").slice(0, 2).join(",").trim();

  const city = addr.city ?? addr.town ?? addr.village;
  const parts: string[] = [];

  if (!city && addr.postcode) parts.push(addr.postcode);
  if (city) parts.push(city);
  if (addr.state) parts.push(addr.state);

  return parts.length > 0 ? parts.join(", ") : result.display_name.split(",").slice(0, 2).join(",").trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { data: [], error: "Search query is required" },
      { status: 400 }
    );
  }

  const { q } = parsed.data;

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
  nominatimUrl.searchParams.set("q", q);
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("limit", "5");
  nominatimUrl.searchParams.set("addressdetails", "1");

  const response = await fetch(nominatimUrl.toString(), {
    headers: {
      "User-Agent": "Spore/1.0 (pollen dashboard)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    return NextResponse.json(
      { data: [], error: "Geocoding service unavailable" },
      { status: 502 }
    );
  }

  const results: NominatimResult[] = await response.json();

  const data: GeocodeResult[] = results.map((r) => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    name: formatName(r),
    fullAddress: r.display_name,
  }));

  return NextResponse.json({ data, error: null });
}
