import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  cta,
  display,
  focusDark,
  h2,
  screen,
  wrap,
} from "@/components/landing/styles";

const steps = [
  {
    title: "Register and stick",
    body: "Add your car details once, then press the NFC sticker onto the inside of your windshield.",
  },
  {
    title: "Switch on double park mode",
    body: "Leaving your car behind someone else's? Activate it so they know you can be reached.",
  },
  {
    title: "Get the message to move",
    body: "The driver you are blocking taps your sticker with their phone. You are notified straight away.",
  },
];

/* Each step is a taller block than the last, so the three read as a staircase going up. */
const stairs = [
  "bg-[#fbbc76] text-[#2a1512] md:min-h-[13rem]",
  "bg-[#f48436] text-[#2a1512] md:min-h-[17rem]",
  "bg-[#d2332a] text-white md:min-h-[21rem]",
];

/* How it works: three steps as a staircase. */
export function HowItWorks() {
  return (
    <section className={`${screen} bg-[#fff7ef]`}>
      <div className={`${wrap} py-16`}>
        <h2 className={`${h2} max-w-2xl`}>
          Three steps, and you are reachable
        </h2>

        <ol
          data-anim="stairs"
          className="mt-10 grid gap-3 md:grid-cols-3 md:items-end md:gap-0"
        >
          {steps.map((s, i) => (
            <li
              key={s.title}
              className={`border-t-4 border-[#2a1512] px-6 pb-8 pt-5 ${stairs[i]}`}
            >
              <span className={`${display} block text-5xl leading-none`}>
                {i + 1}
              </span>
              <h3 className={`${display} mt-4 text-2xl leading-tight`}>
                {s.title}
              </h3>
              <p className="mt-2 max-w-xs text-base leading-relaxed">
                {s.body}
              </p>
            </li>
          ))}
        </ol>

        <Link
          href="/car-owner/register"
          data-btn
          data-shadow="#2a1512"
          className={`${cta} mt-10 w-full justify-center bg-[#d2332a] text-white md:w-auto md:justify-start ${focusDark}`}
        >
          <span className={`${display} text-xl`}>Register your car</span>
          <ArrowUpRight className="h-5 w-5" data-arrow />
        </Link>
      </div>
    </section>
  );
}
