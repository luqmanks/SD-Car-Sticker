import { NextResponse } from "next/server"
import { db } from "@/lib/supabase"
import { startSession, verifySecret } from "@/lib/session"

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }
  const { data } = await db()
    .from("users")
    .select("id, password_hash")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle()

  if (!data || !(await verifySecret(password, data.password_hash))) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
  }
  await startSession(data.id)
  return NextResponse.json({ ok: true })
}
