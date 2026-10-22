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

const alerts = [
  {
    title: "Lights left on",
    body: "Save someone from a flat battery before they walk back to it.",
    tilt: "-rotate-2",
  },
  {
    title: "Valuables in view",
    body: "Tell the owner about a bag or laptop on the seat before a thief notices.",
    tilt: "rotate-1 md:translate-x-6",
  },
  {
    title: "Broken glass or odd activity",
    body: "Report what you saw without needing to find the owner.",
    tilt: "-rotate-1",
  },
];

/* Car alerts: each alert is a ticket left under the wiper. */
export function CarAlerts() {
  return (
    <section className={`${screen} bg-[#f48436]`}>
      <div
        className={`${wrap} grid gap-12 py-16 lg:grid-cols-[1fr_26rem] lg:items-center lg:gap-16`}
      >
        <div>
          <h2 className={h2}>
            See something wrong with a car? Tell the owner.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed md:text-lg">
            Tap the sticker and send an alert. The owner is told right away, and
            your number stays private.
          </p>
          <Link
            href="/general-notification/scan"
            data-btn
            data-shadow="#fff7ef"
            className={`${cta} mt-8 w-full justify-center bg-[#2a1512] text-[#fff7ef] md:w-auto md:justify-start ${focusDark}`}
          >
            <span className={`${display} text-xl`}>Send a car alert</span>
            <ArrowUpRight className="h-5 w-5" data-arrow />
          </Link>
        </div>

        <ul data-anim="tickets" className="grid gap-5">
          {alerts.map((a) => (
            <li key={a.title} className={`bg-[#fff7ef] ${a.tilt}`}>
              <h3 className={`${display} px-6 pb-4 pt-5 text-xl`}>{a.title}</h3>
              <div className="relative border-t-2 border-dashed border-[#2a1512]/40">
                <span
                  className="absolute -left-3 -top-2.5 h-5 w-5 rounded-full bg-[#f48436]"
                  aria-hidden="true"
                />
                <span
                  className="absolute -right-3 -top-2.5 h-5 w-5 rounded-full bg-[#f48436]"
                  aria-hidden="true"
                />
              </div>
              <p className="px-6 pb-5 pt-4 text-base leading-relaxed">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
