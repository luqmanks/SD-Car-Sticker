import { NextResponse } from "next/server"
import { db } from "@/lib/supabase"
import { normalizePlate } from "@/lib/cars"
import { getSessionUser, verifySecret } from "@/lib/session"

/** Turns double park mode on/off for one of the signed-in user's cars. Requires the 4-digit PIN. */
export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const { plateNumber, status, pin } = await req.json().catch(() => ({}))
  if (typeof plateNumber !== "string" || typeof status !== "boolean") {
    return NextResponse.json({ error: "plateNumber and status are required" }, { status: 400 })
  }

  const { data: owner } = await db().from("users").select("pin_hash").eq("id", user.id).single()
  if (!owner?.pin_hash) return NextResponse.json({ error: "Set a PIN first by registering your car" }, { status: 400 })
  if (typeof pin !== "string" || !(await verifySecret(pin, owner.pin_hash))) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 })
  }

  const { data, error } = await db()
    .from("cars")
    .update({ car_status: status, activated_at: status ? new Date().toISOString() : null })
    .eq("plate_number", normalizePlate(plateNumber))
    .eq("user_id", user.id)
    .select("plate_number, car_status, activated_at")
    .maybeSingle()
  if (error) return NextResponse.json({ error: "Could not update car" }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Car not found" }, { status: 404 })
  return NextResponse.json({ plateNumber: data.plate_number, carStatus: data.car_status, activatedAt: data.activated_at })
}
