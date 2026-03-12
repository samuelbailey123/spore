import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";

const unsubscribeSchema = z.object({
  email: z.email(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/unsubscribe
 * Marks a Resend contact as unsubscribed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = unsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: "Email subscriptions are not configured" },
        { status: 503 }
      );
    }

    const resend = getResend();

    const { data: contacts } = await resend.contacts.list({ audienceId });
    const contact = contacts?.data?.find(
      (c) => c.email === parsed.data.email
    );

    if (contact) {
      await resend.contacts.update({
        audienceId,
        id: contact.id,
        unsubscribed: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unsubscribe failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
