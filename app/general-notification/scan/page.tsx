"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, AlertCircle, LightbulbOff, Wallet, ShieldAlert, MessageSquare, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StickerLookup, type CarRef } from "@/components/sticker-lookup"
import { api } from "@/hooks/use-session"

type AlertType = "lights" | "valuables" | "security" | "other"

export default function GeneralNotificationScanPage() {
  const [isScanned, setIsScanned] = useState(false)
  const [carRef, setCarRef] = useState<CarRef>({})
  const [plateNumber, setPlateNumber] = useState("")
  const [sentMessage, setSentMessage] = useState("")
  const [alertType, setAlertType] = useState<AlertType>("lights")
  const [customMessage, setCustomMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleResolve = (ref: CarRef) => {
    setCarRef(ref)
    setPlateNumber(ref.plate?.toUpperCase().replace(/[ \t]+/g, "") ?? "your selected car")
    setIsScanned(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      const data = await api<{ plateNumber: string; message: string }>("/api/notify", "POST", {
        ...carRef,
        type: alertType,
        message: customMessage,
      })
      setPlateNumber(data.plateNumber)
      setSentMessage(data.message)
      setIsSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the alert")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "lights":
        return <LightbulbOff className="h-5 w-5" />
      case "valuables":
        return <Wallet className="h-5 w-5" />
      case "security":
        return <ShieldAlert className="h-5 w-5" />
      case "other":
        return <MessageSquare className="h-5 w-5" />
    }
  }

  const getAlertTitle = (type: AlertType) => {
    switch (type) {
      case "lights":
        return "Lights Left On"
      case "valuables":
        return "Exposed Valuables"
      case "security":
        return "Security Concern"
      case "other":
        return "Custom Message"
    }
  }

  const getAlertDescription = (type: AlertType) => {
    switch (type) {
      case "lights":
        return "Your car lights have been left on. This might drain your battery."
      case "valuables":
        return "There are visible valuables in your car that might attract thieves."
      case "security":
        return "There's a security concern with your vehicle that needs your attention."
      case "other":
        return customMessage
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-[#00A86B] mb-6 hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader className="bg-[#FFC107] text-white rounded-t-lg">
            <div className="flex items-center">
              <Image src="/images/sd-logo.svg" alt="SD Car Sticker logo" width={36} height={36} className="mr-2" />
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <AlertCircle className="mr-2 h-6 w-6" />
                  Send Car Alert
                </CardTitle>
                <CardDescription className="text-white/90">
                  Notify a car owner about non-emergency issues
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {!isScanned && !isSuccess && (
              <StickerLookup buttonClass="bg-[#FFC107] hover:bg-[#e6ae06] text-white" onResolve={handleResolve} />
            )}

            {isScanned && !isSuccess && (
              <div className="space-y-6">
                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#212121]">Car Plate:</span>
                    <span className="text-sm font-bold text-[#212121]">{plateNumber}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[#212121]">Select Alert Type:</h3>

                  <RadioGroup
                    value={alertType}
                    onValueChange={(value) => setAlertType(value as AlertType)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-[#E0E0E0]">
                      <RadioGroupItem value="lights" id="lights" />
                      <Label htmlFor="lights" className="flex items-center cursor-pointer">
                        <LightbulbOff className="h-5 w-5 mr-2 text-[#FFC107]" />
                        <span>Lights Left On</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-[#E0E0E0]">
                      <RadioGroupItem value="valuables" id="valuables" />
                      <Label htmlFor="valuables" className="flex items-center cursor-pointer">
                        <Wallet className="h-5 w-5 mr-2 text-[#FFC107]" />
                        <span>Exposed Valuables</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-[#E0E0E0]">
                      <RadioGroupItem value="security" id="security" />
                      <Label htmlFor="security" className="flex items-center cursor-pointer">
                        <ShieldAlert className="h-5 w-5 mr-2 text-[#FFC107]" />
                        <span>Security Concern (broken window, etc.)</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-[#E0E0E0]">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="flex items-center cursor-pointer">
                        <MessageSquare className="h-5 w-5 mr-2 text-[#FFC107]" />
                        <span>Other (custom message)</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {alertType === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customMessage">Your Message:</Label>
                      <Textarea
                        id="customMessage"
                        placeholder="Enter your message to the car owner..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (alertType === "other" && !customMessage.trim())}
                  className="w-full bg-[#FFC107] hover:bg-[#e6ae06] text-white py-4"
                >
                  {isSubmitting ? "Sending..." : "Send Alert to Owner"}
                  <AlertCircle className="ml-2 h-5 w-5" />
                </Button>
                {error && <p className="text-sm text-[#F44336]">{error}</p>}
              </div>
            )}

            {isSuccess && (
              <div className="space-y-6">
                <div className="bg-[#4CAF50] text-white p-6 rounded-lg text-center">
                  <Check className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="font-bold text-xl mb-2">Alert Sent Successfully!</h3>
                  <p>The car owner has been notified about this issue.</p>
                </div>

                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <h3 className="font-medium text-[#212121] mb-2">Alert Details:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#212121]">Car Plate:</span>
                      <span className="text-sm font-bold text-[#212121]">{plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#212121]">Alert Type:</span>
                      <span className="text-sm font-bold text-[#212121] flex items-center">
                        {getAlertIcon(alertType)}
                        <span className="ml-1">{getAlertTitle(alertType)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <h3 className="font-medium text-[#212121] mb-2">Message sent to the owner:</h3>
                  <p className="text-sm text-[#212121] bg-white border border-[#E0E0E0] rounded-lg p-3 break-words">
                    {sentMessage}
                  </p>
                </div>

                <div className="space-y-4">
                  <Link href="/">
                    <Button className="w-full bg-[#00A86B] hover:bg-[#008f5b]">Return to Home</Button>
                  </Link>

                  <Link href="/general-notification/scan">
                    <Button variant="outline" className="w-full border-[#FFC107] text-[#FFC107]">
                      Send Another Alert
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-[#212121]">
              {isScanned && !isSuccess
                ? "Your identity will remain anonymous when sending alerts"
                : isSuccess
                  ? "Thank you for helping keep our community safe"
                  : "Can't find a sticker? The car might not be registered."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
