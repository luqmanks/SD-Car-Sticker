"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, QrCode, Clock, Bell, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StickerLookup, type CarRef } from "@/components/sticker-lookup"
import { api } from "@/hooks/use-session"

type Phase = "lookup" | "sending" | "notified"

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("lookup")
  const [ref, setRef] = useState<CarRef>({})
  const [plateNumber, setPlateNumber] = useState("")
  const [error, setError] = useState("")
  const [scanTime, setScanTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState("00:00")
  const [remindState, setRemindState] = useState<"idle" | "sending" | "sent">("idle")
  const [remindError, setRemindError] = useState("")
  const [showAuthorities, setShowAuthorities] = useState(false)

  useEffect(() => {
    if (!scanTime) return
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - scanTime.getTime()) / 1000)
      setElapsedTime(`${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [scanTime])

  const notifyOwner = async (carRef: CarRef) => {
    setRef(carRef)
    setError("")
    setPhase("sending")
    try {
      const data = await api<{ plateNumber: string }>("/api/notify", "POST", { ...carRef, type: "blocked" })
      setPlateNumber(data.plateNumber)
      setScanTime(new Date())
      setPhase("notified")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setPhase("lookup")
    }
  }

  const remindOwner = async () => {
    setRemindState("sending")
    setRemindError("")
    try {
      await api("/api/notify", "POST", { plate: plateNumber, type: "blocked" })
      setRemindState("sent")
    } catch (e) {
      setRemindError(e instanceof Error ? e.message : "Could not send the reminder")
      setRemindState("idle")
    }
  }

  const notified = phase === "notified"

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-[#00A86B] mb-6 hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader className={`text-white rounded-t-lg ${notified ? "bg-[#4CAF50]" : "bg-[#00A86B]"}`}>
            <div className="flex items-center">
              <Image src="/images/sd-logo.svg" alt="SD Car Sticker logo" width={36} height={36} className="mr-2" />
              <div>
                <CardTitle className="text-2xl flex items-center">
                  {notified ? <Clock className="mr-2 h-6 w-6" /> : <QrCode className="mr-2 h-6 w-6" />}
                  {notified ? "Owner Notified" : "Find the Car Owner"}
                </CardTitle>
                <CardDescription className="text-white/90">
                  {notified
                    ? "The car owner has been sent an SMS"
                    : "Tap the NFC sticker on the car blocking you"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {phase !== "notified" && (
              <div className="space-y-4">
                {error && <p className="text-sm text-[#F44336] bg-[#F44336]/10 p-3 rounded-md">{error}</p>}
                {phase === "sending" ? (
                  <p className="text-center text-[#212121] py-8">Notifying the owner...</p>
                ) : (
                  <StickerLookup buttonClass="bg-[#00A86B] hover:bg-[#008f5b]" onResolve={notifyOwner} />
                )}
              </div>
            )}

            {notified && (
              <div className="space-y-6">
                <div className="bg-[#F5F5F5] p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#212121]">Status</h3>
                    <span className="bg-[#4CAF50] text-white px-3 py-1 rounded-full text-sm">Owner Notified</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#212121]">Car Plate:</span>
                      <span className="text-sm font-bold text-[#212121]">{plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#212121]">Waiting time:</span>
                      <span className="text-sm font-bold text-[#212121] flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-[#FFC107]" />
                        {elapsedTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F5F5] p-6 rounded-lg">
                  <h3 className="font-bold text-[#212121] mb-2">What happens now?</h3>
                  <p className="text-sm text-[#212121]">
                    The owner should move their car soon. If nothing happens in a few minutes, you can send another reminder.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={remindOwner}
                    disabled={remindState !== "idle"}
                    variant="outline"
                    className="w-full border-[#00A86B] text-[#00A86B] py-4"
                  >
                    <Bell className="mr-2 h-5 w-5" />
                    {remindState === "sending"
                      ? "Sending..."
                      : remindState === "sent"
                        ? "Reminder sent"
                        : "Send another reminder SMS"}
                  </Button>
                  {remindError && <p className="text-sm text-[#F44336]">{remindError}</p>}

                  <Button
                    onClick={() => setShowAuthorities(!showAuthorities)}
                    className="w-full bg-[#FFC107] hover:bg-[#e6ae06] text-white py-4"
                  >
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Still blocked? Contact authorities
                  </Button>
                  {showAuthorities && (
                    <div className="bg-white border rounded-lg p-4 text-sm text-[#212121] space-y-2">
                      <p>
                        SD Car Sticker can&apos;t dispatch the authorities for you. For an obstructed vehicle, contact
                        your local council (PBT) or traffic police.
                      </p>
                      <p>
                        In an emergency, call{" "}
                        <a href="tel:999" className="font-bold text-[#00A86B] underline">
                          999
                        </a>
                        .
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-[#212121]">
              {notified ? "Thank you for your patience" : "Can't find a sticker? The car might not be registered."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
