import { NextResponse } from "next/server"
import { findCar } from "@/lib/cars"

export const dynamic = "force-dynamic"

/** Anonymous: turns a sticker code (or plate) into the car's plate number so scan pages can show it. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const car = await findCar({ code: params.get("code") ?? undefined, plate: params.get("plate") ?? undefined })
  if (!car) return NextResponse.json({ error: "This car is not registered with SD Car Sticker" }, { status: 404 })
  return NextResponse.json({ plateNumber: car.plateNumber })
}
