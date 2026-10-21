import { contactOwner } from "@/lib/contact-owner"
import { sendSms } from "@/lib/zavu"

// Predefined SMS templates. Malaysia's SMS rules: start with "RM0.00 ", name the brand, and no URLs.
// Plain ASCII keeps each message in one 160-character GSM-7 segment. {plate} is the car's plate number.
const HEADER = "RM0.00 SD Car Sticker: "
const TEMPLATES: Record<string, string> = {
  blocked: "Your car {plate} is blocking someone. Please move it as soon as you can.",
  lights: "The lights on your car {plate} are on. This may drain your battery.",
  valuables: "Valuables are visible inside your car {plate}. Please check on it.",
  security: "There may be a security concern with your car {plate}. Please check on it.",
}

export async function POST(req: Request) {
  // contactOwner consumes the body, so read the alert type from a clone.
  const { type, message } = await req.clone().json().catch(() => ({}))
  const alertType = typeof type === "string" ? type : "blocked"
  const custom = alertType === "other" ? String(message ?? "").replace(/\s+/g, " ").trim().slice(0, 90) : ""
  if (alertType === "other") {
    if (!custom) return Response.json({ error: "Message is required" }, { status: 400 })
    if (/https?:|www\.|\.(com|my|net|org)\b/i.test(custom)) {
      return Response.json({ error: "Links aren't allowed in messages to Malaysian numbers" }, { status: 400 })
    }
  } else if (!TEMPLATES[alertType]) {
    return Response.json({ error: "Unknown alert type" }, { status: 400 })
  }

  return contactOwner(req, "sms", alertType, (to, plate) => {
    const body = alertType === "other" ? `About your car ${plate}: ${custom}` : TEMPLATES[alertType].replace("{plate}", plate)
    return sendSms(to, HEADER + body)
  })
}
