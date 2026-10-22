"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package, CreditCard, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrderNFCPage() {
  const [formData, setFormData] = useState({
    name: "",
    plateNumber: "",
    address: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    plateNumber: "",
    address: "",
    phoneNumber: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Plate number is required";
      isValid = false;
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      window.location.href = "/car-owner/order/success";
    }
  };

  return (
    <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12">
      <div className="container mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        {/* Removed items-start to allow grid items to stretch to equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-border/50 overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-primary/10 border-b border-primary/20 pb-6">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/sydepark-logo.svg"
                    alt="SD Car Sticker logo"
                    width={44}
                    height={44}
                    className="shrink-0 drop-shadow-sm"
                  />
                  <div>
                    <CardTitle className="text-xl sm:text-2xl flex items-center text-foreground">
                      <Package className="mr-2 h-6 w-6 text-primary" />
                      Shipping Details
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      Enter your details to get your NFC sticker delivered.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8 flex-grow">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className={`transition-all ${errors.name ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                      />
                      {errors.name && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plateNumber">Car Plate Number</Label>
                      <Input
                        id="plateNumber"
                        name="plateNumber"
                        placeholder="e.g., ABC 1234"
                        value={formData.plateNumber}
                        onChange={handleChange}
                        className={`uppercase transition-all ${errors.plateNumber ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                      />
                      {errors.plateNumber && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.plateNumber}
                        </p>
                      )}
                    </div>
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
                      className={`transition-all ${errors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Enter your full street address, building, and postal code"
                      rows={4}
                      value={formData.address}
                      onChange={handleChange}
                      className={`resize-none transition-all ${errors.address ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                    />
                    {errors.address && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 lg:hidden">
                    <Button
                      type="submit"
                      className="w-full py-6 text-base font-semibold shadow-md transition-all"
                    >
                      Place Order
                      <CreditCard className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card className="shadow-md border-border/50 h-full flex flex-col">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  Order Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-4 flex-grow flex flex-col">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    NFC Sticker (1x)
                  </span>
                  <span className="font-semibold text-foreground">RM 5.00</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    Standard Shipping
                  </span>
                  <span className="font-semibold text-foreground">RM 5.00</span>
                </div>

                <div className="border-t border-dashed border-border/80 pt-4 flex justify-between items-center">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-xl text-primary">
                    RM 10.00
                  </span>
                </div>

                <div className="pt-4 hidden lg:block mt-auto">
                  <Button
                    onClick={handleSubmit}
                    className="w-full py-6 text-base font-semibold shadow-md transition-all"
                  >
                    Place Order
                    <CreditCard className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/30 border-t border-border/50 pt-5 flex-col items-start gap-4 mt-auto">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                    <strong className="text-foreground font-semibold">
                      Estimated delivery:
                    </strong>
                    <br />
                    3-5 business days via standard courier.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                    Your NFC sticker will be pre-linked to your registered car
                    plate number.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
