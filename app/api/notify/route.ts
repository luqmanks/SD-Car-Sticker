import { contactOwner } from "@/lib/contact-owner"

// Predefined SMS templates. Malaysia's SMS rules: start with "RM0.00 ", name the brand, and no URLs.
// Plain ASCII keeps each message in one 160-character GSM-7 segment. {plate} is the car's plate number.
const HEADER = "RM0.00 Sime Darby Car Sticker: "
const TEMPLATES: Record<string, string> = {
  blocked: "Your car {plate} is blocking someone. Please move it as soon as you can.",
  lights: "The lights on your car {plate} are on. This may drain your battery.",
  valuables: "Valuables are visible inside your car {plate}. Please check on it.",
  security: "There may be a security concern with your car {plate}. Please check on it.",
}

// Extra reasons a blocked driver can attach to the "blocked" notification. They are appended to the
// blocked sentence, so a "blocked" message can say why the owner needs to come back.
const ENQUIRIES: Record<string, string> = {
  keys: "Your car keys look like they are still inside the car.",
  crash: "Someone has crashed into your car.",
  lights: "Your car lights are still on.",
  window: "Your car window or door is open.",
  valuables: "Valuables are visible inside your car.",
  alarm: "Your car alarm is going off.",
  tyre: "Your car seems to have a flat tyre.",
}

// Header + "About your car {plate}: " plus the custom text must stay under 160 characters.
const CUSTOM_MAX = 90

/** Collapses whitespace, caps the length and rejects URLs, which Malaysian numbers don't accept. */
function cleanCustom(raw: unknown, max: number): { text: string } | { error: string } {
  const text = String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, max)
  if (!text) return { error: "Message is required" }
  if (/https?:|www\.|\.(com|my|net|org)\b/i.test(text)) {
    return { error: "Links aren't allowed in messages to Malaysian numbers" }
  }
  return { text }
}

export async function POST(req: Request) {
  // contactOwner consumes the body, so read the alert type from a clone.
  const { type, message, enquiry } = await req.clone().json().catch(() => ({}))
  const alertType = typeof type === "string" ? type : "blocked"
  const enquiryKey = typeof enquiry === "string" ? enquiry : ""

  // A custom message (from either page) is sent on its own, without the "blocking someone" sentence.
  const isCustom = alertType === "other" || (alertType === "blocked" && enquiryKey === "other")
  let custom = ""
  let enquiryText = ""
  if (isCustom) {
    const result = cleanCustom(message, CUSTOM_MAX)
    if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
    custom = result.text
  } else if (alertType === "blocked" && enquiryKey) {
    if (!ENQUIRIES[enquiryKey]) return Response.json({ error: "Unknown enquiry" }, { status: 400 })
    enquiryText = ENQUIRIES[enquiryKey]
  } else if (!TEMPLATES[alertType]) {
    return Response.json({ error: "Unknown alert type" }, { status: 400 })
  }

  const loggedType = alertType === "blocked" && enquiryKey ? `blocked:${enquiryKey}` : alertType
  return contactOwner(req, "sms", loggedType, (plate) => {
    let body: string
    if (isCustom) body = `About your car ${plate}: ${custom}`
    else if (alertType === "blocked" && enquiryKey) body = `Your car ${plate} is blocking someone. ${enquiryText}`
    else body = TEMPLATES[alertType].replace("{plate}", plate)
    return HEADER + body
  })
}
