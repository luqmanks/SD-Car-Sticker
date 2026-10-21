"use client"

import { useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  QrCode,
  Clock,
  Bell,
  AlertTriangle,
  Car,
  KeyRound,
  CarFront,
  Lightbulb,
  DoorOpen,
  Wallet,
  Siren,
  CircleAlert,
  MessageSquare,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StickerLookup, type CarRef } from "@/components/sticker-lookup"
import { api } from "@/hooks/use-session"

type Phase = "lookup" | "choose" | "sending" | "notified"

// The ids must match ENQUIRIES in app/api/notify/route.ts. "" means just the blocked notification.
const ENQUIRIES: { id: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: "", label: "Just blocking me", Icon: Car },
  { id: "keys", label: "Owner left car keys inside", Icon: KeyRound },
  { id: "crash", label: "Someone crashed into the car", Icon: CarFront },
  { id: "lights", label: "Owner forgot to turn off the lights", Icon: Lightbulb },
  { id: "window", label: "Window or door left open", Icon: DoorOpen },
  { id: "valuables", label: "Valuables visible inside", Icon: Wallet },
  { id: "alarm", label: "Car alarm is going off", Icon: Siren },
  { id: "tyre", label: "Flat tyre", Icon: CircleAlert },
  { id: "other", label: "Custom message", Icon: MessageSquare },
]

const CUSTOM_MAX = 90

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("lookup")
  const [ref, setRef] = useState<CarRef>({})
  const [enquiry, setEnquiry] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [plateNumber, setPlateNumber] = useState("")
  const [sentMessage, setSentMessage] = useState("")
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

  const selected = ENQUIRIES.find((e) => e.id === enquiry) ?? ENQUIRIES[0]
  const customMissing = enquiry === "other" && !customMessage.trim()

  const handleResolve = (carRef: CarRef) => {
    setRef(carRef)
    setPlateNumber(carRef.plate ?? "")
    setError("")
    setPhase("choose")
  }

  const notifyOwner = async () => {
    setError("")
    setPhase("sending")
    try {
      const data = await api<{ plateNumber: string; message: string }>("/api/notify", "POST", {
        ...ref,
        type: "blocked",
        enquiry,
        message: customMessage,
      })
      setPlateNumber(data.plateNumber)
      setSentMessage(data.message)
      setScanTime(new Date())
      setPhase("notified")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setPhase("choose")
    }
  }

  const remindOwner = async () => {
    setRemindState("sending")
    setRemindError("")
    try {
      await api("/api/notify", "POST", { plate: plateNumber, type: "blocked", enquiry, message: customMessage })
      setRemindState("sent")
    } catch (e) {
      setRemindError(e instanceof Error ? e.message : "Could not send the reminder")
      setRemindState("idle")
    }
  }

  const notified = phase === "notified"
  const choosing = phase === "choose" || phase === "sending"

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-[#00A86B] mb-6 hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <Card className={`mx-auto shadow-lg ${choosing ? "max-w-2xl" : "max-w-md"}`}>
          <CardHeader className={`text-white rounded-t-lg ${notified ? "bg-[#4CAF50]" : "bg-[#00A86B]"}`}>
            <div className="flex items-center">
              <Image src="/images/sd-logo.svg" alt="SD Car Sticker logo" width={36} height={36} className="mr-2" />
              <div>
                <CardTitle className="text-2xl flex items-center">
                  {notified ? <Clock className="mr-2 h-6 w-6" /> : <QrCode className="mr-2 h-6 w-6" />}
                  {notified ? "Owner Notified" : choosing ? "Notify the Car Owner" : "Find the Car Owner"}
                </CardTitle>
                <CardDescription className="text-white/90">
                  {notified
                    ? "The car owner has been sent an SMS"
                    : choosing
                      ? "Pick what the owner needs to know, then notify them"
                      : "Tap the NFC sticker on the car blocking you"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {phase === "lookup" && (
              <StickerLookup
                buttonClass="bg-[#00A86B] hover:bg-[#008f5b]"
                onResolve={handleResolve}
                resolveLabel="Continue"
              />
            )}

            {choosing && (
              <div className="grid gap-6 md:grid-cols-[1fr_14rem]">
                {/* Left: enquiry */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[#212121]">Enquiry</h3>
                  <div role="radiogroup" aria-label="Enquiry" className="space-y-2">
                    {ENQUIRIES.map(({ id, label, Icon }) => {
                      const active = enquiry === id
                      return (
                        <button
                          key={id || "none"}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={phase === "sending"}
                          onClick={() => setEnquiry(id)}
                          className={`flex w-full items-center rounded-lg border p-3 text-left text-sm transition-colors ${
                            active
                              ? "border-[#00A86B] bg-[#00A86B]/10 text-[#212121] font-medium"
                              : "border-[#E0E0E0] bg-white text-[#212121] hover:bg-[#F5F5F5]"
                          }`}
                        >
                          <Icon className="mr-2 h-5 w-5 flex-shrink-0 text-[#00A86B]" />
                          <span className="flex-1">{label}</span>
                          {active && <Check className="h-4 w-4 text-[#00A86B]" />}
                        </button>
                      )
                    })}
                  </div>

                  {enquiry === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customMessage">Your message to the owner</Label>
                      <Textarea
                        id="customMessage"
                        placeholder="e.g., Your boot is not closed properly"
                        maxLength={CUSTOM_MAX}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        disabled={phase === "sending"}
                        className="min-h-[90px]"
                      />
                      <p className="text-xs text-[#212121]/70">
                        {customMessage.length}/{CUSTOM_MAX} characters. Links aren&apos;t allowed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: notify */}
                <div className="space-y-4 md:self-start">
                  <div className="bg-[#F5F5F5] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#212121]">Car:</span>
                      <span className="font-bold text-[#212121]">{ref.plate ?? "SD Car Sticker"}</span>
                    </div>
                    <div className="text-sm text-[#212121]">
                      <span>Reason: </span>
                      <span className="font-bold">{selected.label}</span>
                    </div>
                  </div>

                  <Button
                    onClick={notifyOwner}
                    disabled={phase === "sending" || customMissing}
                    className="w-full bg-[#00A86B] hover:bg-[#008f5b] text-lg py-6"
                  >
                    {phase === "sending" ? "Notifying..." : "Notify the owner"}
                    <Bell className="ml-2 h-5 w-5" />
                  </Button>
                  {error && <p className="text-sm text-[#F44336] bg-[#F44336]/10 p-3 rounded-md">{error}</p>}
                  <Button
                    variant="ghost"
                    className="w-full"
                    disabled={phase === "sending"}
                    onClick={() => {
                      setPhase("lookup")
                      setError("")
                    }}
                  >
                    Not this car?
                  </Button>
                </div>
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
                      <span className="text-sm text-[#212121]">Reason:</span>
                      <span className="text-sm font-bold text-[#212121]">{selected.label}</span>
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
                  <h3 className="font-bold text-[#212121] mb-2">Message sent to the owner</h3>
                  <p className="text-sm text-[#212121] bg-white border border-[#E0E0E0] rounded-lg p-3 break-words">
                    {sentMessage}
                  </p>
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
