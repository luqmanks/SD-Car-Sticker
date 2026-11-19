"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronDown,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickerLookup, type CarRef } from "@/components/sticker-lookup";
import { api } from "@/hooks/use-session";

// deployment comment

type Phase = "lookup" | "choose" | "sending" | "notified";

const ENQUIRIES: {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "", label: "Just blocking me", Icon: Car },
  { id: "keys", label: "Owner left car keys inside", Icon: KeyRound },
  { id: "crash", label: "Someone crashed into the car", Icon: CarFront },
  {
    id: "lights",
    label: "Owner forgot to turn off the lights",
    Icon: Lightbulb,
  },
  { id: "window", label: "Window or door left open", Icon: DoorOpen },
  { id: "valuables", label: "Valuables visible inside", Icon: Wallet },
  { id: "alarm", label: "Car alarm is going off", Icon: Siren },
  { id: "tyre", label: "Flat tyre", Icon: CircleAlert },
  { id: "other", label: "Custom message", Icon: MessageSquare },
];

const CUSTOM_MAX = 90;

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("lookup");
  const [ref, setRef] = useState<CarRef>({});
  const [enquiry, setEnquiry] = useState("");
  const [enquiryDropdownOpen, setEnquiryDropdownOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [remindState, setRemindState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [remindError, setRemindError] = useState("");
  const [showAuthorities, setShowAuthorities] = useState(false);

  useEffect(() => {
    if (!scanTime) return;
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - scanTime.getTime()) / 1000);
      setElapsedTime(
        `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [scanTime]);

  const selected = ENQUIRIES.find((e) => e.id === enquiry) ?? ENQUIRIES[0];
  const customMissing = enquiry === "other" && !customMessage.trim();

  const handleResolve = (carRef: CarRef) => {
    setRef(carRef);
    setPlateNumber(carRef.plate ?? "");
    setError("");
    setPhase("choose");
  };

  const notifyOwner = async () => {
    setError("");
    setPhase("sending");
    try {
      const data = await api<{ plateNumber: string; message: string }>(
        "/api/notify",
        "POST",
        {
          ...ref,
          type: "blocked",
          enquiry,
          message: customMessage,
        },
      );
      setPlateNumber(data.plateNumber);
      setSentMessage(data.message);
      setScanTime(new Date());
      setPhase("notified");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("choose");
    }
  };

  const remindOwner = async () => {
    setRemindState("sending");
    setRemindError("");
    try {
      await api("/api/notify", "POST", {
        plate: plateNumber,
        type: "blocked",
        enquiry,
        message: customMessage,
      });
      setRemindState("sent");
    } catch (e) {
      setRemindError(
        e instanceof Error ? e.message : "Could not send the reminder",
      );
      setRemindState("idle");
    }
  };

  const notified = phase === "notified";
  const choosing = phase === "choose" || phase === "sending";

  return (
    <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12 w-full overflow-x-hidden">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4 shrink-0" />
          Back to Home
        </Link>

        <Card
          className={`mx-auto shadow-lg transition-all duration-500 border-border/50 ${choosing ? "max-w-4xl" : "max-w-md"} w-full`}
        >
          <CardHeader
            className={`border-b pb-6  transition-colors duration-500 ${
              notified
                ? "bg-emerald-50 border-emerald-200/50"
                : "bg-primary/10 border-primary/20"
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              <Image
                src="/images/sydepark-logo.svg"
                alt="SD Car Sticker logo"
                width={48}
                height={48}
                className="shrink-0 drop-shadow-sm mt-1 sm:mt-0"
              />
              <div className="min-w-0 flex-1">
                <CardTitle
                  className={`text-xl sm:text-2xl flex items-start sm:items-center ${notified ? "text-emerald-900" : "text-foreground"}`}
                >
                  {notified ? (
                    <CheckCircle2 className="mr-2 h-6 w-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <QrCode className="mr-2 h-6 w-6 text-primary shrink-0 mt-0.5 sm:mt-0" />
                  )}
                  <span className="leading-tight">
                    {notified
                      ? "Owner Notified"
                      : choosing
                        ? "Notify the Car Owner"
                        : "Find the Car Owner"}
                  </span>
                </CardTitle>
                <CardDescription
                  className={`mt-1 sm:mt-1.5 ${notified ? "text-emerald-700/80" : "text-muted-foreground"}`}
                >
                  {notified
                    ? "An SMS alert has been sent to the owner's phone."
                    : choosing
                      ? "Select the issue below so the owner knows what to expect."
                      : "Tap the NFC sticker on the car blocking you."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 sm:pt-8 w-full">
            {phase === "lookup" && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <StickerLookup
                  buttonClass="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base w-full"
                  onResolve={handleResolve}
                  resolveLabel="Continue"
                />
              </div>
            )}

            {choosing && (
              <div className="grid gap-6 md:gap-8 lg:grid-cols-[1fr_18rem] animate-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
                {/* Left: Enquiry Options (Dropdown) */}
                <div className="space-y-4 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2 truncate">
                    Select the reason
                  </h3>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setEnquiryDropdownOpen(!enquiryDropdownOpen)
                      }
                      disabled={phase === "sending"}
                      className={`flex items-center justify-between w-full p-4 border rounded-xl bg-background text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        phase === "sending"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-primary/50"
                      } ${enquiryDropdownOpen ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
                    >
                      <div className="flex items-center text-foreground font-medium flex-1 min-w-0 pr-3">
                        <selected.Icon className="mr-3 h-5 w-5 text-primary shrink-0" />
                        <span className="truncate block text-left leading-snug">
                          {selected.label}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          enquiryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {enquiryDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-lg max-h-[280px] overflow-y-auto animate-in fade-in zoom-in-95">
                        {ENQUIRIES.map((option) => (
                          <div
                            key={option.id || "none"}
                            onClick={() => {
                              setEnquiry(option.id);
                              setEnquiryDropdownOpen(false);
                            }}
                            className="flex items-center justify-between p-4 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-0 min-w-0"
                          >
                            <div className="flex items-center text-foreground font-medium flex-1 min-w-0 pr-3">
                              <option.Icon
                                className={`mr-3 h-5 w-5 shrink-0 ${
                                  enquiry === option.id
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span className="truncate block leading-snug">
                                {option.label}
                              </span>
                            </div>
                            {enquiry === option.id && (
                              <Check className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {enquiry === "other" && (
                    <div className="space-y-2 pt-4 animate-in fade-in slide-in-from-top-2 w-full">
                      <Label htmlFor="customMessage">
                        Your message to the owner
                      </Label>
                      <Textarea
                        id="customMessage"
                        placeholder="e.g., Your boot is not closed properly"
                        maxLength={CUSTOM_MAX}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        disabled={phase === "sending"}
                        className="min-h-[100px] resize-none focus-visible:ring-primary w-full"
                      />
                      <p className="text-xs font-medium text-muted-foreground text-right">
                        {customMessage.length}/{CUSTOM_MAX} characters. Links
                        aren&apos;t allowed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Sticky Action Panel */}
                <div className="space-y-4 lg:sticky lg:top-6 self-start w-full min-w-0">
                  <div className="bg-muted/40 p-5 rounded-xl border border-border/50 space-y-3 w-full overflow-hidden">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
                        Target Vehicle
                      </span>
                      <span className="font-bold text-lg text-foreground tracking-widest truncate">
                        {ref.plate ?? "SD Car Sticker"}
                      </span>
                    </div>

                    <div className="border-t border-border/50 pt-3 flex flex-col gap-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
                        Notification Type
                      </span>
                      <span className="font-semibold text-foreground flex items-center gap-2 min-w-0">
                        <selected.Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate block" title={selected.label}>
                          {selected.label}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 w-full">
                    <Button
                      onClick={notifyOwner}
                      disabled={phase === "sending" || customMissing}
                      className="w-full py-6 text-base font-semibold shadow-md transition-all relative overflow-hidden"
                    >
                      {phase === "sending"
                        ? "Notifying Owner..."
                        : "Notify the Owner"}
                      {phase !== "sending" && (
                        <Bell className="ml-2 h-5 w-5 shrink-0" />
                      )}
                    </Button>

                    {error && (
                      <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg text-center animate-in zoom-in-95 break-words">
                        {error}
                      </p>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      disabled={phase === "sending"}
                      onClick={() => {
                        setPhase("lookup");
                        setError("");
                      }}
                    >
                      Scanned the wrong car?
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {notified && (
              <div className="space-y-6 lg:max-w-2xl lg:mx-auto animate-in zoom-in-95 duration-500 w-full min-w-0">
                <div className="bg-emerald-50 border border-emerald-200/60 p-5 sm:p-6 rounded-xl space-y-4 overflow-hidden">
                  <div className="flex justify-between items-center border-b border-emerald-200/50 pb-4">
                    <h3 className="font-semibold text-emerald-900 text-sm uppercase tracking-wider truncate">
                      Status Overview
                    </h3>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <span className="text-xs text-emerald-800/70 font-medium truncate block">
                        Car Plate
                      </span>
                      <p className="font-bold text-emerald-950 tracking-wider truncate">
                        {plateNumber}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-xs text-emerald-800/70 font-medium truncate block">
                        Reason Sent
                      </span>
                      <p
                        className="font-bold text-emerald-950 truncate block"
                        title={selected.label}
                      >
                        {selected.label}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-100/50 p-4 rounded-lg flex flex-wrap sm:flex-nowrap gap-2 justify-between items-center mt-2">
                    <span className="text-sm font-medium text-emerald-800">
                      Time since notification
                    </span>
                    <span className="text-lg font-bold text-emerald-900 flex items-center tabular-nums">
                      <Clock className="mr-2 h-5 w-5 text-emerald-600 shrink-0" />
                      {elapsedTime}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border/50 p-5 rounded-xl w-full">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">
                    Message Delivered
                  </h3>
                  <p className="text-sm text-foreground bg-background border border-border/60 rounded-lg p-4 break-words leading-relaxed shadow-sm w-full">
                    {sentMessage}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-4 w-full">
                  <div className="text-center mb-6">
                    <h3 className="font-semibold text-foreground mb-1">
                      What happens now?
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      The owner should respond or move their car shortly. If
                      nothing happens in a few minutes, you can safely send
                      another reminder.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 w-full">
                    <div className="space-y-2 w-full">
                      <Button
                        onClick={remindOwner}
                        disabled={remindState !== "idle"}
                        variant="outline"
                        className="w-full py-6 border-primary/30 text-primary hover:bg-primary/5 transition-all truncate"
                      >
                        <Bell className="mr-2 h-5 w-5 shrink-0" />
                        <span className="truncate">
                          {remindState === "sending"
                            ? "Sending..."
                            : remindState === "sent"
                              ? "Reminder Sent!"
                              : "Send SMS Reminder"}
                        </span>
                      </Button>
                      {remindError && (
                        <p className="text-xs font-medium text-destructive text-center break-words">
                          {remindError}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => setShowAuthorities(!showAuthorities)}
                      className="w-full py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-all truncate"
                    >
                      <AlertTriangle className="mr-2 h-5 w-5 shrink-0" />
                      <span className="truncate">Still blocked?</span>
                    </Button>
                  </div>

                  {showAuthorities && (
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 text-sm text-accent-foreground space-y-3 animate-in slide-in-from-top-2 w-full">
                      <p className="leading-relaxed font-medium">
                        SD Car Sticker cannot dispatch authorities on your
                        behalf. For an illegally obstructed vehicle, please
                        contact your local council (PBT) or traffic police
                        directly.
                      </p>
                      <div className="pt-2 border-t border-accent/20 flex flex-wrap gap-3 items-center justify-between">
                        <span className="text-muted-foreground">
                          In case of emergency:
                        </span>
                        <a
                          href="tel:999"
                          className="font-bold text-accent bg-accent/10 px-4 py-1.5 rounded-full hover:bg-accent/20 transition-colors flex items-center gap-2"
                        >
                          Call 999
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/30 pt-6 rounded-b-xl w-full min-w-0">
            <p className="text-sm text-muted-foreground font-medium text-center break-words px-2">
              {notified
                ? "Thank you for your patience."
                : "Can't find a sticker? The car might not be registered."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
