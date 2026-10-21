import { NextResponse } from "next/server"
import { db } from "@/lib/supabase"
import { normalizePlate } from "@/lib/cars"
import { getSessionUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  const { data, error } = await db()
    .from("cars")
    .select("plate_number, car_status, activated_at, nfc_code")
    .eq("user_id", user.id)
    .order("created_at")
  if (error) return NextResponse.json({ error: "Could not load cars" }, { status: 500 })
  return NextResponse.json(
    data.map((c) => ({
      plateNumber: c.plate_number,
      carStatus: c.car_status,
      activatedAt: c.activated_at,
      nfcCode: c.nfc_code,
    })),
  )
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  const { plateNumber } = await req.json().catch(() => ({}))
  if (typeof plateNumber !== "string" || !/^[A-Za-z0-9 ]{2,12}$/.test(plateNumber.trim())) {
    return NextResponse.json({ error: "Enter a valid plate number" }, { status: 400 })
  }
  const { data, error } = await db()
    .from("cars")
    .insert({ plate_number: normalizePlate(plateNumber), user_id: user.id })
    .select("plate_number, nfc_code")
    .single()
  if (error) {
    const exists = error.code === "23505"
    return NextResponse.json(
      { error: exists ? "This plate number is already registered" : "Could not register car" },
      { status: exists ? 409 : 500 },
    )
  }
  return NextResponse.json({ plateNumber: data.plate_number, nfcCode: data.nfc_code }, { status: 201 })
}
