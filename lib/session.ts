import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { db } from "@/lib/supabase"

const COOKIE = "sd_session"
const MAX_AGE = 60 * 60 * 24 * 7

export type SessionUser = {
  id: string
  email: string
  phoneNumber: string | null
  hasPin: boolean
}

function secret() {
  const s = process.env.AUTH_JWT_SECRET
  if (!s || s.length < 32) throw new Error("AUTH_JWT_SECRET must be set (32+ characters)")
  return new TextEncoder().encode(s)
}

export const hashSecret = (value: string) => bcrypt.hash(value, 10)
export const verifySecret = (value: string, hash: string) => bcrypt.compare(value, hash)

export async function startSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  })
}

export async function endSession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

/** Returns the signed-in user, or null. The PIN and password hashes never leave the server. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (!payload.sub) return null
    const { data } = await db()
      .from("users")
      .select("id, email, phone_number, pin_hash")
      .eq("id", payload.sub)
      .maybeSingle()
    if (!data) return null
    return { id: data.id, email: data.email, phoneNumber: data.phone_number, hasPin: !!data.pin_hash }
  } catch {
    return null
  }
}
