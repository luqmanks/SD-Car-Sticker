import { NextResponse } from "next/server"
import { db } from "@/lib/supabase"
import { normalizePhone } from "@/lib/phone"
import { getSessionUser, hashSecret, verifySecret } from "@/lib/session"

/** Sets the signed-in user's phone number and 4-digit PIN. Changing the PIN requires the account password. */
export async function PATCH(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const { phoneNumber, pin, password } = await req.json().catch(() => ({}))
  const update: Record<string, string> = {}

  if (phoneNumber !== undefined) {
    const phone = typeof phoneNumber === "string" ? normalizePhone(phoneNumber) : null
    if (!phone) return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 })
    update.phone_number = phone
  }

  if (pin !== undefined) {
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 })
    }
    const { data } = await db().from("users").select("password_hash").eq("id", user.id).single()
    if (typeof password !== "string" || !data || !(await verifySecret(password, data.password_hash))) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }
    update.pin_hash = await hashSecret(pin)
  }

  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  const { error } = await db().from("users").update(update).eq("id", user.id)
  if (error) return NextResponse.json({ error: "Could not update profile" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
