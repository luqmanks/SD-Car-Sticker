import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12 flex items-center justify-center">
      <div className="container mx-auto max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <Card className="shadow-lg border-border/50 overflow-hidden">
          {/* Success Header */}
          <CardHeader className="bg-emerald-50 border-b border-emerald-100/50 pb-8 pt-10 text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-emerald-100 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-emerald-900 tracking-tight">
              Registration Successful!
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-8 text-center space-y-6">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Your car has been successfully registered in our system. To
              complete your setup and start using the double parking features,
              you'll need an NFC sticker.
            </p>

            {/* Callout Box */}
            <div className="bg-muted/50 border border-border/50 p-4 rounded-xl flex items-center gap-4 text-left transition-colors hover:bg-muted/80">
              <div className="bg-primary/10 p-3 rounded-full shrink-0">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Order Your NFC Sticker
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Get it delivered directly to your doorstep.
                </p>
              </div>
            </div>

            {/* Primary Action */}
            <div className="pt-2">
              <Link href="/car-owner/order" className="block">
                <Button className="w-full py-6 text-base font-semibold shadow-md group transition-all">
                  Order NFC Sticker Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center border-t border-border/50 bg-muted/30 pt-6 gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an NFC sticker?
            </p>
            <Link href="/car-owner/activate" className="w-full">
              <Button
                variant="outline"
                className="w-full py-6 text-base border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              >
                Activate Double Park Mode
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
