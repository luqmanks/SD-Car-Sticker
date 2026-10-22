"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Car,
  ShieldCheck,
  ShieldOff,
  Clock,
  Plus,
  Check,
  ChevronDown,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, useSession } from "@/hooks/use-session";

type OwnedCar = {
  plateNumber: string;
  carStatus: boolean;
  activatedAt: string | null;
  nfcCode: string;
};

export default function ActivatePage() {
  const { user, loading } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [activeSince, setActiveSince] = useState<Date | null>(null);
  const [registeredPlates, setRegisteredPlates] = useState<OwnedCar[]>([]);
  const [showPlateSelector, setShowPlateSelector] = useState(true);
  const [showAddNewPlate, setShowAddNewPlate] = useState(false);
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [plateDropdownOpen, setPlateDropdownOpen] = useState(false);
  const [, setActiveTimer] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    api<OwnedCar[]>("/api/cars", "GET")
      .then(setRegisteredPlates)
      .catch((e) => console.error("Error fetching car plates:", e));
  }, [loading, user]);

  const handleActivate = () => {
    if (!plateNumber.trim()) {
      setError("Please select or enter a plate number");
      return;
    }
    const car = registeredPlates.find((c) => c.plateNumber === plateNumber);
    if (!car) {
      setError("Car not found");
      return;
    }
    setIsActive(car.carStatus);
    setActiveSince(car.activatedAt ? new Date(car.activatedAt) : null);
    setShowPinInput(!car.carStatus);
    setShowPlateSelector(false);
    setError("");
  };

  const setCarStatus = async (status: boolean) => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError("PIN must be 4 digits");
      return;
    }
    try {
      const data = await api<{ activatedAt: string | null }>(
        "/api/cars/status",
        "PUT",
        { plateNumber, status, pin },
      );
      setRegisteredPlates((cars) =>
        cars.map((c) =>
          c.plateNumber === plateNumber
            ? { ...c, carStatus: status, activatedAt: data.activatedAt }
            : c,
        ),
      );
      setIsActive(status);
      setActiveSince(
        status && data.activatedAt ? new Date(data.activatedAt) : null,
      );
      setShowPinInput(false);
      setShowPlateSelector(!status);
      setPin("");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const handlePinSubmit = () => setCarStatus(true);
  const handleDeactivateConfirm = () => setCarStatus(false);

  const handleDeactivate = () => {
    setShowPinInput(true);
    setError("");
  };

  const handleSelectPlate = (selectedPlate: string) => {
    setPlateNumber(selectedPlate);
    setPlateDropdownOpen(false);
  };

  const handleAddNewPlate = async () => {
    if (!newPlateNumber.trim()) {
      setError("Please enter a plate number");
      return;
    }
    try {
      const car = await api<{ plateNumber: string; nfcCode: string }>(
        "/api/cars",
        "POST",
        {
          plateNumber: newPlateNumber,
        },
      );
      setRegisteredPlates((cars) => [
        ...cars,
        { ...car, carStatus: false, activatedAt: null },
      ]);
      setPlateNumber(car.plateNumber);
      setNewPlateNumber("");
      setShowAddNewPlate(false);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add plate number");
    }
  };

  const formatDuration = (startDate: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  useEffect(() => {
    if (isActive && activeSince) {
      const interval = setInterval(() => {
        setActiveTimer((prev) => prev + 1);
      }, 60000); // re-render every minute so the "active for" label updates

      return () => clearInterval(interval);
    }
  }, [isActive, activeSince]);

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

        <Card
          className={`shadow-lg overflow-hidden transition-all duration-300 ${isActive ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-border/50"}`}
        >
          <CardHeader
            className={`border-b pb-6 transition-colors duration-300 ${
              isActive
                ? "bg-emerald-50 border-emerald-200/50"
                : "bg-primary/10 border-primary/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/sydepark-logo.svg"
                alt="SD Car Sticker logo"
                width={44}
                height={44}
                className="shrink-0 drop-shadow-sm"
              />
              <div>
                <CardTitle
                  className={`text-xl sm:text-2xl flex items-center ${isActive ? "text-emerald-900" : "text-foreground"}`}
                >
                  {isActive ? (
                    <ShieldCheck className="mr-2 h-6 w-6 text-emerald-600" />
                  ) : (
                    <Car className="mr-2 h-6 w-6 text-primary" />
                  )}
                  {isActive ? "Mode Active" : "Double Park Mode"}
                </CardTitle>
                <CardDescription
                  className={
                    isActive
                      ? "text-emerald-700/80 mt-1"
                      : "text-muted-foreground mt-1"
                  }
                >
                  {isActive
                    ? "Your car is currently in double park mode"
                    : "Activate when you need to block another vehicle"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {!isActive && showPlateSelector && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Select Your Car</Label>

                  {/* Enhanced Custom Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className={`flex items-center justify-between w-full p-3 text-left border rounded-lg bg-background shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        plateNumber
                          ? "border-primary"
                          : "border-input hover:border-border/80"
                      } ${error && !showPinInput ? "border-destructive focus:ring-destructive/50" : ""}`}
                      onClick={() => setPlateDropdownOpen(!plateDropdownOpen)}
                    >
                      <span
                        className={
                          plateNumber
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {plateNumber || "Select a car plate number"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${plateDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {plateDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95">
                        {registeredPlates.map((plate) => (
                          <div
                            key={plate.plateNumber}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleSelectPlate(plate.plateNumber)}
                          >
                            <div className="flex items-center text-foreground font-medium">
                              <Car className="h-4 w-4 mr-2 text-primary" />
                              <span>{plate.plateNumber}</span>
                            </div>
                            {plateNumber === plate.plateNumber && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))}

                        <div
                          className="flex items-center p-3 border-t border-border hover:bg-muted cursor-pointer text-primary transition-colors font-medium"
                          onClick={() => {
                            setShowAddNewPlate(true);
                            setPlateDropdownOpen(false);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span>Add new plate number</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && !showPinInput && !showAddNewPlate && (
                    <p className="text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  {registeredPlates.find(
                    (c) => c.plateNumber === plateNumber,
                  ) && (
                    <div className="mt-4 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                        NFC Write Link
                      </p>
                      <div className="bg-background p-2 rounded border border-border text-xs font-mono text-muted-foreground break-all flex justify-between items-start gap-2">
                        <span>
                          {typeof window !== "undefined"
                            ? window.location.origin
                            : ""}
                          /blocked/scan?code=
                          {
                            registeredPlates.find(
                              (c) => c.plateNumber === plateNumber,
                            )?.nfcCode
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {showAddNewPlate && (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50 animate-in fade-in zoom-in-95">
                    <Label htmlFor="newPlateNumber">New Car Plate Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="newPlateNumber"
                        placeholder="e.g., ABC 1234"
                        value={newPlateNumber}
                        onChange={(e) => {
                          setNewPlateNumber(e.target.value);
                          setError("");
                        }}
                        className={`uppercase ${error && showAddNewPlate ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      <Button type="button" onClick={handleAddNewPlate}>
                        Add
                      </Button>
                    </div>
                    {error && showAddNewPlate && (
                      <p className="text-sm font-medium text-destructive">
                        {error}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
                      onClick={() => setShowAddNewPlate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleActivate}
                  className="w-full py-6 text-base font-semibold shadow-md transition-all mt-4"
                >
                  Activate Double Park Mode
                  <ShieldCheck className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {showPinInput && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`p-4 rounded-full ${isActive ? "bg-destructive/10" : "bg-primary/10"}`}
                  >
                    {isActive ? (
                      <ShieldOff className="h-10 w-10 text-destructive" />
                    ) : (
                      <ShieldCheck className="h-10 w-10 text-primary" />
                    )}
                  </div>
                </div>

                <p className="text-center text-muted-foreground">
                  {isActive
                    ? "Enter your 4-digit PIN to deactivate double park mode."
                    : "Enter your 4-digit PIN to activate double park mode."}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="pin">4-Digit PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError("");
                    }}
                    className={`text-center tracking-widest text-lg transition-all ${
                      error
                        ? "border-destructive focus-visible:ring-destructive"
                        : "focus-visible:ring-primary"
                    }`}
                  />
                  {error && (
                    <p className="text-sm font-medium text-destructive text-center">
                      {error}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={
                      isActive ? handleDeactivateConfirm : handlePinSubmit
                    }
                    variant={isActive ? "destructive" : "default"}
                    className="w-full py-6 text-base font-semibold shadow-md"
                  >
                    {isActive ? "Deactivate Now" : "Activate Now"}
                    {isActive ? (
                      <ShieldOff className="ml-2 h-5 w-5" />
                    ) : (
                      <ShieldCheck className="ml-2 h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPinInput(false);
                      setPin("");
                      setError("");
                      if (!isActive) {
                        setShowPlateSelector(true);
                      }
                    }}
                    className="w-full py-6 text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {isActive && !showPinInput && (
              <div className="space-y-5 animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-50 border border-emerald-200/60 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-5 border-b border-emerald-200/50 pb-4">
                    <h3 className="font-semibold text-emerald-900">
                      Current Status
                    </h3>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-emerald-800/70">
                        Vehicle Plate
                      </span>
                      <span className="text-base font-bold text-emerald-950 tracking-wide">
                        {plateNumber}
                      </span>
                    </div>

                    {activeSince && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-800/70">
                          Active for
                        </span>
                        <span className="text-sm font-bold text-emerald-950 flex items-center bg-emerald-100/50 px-2 py-1 rounded-md">
                          <Clock className="mr-1.5 h-4 w-4 text-emerald-600" />
                          {formatDuration(activeSince)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/40 border border-border/50 p-5 rounded-xl text-center">
                  <h3 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wider">
                    What happens now?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If someone is blocked by your vehicle, they can scan your
                    NFC sticker and you'll be instantly notified to move it.
                  </p>
                </div>

                <Button
                  onClick={handleDeactivate}
                  variant="destructive"
                  className="w-full py-6 text-base font-semibold shadow-md"
                >
                  Deactivate Double Park Mode
                  <ShieldOff className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/30 pt-6">
            <p className="text-sm text-muted-foreground">
              {isActive ? (
                <span className="font-medium text-foreground">
                  Remember to deactivate when you move your car.
                </span>
              ) : (
                <>
                  Need an NFC sticker?{" "}
                  <Link
                    href="/car-owner/order"
                    className="font-medium text-primary hover:underline transition-colors"
                  >
                    Order here
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
