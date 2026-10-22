"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSession } from "@/hooks/use-session";
import { display, focusLight, screen, wrap } from "@/components/landing/styles";

gsap.registerPlugin(useGSAP);

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

function CarPark() {
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
      <g className="hp-car">
        <Car x={130} y={185} r={90} color="#fff7ef" />
        <circle
          cx="153"
          cy="175"
          r="5.5"
          fill="#e93b30"
          stroke="#fff7ef"
          strokeWidth="1.5"
        />
      </g>

      {/* rings from the sticker, played by the timeline in Hero */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx="153"
          cy="175"
          r="10"
          fill="none"
          stroke="#fbbc76"
          strokeWidth="2.5"
          opacity="0"
          className="hp-ring"
        />
      ))}
    </svg>
  );
}

/* Hero: a live top-down car park, the three entry points, and the login state in the header. */
export function Hero() {
  const [ownerOpen, setOwnerOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const tapRef = useRef<gsap.core.Timeline | null>(null);
  const { user, logout } = useSession();
  const isAuthenticated = !!user;

  const onOwnerClick = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setOwnerOpen((o) => !o);
  };

  /*
    Hero motion, in two parts:
    1. Intro: headline lines rise out of a mask, then the copy and the three cards come in.
    2. The tap: the white car drives in and double-parks, its sticker sends out three rings,
       then the notification arrives. "Replay the tap" restarts this timeline.
    With reduced motion, nothing moves and the notification is simply shown.
  */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (!ctx.conditions?.motion) {
            gsap.set(".hp-notif", { opacity: 1 });
            return;
          }
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from(".hero-line", { yPercent: 110, duration: 0.9, stagger: 0.12 })
            .from(".hero-copy", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
            .from(
              ".hero-card",
              { y: 30, opacity: 0, duration: 0.7, stagger: 0.1 },
              "-=0.5",
            );
          const ringTween = () =>
            gsap.fromTo(
              ".hp-ring",
              { scale: 0.3, opacity: 0.95, svgOrigin: "153 175" },
              {
                scale: 6,
                opacity: 0,
                svgOrigin: "153 175",
                duration: 1.5,
                ease: "power1.out",
                stagger: 0.4,
                repeat: -1,
                repeatDelay: 0.8,
                immediateRender: false,
              },
            );

          tapRef.current = gsap
            .timeline({ delay: 0.5 })
            .fromTo(
              ".hp-car",
              { x: -260 },
              { x: 0, duration: 1.1, ease: "power3.out" },
            )
            .add(ringTween(), "-=0.1")
            .fromTo(
              ".hp-notif",
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
              "-=0.4",
            );
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  const card = `group flex w-full items-center justify-between gap-4 px-5 py-4 text-left ${focusLight}`;
  const arrow = "h-5 w-5 shrink-0";

  return (
    <section ref={root} className={`${screen} bg-[#2a1512] text-[#fff7ef]`}>
      <header className="absolute inset-x-0 top-0 z-10">
        <div className={`${wrap} flex items-center justify-between py-4`}>
          <Link href="/" className={`flex items-center gap-3 ${focusLight}`}>
            <Image
              src="/images/sydepark-logo.svg"
              alt=""
              width={36}
              height={36}
            />
            <span className={`${display} text-lg`}>SydePark</span>
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
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="hero-line block">Blocked in?</span>
              </span>
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="hero-line block">Tap the sticker.</span>
              </span>
            </h1>
            <p className="hero-copy mt-5 max-w-md text-base leading-relaxed text-[#fff7ef]/85 md:text-lg">
              Register once, stick it on your windshield, and anyone you are
              blocking can reach you in seconds. No honking, no hunting for the
              owner.
            </p>
          </div>

          <div>
            <div className="relative overflow-hidden rounded-2xl bg-[#3a221d] p-3">
              <CarPark />
              <div
                role="status"
                className="hp-notif absolute bottom-4 right-4 opacity-0 w-[62%] rounded-2xl bg-[#fff7ef] p-3 text-[#2a1512] shadow-[0_6px_0_rgba(0,0,0,.25)]"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="h-4 w-4 rounded bg-[#e93b30]"
                    aria-hidden="true"
                  />
                  <span>SydePark, now</span>
                </div>
                <p className={`${display} mt-1 text-base leading-snug`}>
                  Someone is blocked behind your car
                </p>
                <p className="text-sm">Please move it when you can.</p>
              </div>
            </div>
            <button
              onClick={() => tapRef.current?.restart()}
              className={`mt-2 text-sm underline underline-offset-4 hover:text-[#fbbc76] ${focusLight}`}
            >
              Replay the tap
            </button>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <Link
            href="/blocked/scan"
            data-btn
            data-rest-shadow="6px 6px 0px 0px #fbbc76"
            data-hover-shadow="8px 12px 0px 0px #fbbc76"
            className={`${card} hero-card bg-[#d2332a] py-6 text-white md:min-h-[8.75rem]`}
          >
            <span>
              <span className={`${display} block text-3xl`}>I'm blocked</span>
              <span className="block text-base">
                Scan the sticker on the car in your way
              </span>
            </span>
            <ArrowUpRight className="h-7 w-7 shrink-0" data-arrow />
          </Link>

          <div className="hero-card">
            <button
              onClick={onOwnerClick}
              aria-expanded={isAuthenticated ? ownerOpen : undefined}
              data-btn
              data-shadow="#d2332a"
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
              <ArrowUpRight className={arrow} data-arrow />
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
            data-btn
            data-shadow="#fbbc76"
            className={`${card} hero-card bg-[#fff7ef] text-[#2a1512] md:min-h-[6.5rem]`}
          >
            <span>
              <span className={`${display} block text-xl`}>
                I spotted a problem
              </span>
              <span className="block text-[15px]">
                Send a car alert to the owner
              </span>
            </span>
            <ArrowUpRight className={arrow} data-arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
