"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  AlertCircle,
  LightbulbOff,
  Wallet,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickerLookup, type CarRef } from "@/components/sticker-lookup";
import { api } from "@/hooks/use-session";

type AlertType = "lights" | "valuables" | "security" | "other";

export default function GeneralNotificationScanPage() {
  const [isScanned, setIsScanned] = useState(false);
  const [carRef, setCarRef] = useState<CarRef>({});
  const [plateNumber, setPlateNumber] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("lights");
  const [customMessage, setCustomMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResolve = (ref: CarRef) => {
    setCarRef(ref);
    setPlateNumber(
      ref.plate?.toUpperCase().replace(/[ \t]+/g, "") ?? "your selected car",
    );
    setIsScanned(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const data = await api<{ plateNumber: string; message: string }>(
        "/api/notify",
        "POST",
        {
          ...carRef,
          type: alertType,
          message: customMessage,
        },
      );
      setPlateNumber(data.plateNumber);
      setSentMessage(data.message);
      setIsSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAlertIcon = (type: AlertType, className?: string) => {
    const defaultClass = className || "h-5 w-5";
    switch (type) {
      case "lights":
        return <LightbulbOff className={defaultClass} />;
      case "valuables":
        return <Wallet className={defaultClass} />;
      case "security":
        return <ShieldAlert className={defaultClass} />;
      case "other":
        return <MessageSquare className={defaultClass} />;
    }
  };

  const getAlertTitle = (type: AlertType) => {
    switch (type) {
      case "lights":
        return "Lights Left On";
      case "valuables":
        return "Exposed Valuables";
      case "security":
        return "Security Concern";
      case "other":
        return "Custom Message";
    }
  };

  const getAlertDescription = (type: AlertType) => {
    switch (type) {
      case "lights":
        return "Your car lights have been left on. This might drain your battery.";
      case "valuables":
        return "There are visible valuables in your car that might attract thieves.";
      case "security":
        return "There's a security concern with your vehicle that needs your attention.";
      case "other":
        return customMessage;
    }
  };

  return (
    <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12">
      <div className="container mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg border-border/50 overflow-hidden">
          <CardHeader className="bg-accent/10 border-b border-accent/20 pb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/sydepark-logo.svg"
                alt="SD Car Sticker logo"
                width={44}
                height={44}
                className="shrink-0 drop-shadow-sm"
              />
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-foreground">
                  <AlertCircle className="h-6 w-6 text-accent" />
                  Send Car Alert
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Notify a car owner about non-emergency issues
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {!isScanned && !isSuccess && (
              <StickerLookup
                buttonClass="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onResolve={handleResolve}
              />
            )}

            {isScanned && !isSuccess && (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center border border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">
                    Target Vehicle:
                  </span>
                  <span className="text-base font-bold tracking-wider text-foreground">
                    {plateNumber}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Select Alert Type
                  </h3>

                  <RadioGroup
                    value={alertType}
                    onValueChange={(value) => setAlertType(value as AlertType)}
                    className="space-y-3"
                  >
                    {(
                      [
                        "lights",
                        "valuables",
                        "security",
                        "other",
                      ] as AlertType[]
                    ).map((type) => (
                      <Label
                        key={type}
                        htmlFor={type}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          alertType === type
                            ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                            : "border-border hover:border-accent/50 hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value={type} id={type} />
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`${alertType === type ? "text-accent" : "text-muted-foreground"}`}
                          >
                            {getAlertIcon(type)}
                          </div>
                          <span className="font-medium">
                            {getAlertTitle(type)}
                          </span>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  {alertType === "other" && (
                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="customMessage">Your Message</Label>
                      <Textarea
                        id="customMessage"
                        placeholder="Enter your message to the car owner..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="min-h-[100px] focus-visible:ring-accent"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      (alertType === "other" && !customMessage.trim())
                    }
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base font-semibold shadow-md transition-all"
                  >
                    {isSubmitting ? "Sending..." : "Send Alert to Owner"}
                    {!isSubmitting && <AlertCircle className="ml-2 h-5 w-5" />}
                  </Button>
                  {error && (
                    <p className="text-sm font-medium text-destructive text-center">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-xl text-center">
                  <CheckCircle2 className="h-14 w-14 mx-auto mb-3 text-emerald-500" />
                  <h3 className="font-bold text-xl mb-2 tracking-tight">
                    Alert Sent Successfully!
                  </h3>
                  <p className="text-emerald-700/80 text-sm">
                    The car owner has been notified about this issue.
                  </p>
                </div>

                <div className="bg-muted/50 p-5 rounded-xl border border-border/50 space-y-4">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                    Alert Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Car Plate
                      </span>
                      <span className="text-sm font-bold tracking-wider text-foreground">
                        {plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Issue Type
                      </span>
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {getAlertIcon(alertType, "h-4 w-4 text-accent")}
                        {getAlertTitle(alertType)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground block mb-2">
                      Message sent:
                    </span>
                    <p className="text-sm text-foreground bg-background border border-border rounded-lg p-3 break-words">
                      {sentMessage}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link href="/" className="block">
                    <Button className="w-full py-6 text-base shadow-sm">
                      Return to Home
                    </Button>
                  </Link>

                  <Link href="/general-notification/scan" className="block">
                    <Button
                      variant="outline"
                      className="w-full py-6 text-base border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      Send Another Alert
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/30 pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {isScanned && !isSuccess
                ? "Your identity will remain anonymous when sending alerts."
                : isSuccess
                  ? "Thank you for helping keep our community safe."
                  : "Can't find a sticker? The car might not be registered."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
