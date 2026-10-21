"use client"

import { useCallback, useEffect, useState } from "react"

export type SessionUser = {
  id: string
  email: string
  phoneNumber: string | null
  hasPin: boolean
}

/** Reads the signed-in user from the httpOnly session cookie via /api/auth/me. */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => {
        if (!cancelled) {
          setUser(data)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    window.location.href = "/"
  }, [])

  return { user, loading, logout }
}

/** POSTs/PUTs JSON and returns the parsed body; throws Error(message) on a non-2xx response. */
export async function api<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.")
  return data as T
}
