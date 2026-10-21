import { redirect } from "next/navigation"

// Shareable link: /blocked/scan/ABC1234 -> the scan page with the plate pre-filled.
export default async function BlockedByPlate({ params }: { params: Promise<{ plate: string }> }) {
  const { plate } = await params
  redirect(`/blocked/scan?plate=${encodeURIComponent(decodeURIComponent(plate))}`)
}
