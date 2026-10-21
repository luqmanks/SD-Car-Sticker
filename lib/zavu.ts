import "server-only"
import { normalizePhone } from "@/lib/phone"

export type SendResult = { ok: true; id: string } | { ok: false; error: string }

/** While testing, every SMS goes to TEST_PHONE_OVERRIDE instead of the real owner. */
export function resolveRecipient(ownerPhone: string): string | null {
  return normalizePhone(process.env.TEST_PHONE_OVERRIDE || ownerPhone)
}

/**
 * POST https://api.zavu.dev/v1/messages on the one-way SMS channel (a Zavu sender created with
 * enableSmsOneway: true). It needs no purchased phone number. `text` must already follow Malaysia's
 * rules: start with "RM0.00 ", name the brand, and contain no URLs.
 */
export async function sendSms(to: string, text: string): Promise<SendResult> {
  const key = process.env.ZAVU_API_KEY
  if (!key) return { ok: false, error: "ZAVU_API_KEY is not set" }
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
  // Optional: pin a specific sender; otherwise Zavu uses the project's default sender.
  if (process.env.ZAVU_SENDER_ID) headers["Zavu-Sender"] = process.env.ZAVU_SENDER_ID
  try {
    const res = await fetch("https://api.zavu.dev/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({ to, text, channel: "sms_oneway" }),
      signal: AbortSignal.timeout(15000),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.message ?? data.code ?? `Zavu returned HTTP ${res.status}` }
    return { ok: true, id: data.message?.id ?? "queued" }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Zavu request failed" }
  }
}
