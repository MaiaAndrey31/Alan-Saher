import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations/booking";

/**
 * Booking form submission endpoint. No email/CRM integration is wired up
 * yet — this validates the payload and responds successfully so the UI can
 * be built and tested end-to-end. See README > "Como configurar formulário"
 * for how to connect a real provider (e.g. Resend, SMTP, a CRM webhook).
 *
 * Example of what to add once a provider is chosen:
 *   await resend.emails.send({
 *     from: "booking@alansaher.com",
 *     to: process.env.BOOKING_NOTIFY_EMAIL,
 *     subject: `New booking request — ${data.city}`,
 *     text: JSON.stringify(data, null, 2),
 *   });
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = bookingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  // TODO: forward `result.data` to email/CRM once a provider is configured.
  console.info("[booking] request received", { city: result.data.city, eventType: result.data.eventType });

  return NextResponse.json({ ok: true });
}
