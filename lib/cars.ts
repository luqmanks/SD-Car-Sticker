import "server-only"
import { db } from "@/lib/supabase"

export const normalizePlate = (plate: string) => plate.replace(/\s+/g, "").toUpperCase()

export type CarWithOwner = {
  plateNumber: string
  carStatus: boolean
  ownerPhone: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Finds a car (and its owner's phone) by the NFC sticker code or by plate number. A `code` that isn't a
 * UUID can't be a sticker code, so it is treated as a plate (e.g. /blocked/scan?code=W1).
 */
export async function findCar(ref: { plate?: string; code?: string }): Promise<CarWithOwner | null> {
  let query = db().from("cars").select("plate_number, car_status, users(phone_number)")
  if (ref.code && UUID.test(ref.code)) query = query.eq("nfc_code", ref.code)
  else if (ref.plate || ref.code) query = query.eq("plate_number", normalizePlate((ref.plate || ref.code)!))
  else return null
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  const owner = data.users as unknown as { phone_number: string | null } | null
  return { plateNumber: data.plate_number, carStatus: data.car_status, ownerPhone: owner?.phone_number ?? null }
}
