import "server-only"
import { NextResponse } from "next/server"
import { db } from "@/lib/supabase"
import { findCar } from "@/lib/cars"
import { resolveRecipient, sendSms, type SendResult } from "@/lib/zavu"

const COOLDOWN_SECONDS = 60

/**
 * Flow for the anonymous notify endpoint: look up the car, enforce a per-car cooldown,
 * send the SMS through Zavu, and record the attempt in scan_events. `compose` builds the full SMS text
 * for the car's plate, and that same text is returned so the sender can see what the owner received.
 */
export async function contactOwner(
  req: Request,
  kind: "sms",
  alertType: string,
  compose: (plate: string) => string,
) {
  const { plate, code } = await req.json().catch(() => ({}))
  const car = await findCar({
    plate: typeof plate === "string" ? plate : undefined,
    code: typeof code === "string" ? code : undefined,
  })
  if (!car) return NextResponse.json({ error: "This car is not registered with SD Car Sticker" }, { status: 404 })
  if (!car.ownerPhone) return NextResponse.json({ error: "The owner has no phone number on file" }, { status: 422 })

  const since = new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString()
  const { count } = await db()
    .from("scan_events")
    .select("id", { count: "exact", head: true })
    .eq("plate_number", car.plateNumber)
    .eq("kind", kind)
    .eq("status", "sent")
    .gte("created_at", since)
  if (count) {
    return NextResponse.json(
      { error: `The owner was just contacted. Please wait ${COOLDOWN_SECONDS} seconds.` },
      { status: 429 },
    )
  }

  const to = resolveRecipient(car.ownerPhone)
  const message = compose(car.plateNumber)
  const result: SendResult = to ? await sendSms(to, message) : { ok: false, error: "Invalid owner phone number" }
  await db()
    .from("scan_events")
    .insert({
      plate_number: car.plateNumber,
      kind,
      alert_type: alertType,
      status: result.ok ? "sent" : "failed",
      detail: result.ok ? result.id : result.error,
    })

  if (!result.ok) {
    console.error(`[${kind}] ${car.plateNumber}: ${result.error}`)
    const reason = process.env.NODE_ENV !== "production" ? ` (${result.error})` : ""
    return NextResponse.json(
      { error: `We couldn't reach the owner right now. Please try again.${reason}` },
      { status: 502 },
    )
  }
  return NextResponse.json({ ok: true, plateNumber: car.plateNumber, doubleParkActive: car.carStatus, message })
}
