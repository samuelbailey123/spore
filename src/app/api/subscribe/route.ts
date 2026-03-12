import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";

const subscribeSchema = z.object({
  email: z.email(),
  allergens: z.array(z.string()).min(1, "At least one allergen required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  locationName: z.string().min(1),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/subscribe
 * Creates or updates a Resend contact with allergen and location custom properties.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, allergens, lat, lng, locationName } = parsed.data;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      return NextResponse.json(
        { error: "Email subscriptions are not configured" },
        { status: 503 }
      );
    }

    const resend = getResend();

    const contactData = JSON.stringify({ allergens, lat, lng, locationName });

    await resend.contacts.create({
      audienceId,
      email,
      firstName: contactData,
      unsubscribed: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Subscription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
