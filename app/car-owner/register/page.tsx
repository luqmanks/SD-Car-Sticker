"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Car, Shield, ArrowRight } from "lucide-react";
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

export default function RegisterPage() {
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [loading, user]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    plateNumber: "",
    phoneNumber: "",
    pin: "",
    confirmPin: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    plateNumber: "",
    phoneNumber: "",
    pin: "",
    confirmPin: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Plate number is required";
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!formData.pin.trim()) {
      newErrors.pin = "PIN is required";
      isValid = false;
    } else if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      newErrors.pin = "PIN must be 4 digits";
      isValid = false;
    }

    if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = "PINs do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const { plateNumber, pin, phoneNumber, password } = formData;
    try {
      // Profile first: it verifies the password and is safe to retry. The car insert is last
      // because registering the same plate twice is rejected.
      await api("/api/auth/profile", "PATCH", { phoneNumber, pin, password });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      if (/password/i.test(message))
        setErrors((prev) => ({ ...prev, password: message }));
      else alert(message);
      return;
    }

    try {
      await api("/api/cars", "POST", { plateNumber });
      window.location.href = "/car-owner/register/success";
    } catch (error) {
      setStep(1);
      setErrors((prev) => ({
        ...prev,
        plateNumber:
          error instanceof Error ? error.message : "Could not register car",
      }));
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
          <CardHeader className="bg-primary/10 border-b border-primary/20 pb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/sydepark-logo.svg"
                alt="SD Car Sticker logo"
                width={40}
                height={40}
                className="shrink-0 drop-shadow-sm"
              />
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center text-foreground">
                  <Car className="mr-2 h-6 w-6 text-primary" />
                  Car Registration
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Register your car to use our double parking solution
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-8">
              <div className="flex justify-between mb-3 gap-2">
                <div
                  className={`h-2 w-full rounded-full transition-colors duration-300 ${
                    step >= 1 ? "bg-primary" : "bg-muted"
                  }`}
                />
                <div
                  className={`h-2 w-full rounded-full transition-colors duration-300 ${
                    step >= 2 ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
              <p className="text-center text-sm font-medium text-muted-foreground">
                Step {step} of 2:{" "}
                <span className="text-foreground">
                  {step === 1 ? "Car Details" : "Security Setup"}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">Car Plate Number</Label>
                    <Input
                      id="plateNumber"
                      name="plateNumber"
                      placeholder="e.g., ABC 1234"
                      value={formData.plateNumber}
                      onChange={handleChange}
                      className={`w-full uppercase transition-all ${
                        errors.plateNumber
                          ? "border-destructive focus-visible:ring-destructive"
                          : "focus-visible:ring-primary"
                      }`}
                    />
                    {errors.plateNumber && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.plateNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="e.g., +60123456789"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`w-full transition-all ${
                        errors.phoneNumber
                          ? "border-destructive focus-visible:ring-destructive"
                          : "focus-visible:ring-primary"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-6 text-base font-semibold shadow-md transition-all group"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center justify-center mb-6 text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                      Create a 4-digit PIN to secure your account. You'll need
                      this to toggle your double parking status.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">4-Digit PIN</Label>
                      <Input
                        id="pin"
                        name="pin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="••••"
                        value={formData.pin}
                        onChange={handleChange}
                        className={`text-center tracking-widest transition-all ${
                          errors.pin
                            ? "border-destructive focus-visible:ring-destructive"
                            : "focus-visible:ring-primary"
                        }`}
                      />
                      {errors.pin && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.pin}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPin">Confirm PIN</Label>
                      <Input
                        id="confirmPin"
                        name="confirmPin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="••••"
                        value={formData.confirmPin}
                        onChange={handleChange}
                        className={`text-center tracking-widest transition-all ${
                          errors.confirmPin
                            ? "border-destructive focus-visible:ring-destructive"
                            : "focus-visible:ring-primary"
                        }`}
                      />
                      {errors.confirmPin && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.confirmPin}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="password">Account Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Confirm your login password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full transition-all ${
                        errors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : "focus-visible:ring-primary"
                      }`}
                    />
                    {errors.password && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      type="submit"
                      className="w-full py-6 text-base font-semibold shadow-md"
                    >
                      Complete Registration
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full py-6 text-base"
                    >
                      Back to Car Details
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/30 pt-6">
            <p className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link
                href="/car-owner/activate"
                className="font-medium text-primary hover:underline transition-colors"
              >
                Activate your status
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
