import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  cta,
  display,
  focusLight,
  screen,
  wrap,
} from "@/components/landing/styles";

import { Sticker } from "./sticker";

/* Closing call to action: order a sticker or register, with a way out for anyone who is blocked right now. */
export function ClosingCta() {
  return (
    <section className={`${screen} bg-[#d2332a] text-white`}>
      <div
        className={`${wrap} grid items-center gap-12 py-16 lg:grid-cols-[1fr_auto] lg:gap-20`}
      >
        <div>
          <h2
            className={`${display} max-w-2xl text-[clamp(2.25rem,5vw,4rem)] leading-[1]`}
          >
            Get your sticker before someone is stuck behind you.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed">
            Order an NFC sticker, register your car, and anyone you block can
            reach you with one tap.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/car-owner/order"
              data-btn
              data-shadow="#fbbc76"
              className={`${cta} w-full justify-center bg-[#2a1512] text-[#fff7ef] md:w-auto md:justify-start ${focusLight}`}
            >
              <span className={`${display} text-xl`}>Order a sticker</span>
              <ArrowUpRight className="h-5 w-5" data-arrow />
            </Link>
            <Link
              href="/car-owner/register"
              data-btn
              data-shadow="#2a1512"
              className={`${cta} w-full justify-center bg-[#fff7ef] text-[#2a1512] md:w-auto md:justify-start ${focusLight}`}
            >
              <span className={`${display} text-xl`}>Register your car</span>
              <ArrowUpRight className="h-5 w-5" data-arrow />
            </Link>
          </div>
          <p className="mt-8 text-base">
            Stuck behind someone right now?{" "}
            <Link
              href="/blocked/scan"
              className={`underline underline-offset-4 hover:text-[#fbbc76] ${focusLight}`}
            >
              Scan their sticker
            </Link>
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <Sticker />
        </div>
      </div>
    </section>
  );
}
