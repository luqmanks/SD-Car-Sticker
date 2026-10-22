import Link from "next/link";
import { CheckCircle2, Truck, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrderSuccessPage() {
  // Generate a mock order number on the client
  const orderNumber = `NFC-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl w-full animate-in fade-in zoom-in-95 duration-500">
        <Card className="shadow-lg border-border/50 overflow-hidden">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100/50 pb-8 pt-10 text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-emerald-100 p-4 rounded-full shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-emerald-900 tracking-tight">
              Order Placed Successfully!
            </CardTitle>
            <p className="text-emerald-700/80 mt-2 text-sm sm:text-base px-4">
              Your NFC sticker order is confirmed. It will arrive within 3-5
              business days.
            </p>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            {/* Two-column status cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/40 p-5 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">
                  Order Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Order #:{" "}
                  <span className="font-bold text-foreground">
                    {orderNumber}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Delivery:{" "}
                  <span className="font-bold text-foreground">
                    3-5 business days
                  </span>
                </p>
              </div>

              <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 flex flex-col justify-center text-center md:text-left">
                <h3 className="font-semibold text-primary text-sm uppercase tracking-wider mb-2">
                  What's Next?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Once you receive your NFC sticker, place it on your windshield
                  using the guide below. Then, you can activate your double park
                  mode.
                </p>
              </div>
            </div>

            {/* Installation Guide (Moved from Order Page) */}
            <div className="bg-background border border-border/80 rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-semibold text-foreground text-lg mb-4 border-b border-border/50 pb-3">
                Quick Installation Guide
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2 text-sm uppercase tracking-wider">
                    1. Placement
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-lg border border-border/50">
                    Place the NFC sticker on the{" "}
                    <strong>inside of your windshield</strong>, preferably in
                    the lower corner of the passenger side for easy public
                    scanning.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3 text-sm uppercase tracking-wider">
                    2. How to apply
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Clean the glass area with the included alcohol wipe.",
                      "Peel off the protective backing.",
                      "Apply firmly to the dry glass surface.",
                      "Press evenly for 30 seconds to ensure strong adhesion.",
                    ].map((step, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted-foreground"
                      >
                        <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row border-t border-border/50 bg-muted/30 pt-6 gap-3">
            <Link href="/car-owner/activate" className="w-full sm:flex-1 block">
              <Button className="w-full py-6 text-base font-semibold shadow-md group transition-all">
                Go to Activation
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/" className="w-full sm:flex-1 block">
              <Button
                variant="outline"
                className="w-full py-6 text-base border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              >
                Return to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
