import { NextResponse } from "next/server"
import { db } from "@/lib/supabase"
import { hashSecret, startSession } from "@/lib/session"

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const { data, error } = await db()
    .from("users")
    .insert({ email: email.trim().toLowerCase(), password_hash: await hashSecret(password) })
    .select("id")
    .single()

  if (error) {
    const taken = error.code === "23505"
    return NextResponse.json(
      { error: taken ? "An account with this email already exists" : "Could not create account" },
      { status: taken ? 409 : 500 },
    )
  }
  await startSession(data.id)
  return NextResponse.json({ ok: true }, { status: 201 })
}
