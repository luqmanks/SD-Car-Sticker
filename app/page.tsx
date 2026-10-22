"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useSession } from "@/hooks/use-session";

/*
  Design idea: the whole page is a car park seen from above.
  Hero = a live top-down scene (a double-parked car, a sticker tap, a notification).
  Steps = three painted parking bays. Alerts = tickets left on a windscreen.
  Quotes = windscreen-shaped cards. Footer = painted bay lines.

  Sime Darby palette
  red #e93b30   orange #f48436   apricot #fbbc76   coral #f46c6c   blush #f49c9c
  Support tones derived from the red:
  ink #2a1512 (asphalt, text)   paper #fff7ef (light panels)
  #d2332a = red deepened just enough for white text to pass AA on buttons

  Fonts (set up in layout.tsx): Clash Display Semibold for headings, Archivo Regular for body.
  Clash is a single weight, so headings use font-normal to stop the browser faking a bold.

  All keyframes live in the <style> tag below, so globals.css needs no animation rules.
*/

const display =
  "font-[family-name:var(--font-clash)] font-normal tracking-[-0.02em]";
const focusDark =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2a1512]";
const focusLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fbbc76]";
const screen = "relative flex min-h-[100svh] flex-col justify-center";
const wrap = "mx-auto w-full max-w-6xl px-6 md:px-10";
const h2 = `${display} text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]`;
const cta =
  "inline-flex items-center gap-2 px-6 py-4 transition-transform hover:-translate-y-0.5";

const css = `
@keyframes sd-ring { 0% { opacity: .95; transform: scale(.3); } 100% { opacity: 0; transform: scale(6); } }
@keyframes sd-notif { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.sd-ring { transform-box: fill-box; transform-origin: center; opacity: 0; animation: sd-ring 1.5s ease-out both; }
.sd-notif { opacity: 0; animation: sd-notif .5s ease-out 1.6s both; }
@media (prefers-reduced-motion: reduce) {
  .sd-ring { animation: none; opacity: 0; }
  .sd-notif { animation: none; opacity: 1; }
}
`;

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

const testimonials = [
  {
    quote:
      "This app really helped free up more parking spots, especially at busy places like Mydin in Pekan, Pahang. It's super easy to use. Just scan the NFC sticker and you're good to go. Honestly, I think more people will start using it because of how simple and helpful it is!",
    name: "Danial Nabil",
    role: "Diploma student, Universiti Malaysia Pahang (UMP)",
  },
  {
    quote:
      "Honestly, using an NFC car sticker for this is a big upgrade compared to the old QR code system. These days, NFC is everywhere, even TNG cards are using it now, so it's super easy and accessible for everyone. I love how smooth and quick the process is!",
    name: "Faris Faiz",
    role: "Resident, Pekan, Pahang",
  },
];

const footerGroups: { title: string; items: [string, string][] }[] = [
  {
    title: "For car owners",
    items: [
      ["/car-owner/register", "Register your car"],
      ["/car-owner/order", "Order NFC sticker"],
      ["/car-owner/activate", "Activate double park mode"],
    ],
  },
  {
    title: "In the moment",
    items: [
      ["/blocked/scan", "I'm blocked"],
      ["/general-notification/scan", "Send car alert"],
    ],
  },
];

/* A car seen from above, nose pointing up at r=0. */
function Car({
  x,
  y,
  r = 0,
  color,
}: {
  x: number;
  y: number;
  r?: number;
  color: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-31" y="-27" width="6" height="9" rx="2" fill={color} />
      <rect x="25" y="-27" width="6" height="9" rx="2" fill={color} />
      <rect x="-27" y="-52" width="54" height="104" rx="15" fill={color} />
      <rect
        x="-21"
        y="-31"
        width="42"
        height="14"
        rx="4"
        fill="#2a1512"
        opacity=".8"
      />
      <rect
        x="-21"
        y="-14"
        width="42"
        height="26"
        rx="7"
        fill="#000"
        opacity=".12"
      />
      <rect
        x="-20"
        y="24"
        width="40"
        height="10"
        rx="4"
        fill="#2a1512"
        opacity=".8"
      />
    </g>
  );
}

function CarPark({ pingKey }: { pingKey: number }) {
  const topRow = [
    { i: 0, c: "#f46c6c" },
    { i: 1, c: "#fbbc76" },
    { i: 2, c: "#f49c9c" },
    { i: 4, c: "#f48436" },
  ];
  const bottomRow = [
    { i: 0, c: "#f48436" },
    { i: 2, c: "#f49c9c" },
    { i: 3, c: "#f46c6c" },
    { i: 5, c: "#fbbc76" },
  ];
  const bayLines = [0, 1, 2, 3, 4, 5, 6].map((n) => 20 + n * 100);

  return (
    <svg
      viewBox="0 0 640 420"
      className="h-auto w-full"
      role="img"
      aria-label="A car park from above. A double-parked car with an NFC sticker is blocking two parked cars in."
    >
      {bayLines.map((x) => (
        <g key={x} stroke="#fbbc76" strokeWidth="3" strokeLinecap="square">
          <line x1={x} y1="20" x2={x} y2="140" />
          <line x1={x} y1="280" x2={x} y2="400" />
        </g>
      ))}
      <line
        x1="20"
        y1="246"
        x2="620"
        y2="246"
        stroke="#fff7ef"
        strokeOpacity=".35"
        strokeWidth="3"
        strokeDasharray="16 14"
      />

      {topRow.map((c) => (
        <Car key={`t${c.i}`} x={70 + c.i * 100} y={80} r={180} color={c.c} />
      ))}
      {bottomRow.map((c) => (
        <Car key={`b${c.i}`} x={70 + c.i * 100} y={340} color={c.c} />
      ))}

      {/* the double-parked car, nose to the right, sticker on the windshield */}
      <Car x={130} y={185} r={90} color="#fff7ef" />
      <circle
        cx="153"
        cy="175"
        r="5.5"
        fill="#e93b30"
        stroke="#fff7ef"
        strokeWidth="1.5"
      />

      <g key={pingKey}>
        {[0.4, 0.8, 1.2].map((d) => (
          <circle
            key={d}
            cx="153"
            cy="175"
            r="10"
            fill="none"
            stroke="#fbbc76"
            strokeWidth="2.5"
            className="sd-ring"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

function Sticker() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-square w-[min(60vw,16rem)] rotate-3 rounded-[2rem] bg-[#fff7ef] p-6 text-[#2a1512] shadow-[8px_8px_0_#2a1512]"
    >
      <svg viewBox="0 0 200 200" className="h-[52%] w-[52%]">
        <circle cx="40" cy="100" r="13" fill="#e93b30" />
        <path
          d="M68 70a42 42 0 0 1 0 60"
          fill="none"
          stroke="#e93b30"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M92 46a76 76 0 0 1 0 108"
          fill="none"
          stroke="#e93b30"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M116 22a110 110 0 0 1 0 156"
          fill="none"
          stroke="#f48436"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
      <p
        className={`${display} absolute bottom-6 left-6 right-6 text-2xl leading-[1.05]`}
      >
        Tap to reach
        <br />
        the owner
      </p>
    </div>
  );
}

function Windscreen({
  t,
  className = "",
}: {
  t: (typeof testimonials)[number];
  className?: string;
}) {
  return (
    <figure
      tabIndex={0}
      className={`sd-card [filter:drop-shadow(10px_10px_0_#f48436)] ${className}`}
    >
      <div className="relative bg-[#fff7ef] px-10 pb-20 pt-10 text-[#2a1512] [clip-path:polygon(6%_0,94%_0,100%_100%,0_100%)] md:px-14">
        {/* glass sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,.7)_38%,rgba(255,255,255,.7)_46%,transparent_46%,transparent_52%,rgba(255,255,255,.5)_52%,rgba(255,255,255,.5)_55%,transparent_55%)]"
        />

        <span
          aria-hidden="true"
          className={`${display} absolute left-8 top-2 text-8xl leading-none text-[#e93b30]`}
        >
          &ldquo;
        </span>

        <blockquote className="relative pt-8 text-base leading-relaxed md:text-lg md:leading-relaxed">
          {t.quote}
        </blockquote>

        <figcaption className="relative mt-6">
          <span
            className={`${display} inline-block rounded-md border-2 border-[#2a1512] bg-[#fbbc76] px-3 py-1 text-lg uppercase tracking-[0.08em]`}
          >
            {t.name}
          </span>
          <span className="mt-2 block text-base">{t.role}</span>
        </figcaption>

        {/* wiper, sweeps on hover or focus */}
        <span
          aria-hidden="true"
          className="sd-wipe absolute bottom-5 left-8 h-1.5 w-[62%] origin-left rounded-full bg-[#2a1512]"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[1.05rem] left-[1.6rem] h-3 w-3 rounded-full bg-[#2a1512]"
        />

        {/* mini sticker on the glass */}
        <span
          aria-hidden="true"
          className="absolute bottom-5 right-14 h-4 w-4 rounded-full border-2 border-[#fff7ef] bg-[#e93b30]"
        />
      </div>
    </figure>
  );
}

export default function Home() {
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [pingKey, setPingKey] = useState(0);
  const { user, logout } = useSession();
  const isAuthenticated = !!user;

  const onOwnerClick = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setOwnerOpen((o) => !o);
  };

  const card = `group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-transform hover:-translate-y-0.5 ${focusLight}`;
  const arrow =
    "h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

  return (
    <div className="bg-[#fff7ef] text-[#2a1512] antialiased">
      <style>{css}</style>

      {/* 1. Hero: the car park */}
      <section className={`${screen} bg-[#2a1512] text-[#fff7ef]`}>
        <header className="absolute inset-x-0 top-0 z-10">
          <div className={`${wrap} flex items-center justify-between py-4`}>
            <Link href="/" className={`flex items-center gap-3 ${focusLight}`}>
              <Image src="/images/sd-logo.svg" alt="" width={36} height={36} />
              <span className={`${display} text-lg`}>SD Car Sticker</span>
            </Link>
            <nav className="flex items-center gap-5 text-base">
              {isAuthenticated ? (
                <>
                  <span className="hidden max-w-[16rem] truncate sm:inline">
                    {user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className={`underline underline-offset-4 hover:text-[#fbbc76] ${focusLight}`}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={`underline underline-offset-4 hover:text-[#fbbc76] ${focusLight}`}
                >
                  Log in
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className={`${wrap} pb-10 pt-24`}>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_30rem] lg:gap-14">
            <div>
              <h1
                className={`${display} text-[clamp(2.25rem,4.8vw,4rem)] leading-[1]`}
              >
                Blocked in?
                <br />
                Tap the sticker.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#fff7ef]/85 md:text-lg">
                Register once, stick it on your windshield, and anyone you are
                blocking can reach you in seconds. No honking, no hunting for
                the owner.
              </p>
            </div>

            <div>
              <div className="relative overflow-hidden rounded-2xl bg-[#3a221d] p-3">
                <CarPark pingKey={pingKey} />
                <div
                  key={pingKey}
                  role="status"
                  className="sd-notif absolute bottom-4 right-4 w-[62%] rounded-2xl bg-[#fff7ef] p-3 text-[#2a1512] shadow-[0_6px_0_rgba(0,0,0,.25)]"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="h-4 w-4 rounded bg-[#e93b30]"
                      aria-hidden="true"
                    />
                    <span>SD Car Sticker, now</span>
                  </div>
                  <p className={`${display} mt-1 text-base leading-snug`}>
                    Someone is blocked behind your car
                  </p>
                  <p className="text-sm">Please move it when you can.</p>
                </div>
              </div>
              <button
                onClick={() => setPingKey((k) => k + 1)}
                className={`mt-2 text-sm underline underline-offset-4 hover:text-[#fbbc76] ${focusLight}`}
              >
                Replay the tap
              </button>
            </div>
          </div>

          <div className="mt-8 grid items-start gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <Link
              href="/blocked/scan"
              className={`${card} bg-[#d2332a] py-6 text-white shadow-[6px_6px_0_#fbbc76] md:min-h-[8.75rem]`}
            >
              <span>
                <span className={`${display} block text-3xl`}>I'm blocked</span>
                <span className="block text-base">
                  Scan the sticker on the car in your way
                </span>
              </span>
              <ArrowUpRight className="h-7 w-7 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div>
              <button
                onClick={onOwnerClick}
                aria-expanded={isAuthenticated ? ownerOpen : undefined}
                className={`${card} bg-[#fbbc76] text-[#2a1512] md:min-h-[8.25rem]`}
              >
                <span>
                  <span className={`${display} block text-xl`}>
                    I'm a car owner
                  </span>
                  <span className="block text-[15px]">
                    Register a car or switch on double park mode
                  </span>
                </span>
                <ArrowUpRight className={arrow} />
              </button>
              {isAuthenticated && ownerOpen && (
                <div className="grid gap-px bg-[#2a1512]">
                  <Link
                    href="/car-owner/register"
                    className={`bg-[#fff7ef] px-5 py-3 text-[#2a1512] hover:bg-white ${focusLight}`}
                  >
                    <span className="block font-bold">Register a new car</span>
                    <span className="block text-[15px]">
                      First time? Add your car details.
                    </span>
                  </Link>
                  <Link
                    href="/car-owner/activate"
                    className={`bg-[#fff7ef] px-5 py-3 text-[#2a1512] hover:bg-white ${focusLight}`}
                  >
                    <span className="block font-bold">
                      Activate double park mode
                    </span>
                    <span className="block text-[15px]">
                      Already registered? Switch on your NFC.
                    </span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/general-notification/scan"
              className={`${card} bg-[#fff7ef] text-[#2a1512] md:min-h-[6.5rem]`}
            >
              <span>
                <span className={`${display} block text-xl`}>
                  I spotted a problem
                </span>
                <span className="block text-[15px]">
                  Send a car alert to the owner
                </span>
              </span>
              <ArrowUpRight className={arrow} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. How it works: three painted bays */}
      <section className={`${screen} bg-[#fff7ef]`}>
        <div className={`${wrap} py-16`}>
          <h2 className={`${h2} max-w-2xl`}>
            Three steps, and you are reachable
          </h2>

          <ol className="mt-10 grid gap-3 md:grid-cols-3 md:items-end md:gap-0">
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
            className={`${cta} mt-10 bg-[#d2332a] text-white ${focusDark}`}
          >
            <span className={`${display} text-xl`}>Register your car</span>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* 3. Car alerts: tickets under the wiper */}
      <section className={`${screen} bg-[#f48436]`}>
        <div
          className={`${wrap} grid gap-12 py-16 lg:grid-cols-[1fr_26rem] lg:items-center lg:gap-16`}
        >
          <div>
            <h2 className={h2}>
              See something wrong with a car? Tell the owner.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed md:text-lg">
              Tap the sticker and send an alert. The owner is told right away,
              and your number stays private.
            </p>
            <Link
              href="/general-notification/scan"
              className={`${cta} mt-8 bg-[#2a1512] text-[#fff7ef] ${focusDark}`}
            >
              <span className={`${display} text-xl`}>Send a car alert</span>
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>

          <ul className="grid gap-5">
            {alerts.map((a) => (
              <li key={a.title} className={`bg-[#fff7ef] ${a.tilt}`}>
                <h3 className={`${display} px-6 pb-4 pt-5 text-xl`}>
                  {a.title}
                </h3>
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

      {/* 4. Testimonials: one pulled line as the headline, full quotes beneath */}
      <section className={`${screen} bg-[#f49c9c]`}>
        <div className={`${wrap} py-16`}>
          <blockquote>
            <p
              className={`${display} max-w-4xl text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05]`}
            >
              &ldquo;Just scan the NFC sticker and you&rsquo;re good to
              go.&rdquo;
            </p>
            <footer className="mt-4 text-base">
              Danial Nabil, on the SD Car Sticker app
            </footer>
          </blockquote>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
            {testimonials.map((t) => (
              <figure key={t.name} className="border-t-4 border-[#2a1512] pt-5">
                <blockquote className="text-base leading-relaxed md:text-lg md:leading-relaxed">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4">
                  <span className={`${display} block text-xl`}>{t.name}</span>
                  <span className="text-base">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-base">Both quotes translated from Malay.</p>
        </div>
      </section>

      {/* 5. Closing call to action */}
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
                className={`${cta} bg-[#2a1512] text-[#fff7ef] ${focusLight}`}
              >
                <span className={`${display} text-xl`}>Order a sticker</span>
                <ArrowUpRight className="h-5 w-5" />
              </Link>
              <Link
                href="/car-owner/register"
                className={`${cta} bg-[#fff7ef] text-[#2a1512] ${focusLight}`}
              >
                <span className={`${display} text-xl`}>Register your car</span>
                <ArrowUpRight className="h-5 w-5" />
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

      {/* Footer */}
      <footer className="bg-[#2a1512] text-[#fff7ef]">
        <div
          aria-hidden="true"
          className="h-8 w-full bg-[repeating-linear-gradient(90deg,#fbbc76_0_4px,transparent_4px_96px)]"
        />
        <div
          className={`${wrap} grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]`}
        >
          <div>
            <div className="flex items-center gap-3">
              <Image src="/images/sd-logo.svg" alt="" width={40} height={40} />
              <span className={`${display} text-xl`}>SD Car Sticker</span>
            </div>
            <p className="mt-1 text-base text-[#fff7ef]/80">by Sime Darby</p>
            <p className="mt-4 max-w-xs text-base">
              Making double parking manageable for everyone.
            </p>
          </div>

          {footerGroups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h3 className={`${display} text-lg`}>{g.title}</h3>
              <ul className="mt-3 space-y-2 text-base">
                {g.items.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`underline-offset-4 hover:underline ${focusLight}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className={`${display} text-lg`}>Contact</h3>
            <ul className="mt-3 space-y-2 text-base">
              <li>
                <a
                  href="mailto:support@sdcarsticker.com"
                  className={`underline-offset-4 hover:underline ${focusLight}`}
                >
                  support@sdcarsticker.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+60123456789"
                  className={`underline-offset-4 hover:underline ${focusLight}`}
                >
                  +60 12-345-6789
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#fff7ef]/25">
          <p className={`${wrap} py-5 text-sm text-[#fff7ef]/75`}>
            &copy; {new Date().getFullYear()} SD Car Sticker, Sime Darby. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
