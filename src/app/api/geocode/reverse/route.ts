import { NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

interface NominatimReverseResult {
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

/**
 * Reverse geocodes coordinates to a human-readable location name.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { name: null, error: "Valid lat and lng are required" },
      { status: 400 }
    );
  }

  const { lat, lng } = parsed.data;

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
  nominatimUrl.searchParams.set("lat", lat.toString());
  nominatimUrl.searchParams.set("lon", lng.toString());
  nominatimUrl.searchParams.set("format", "json");
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
      { name: null, error: "Reverse geocoding service unavailable" },
      { status: 502 }
    );
  }

  const result: NominatimReverseResult = await response.json();
  const addr = result.address;

  let name = "Your Location";
  if (addr) {
    const city = addr.city ?? addr.town ?? addr.village;
    const parts: string[] = [];
    if (city) parts.push(city);
    if (addr.state) parts.push(addr.state);
    if (parts.length > 0) {
      name = parts.join(", ");
    }
  }

  return NextResponse.json({ name, error: null });
}
