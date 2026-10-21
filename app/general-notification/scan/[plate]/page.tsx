import { redirect } from "next/navigation"

export default async function AlertByPlate({ params }: { params: Promise<{ plate: string }> }) {
  const { plate } = await params
  redirect(`/general-notification/scan?plate=${encodeURIComponent(decodeURIComponent(plate))}`)
}
