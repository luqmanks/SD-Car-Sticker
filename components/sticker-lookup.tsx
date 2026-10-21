"use client"

import { useEffect, useState } from "react"
import { Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type CarRef = { plate?: string; code?: string }

type Props = {
  /** Tailwind classes for the primary button, e.g. the page's accent colour. */
  buttonClass: string
  onResolve: (ref: CarRef) => void
  /** Label for the confirm button shown when a link pre-fills the car. */
  resolveLabel?: string
}

// Web NFC isn't in the default TS DOM lib.
type NdefReaderCtor = new () => {
  scan: () => Promise<void>
  onreading: ((e: { message: { records: { recordType: string; data: DataView }[] } }) => void) | null
  onreadingerror: (() => void) | null
}

/** Asks the server which plate a sticker code belongs to. */
async function lookupPlate(code: string): Promise<{ plate: string } | { error: string }> {
  try {
    const res = await fetch(`/api/cars/lookup?code=${encodeURIComponent(code)}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { error: data.error ?? "Couldn't look up this sticker" }
    return { plate: data.plateNumber }
  } catch {
    return { error: "Couldn't look up this sticker. Check your connection." }
  }
}

/**
 * Identifies the car: a sticker URL opens this page with ?code=<nfc code>, Chrome on Android can
 * tap a sticker directly (Web NFC), and anyone can type the plate number as a fallback.
 */
export function StickerLookup({ buttonClass, onResolve, resolveLabel = "Notify the owner" }: Props) {
  const [plate, setPlate] = useState("")
  const [nfcSupported, setNfcSupported] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [nfcError, setNfcError] = useState("")
  const [linked, setLinked] = useState<CarRef | null>(null)
  const [linkedError, setLinkedError] = useState("")

  useEffect(() => {
    setNfcSupported("NDEFReader" in window)
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const urlPlate = params.get("plate")
    // A link only pre-fills; the person must confirm, so link previews can't message the owner.
    if (code) {
      setLinked({ code })
      lookupPlate(code).then((result) => {
        if ("plate" in result) setLinked({ code, plate: result.plate })
        else setLinkedError(result.error)
      })
    } else if (urlPlate) setLinked({ plate: urlPlate.replace(/[ \t]+/g, "").toUpperCase() })
  }, [])

  const scanNfc = async () => {
    setNfcError("")
    setScanning(true)
    try {
      const Reader = (window as unknown as { NDEFReader: NdefReaderCtor }).NDEFReader
      const reader = new Reader()
      await reader.scan()
      reader.onreading = ({ message }) => {
        for (const record of message.records) {
          if (record.recordType !== "url" && record.recordType !== "text") continue
          const text = new TextDecoder().decode(record.data)
          const code = text.match(/[?&]code=([0-9a-f-]{36})/i)?.[1]
          if (code) {
            setScanning(false)
            lookupPlate(code).then((result) => {
              if ("plate" in result) onResolve({ code, plate: result.plate })
              else setNfcError(result.error)
            })
            return
          }
        }
        setNfcError("That tag isn't an SD Car Sticker.")
      }
      reader.onreadingerror = () => setNfcError("Couldn't read the tag. Try again.")
    } catch {
      setScanning(false)
      setNfcError("NFC isn't available. Enter the plate number instead.")
    }
  }

  if (linked) {
    return (
      <div className="space-y-4">
        <div className="bg-[#F5F5F5] p-4 rounded-lg text-center">
          <p className="text-sm text-[#212121]/70">
            {linked.plate ? "Car plate" : linkedError ? "Sticker not recognised" : "Looking up the car..."}
          </p>
          {linked.plate && <p className="text-2xl font-bold text-[#212121] tracking-wider">{linked.plate}</p>}
          {linkedError && <p className="text-sm text-[#F44336] mt-1">{linkedError}</p>}
        </div>
        <Button
          onClick={() => onResolve(linked)}
          disabled={!linked.plate && !!linked.code}
          className={`w-full text-lg py-6 ${buttonClass}`}
        >
          {resolveLabel}
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setLinked(null)
            setLinkedError("")
          }}
        >
          Not this car? Enter a different plate
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {nfcSupported && (
        <>
          <Button onClick={scanNfc} disabled={scanning} className={`w-full text-lg py-6 ${buttonClass}`}>
            {scanning ? "Hold your phone near the sticker..." : "Tap NFC Sticker"}
            <Scan className="ml-2 h-5 w-5" />
          </Button>
          {nfcError && <p className="text-sm text-[#F44336]">{nfcError}</p>}
          <p className="text-center text-sm text-[#212121]/70">or enter the plate number</p>
        </>
      )}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (plate.trim()) onResolve({ plate: plate.trim() })
        }}
      >
        <Label htmlFor="plate">Car plate number</Label>
        <Input id="plate" placeholder="e.g., ABC1234" value={plate} onChange={(e) => setPlate(e.target.value)} />
        <Button type="submit" disabled={!plate.trim()} className={`w-full ${buttonClass}`}>
          Continue
        </Button>
      </form>
    </div>
  )
}
