/** Normalises a Malaysian-style phone number to E.164 (e.g. 0174020027 -> +60174020027). */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  else if (digits.startsWith("0")) digits = "60" + digits.slice(1)
  if (digits.length < 9 || digits.length > 15) return null
  return "+" + digits
}
