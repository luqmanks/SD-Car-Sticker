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
      className="h-[16svh] w-full grow md:h-auto md:grow-0"
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

  const card = `group flex w-full items-center justify-between gap-3 px-4 py-3 text-left md:gap-4 md:px-5 md:py-4 ${focusLight}`;
  const arrow = "h-5 w-5 shrink-0 max-md:[@media(max-height:760px)]:hidden";

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

      <div
        className={`${wrap} flex flex-1 flex-col pb-5 pt-[4.5rem] md:block md:flex-none md:pb-10 md:pt-24`}
      >
        <div className="flex flex-col gap-3 max-md:flex-1 md:grid md:items-center md:gap-8 lg:grid-cols-[1fr_30rem] lg:gap-14">
          <div>
            <h1
              className={`${display} text-[clamp(2rem,4.8vw,4rem)] leading-[1]`}
            >
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="hero-line block">Blocked in?</span>
              </span>
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="hero-line block">Tap the sticker.</span>
              </span>
            </h1>
            <p className="hero-copy mt-2 max-w-md text-sm leading-snug text-[#fff7ef]/85 max-md:[@media(max-height:760px)]:hidden md:mt-5 md:text-lg md:leading-relaxed">
              Register once, stick it on your windshield, and anyone you are
              blocking can reach you in seconds. No honking, no hunting for the
              owner.
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-[34rem] flex-col max-md:flex-1 md:block lg:max-w-none">
            <div className="relative flex flex-col overflow-hidden rounded-2xl bg-[#3a221d] p-2 max-md:flex-1 md:block md:p-3">
              <CarPark />
              <div
                role="status"
                className="hp-notif relative mt-2 w-full opacity-0 sm:absolute sm:bottom-4 sm:right-4 sm:mt-0 sm:w-[62%] rounded-2xl bg-[#fff7ef] p-2.5 text-[#2a1512] sm:p-3 shadow-[0_6px_0_rgba(0,0,0,.25)]"
              >
                <div className="flex items-center gap-2 text-sm max-md:[@media(max-height:760px)]:hidden">
                  <span
                    className="h-4 w-4 rounded bg-[#e93b30]"
                    aria-hidden="true"
                  />
                  <span>SydePark, now</span>
                </div>
                <p
                  className={`${display} text-sm leading-snug sm:mt-1 sm:text-base`}
                >
                  Someone is blocked behind your car
                </p>
                <p className="hidden text-sm sm:block">
                  Please move it when you can.
                </p>
              </div>
            </div>
            <button
              onClick={() => tapRef.current?.restart()}
              className={`mt-2 hidden text-sm underline underline-offset-4 hover:text-[#fbbc76] sm:block ${focusLight}`}
            >
              Replay the tap
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 max-md:flex-1 max-md:grid-rows-[1fr] md:mt-8 md:items-start max-md:[@media(max-height:760px)]:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] md:gap-3">
          <Link
            href="/blocked/scan"
            data-btn
            data-rest-shadow="6px 6px 0px 0px #fbbc76"
            data-hover-shadow="8px 12px 0px 0px #fbbc76"
            className={`${card} hero-card max-md:[@media(max-height:760px)]:col-span-2 bg-[#d2332a] py-5 text-white max-md:min-h-[6.75rem] max-md:!shadow-none md:min-h-[8.75rem] md:py-6`}
          >
            <span>
              <span className={`${display} block text-3xl`}>I'm blocked</span>
              <span className="block text-base">
                Scan the sticker on the car in your way
              </span>
            </span>
            <ArrowUpRight
              className="h-8 w-8 shrink-0 md:h-7 md:w-7"
              data-arrow
            />
          </Link>

          <div className="hero-card relative">
            <button
              onClick={onOwnerClick}
              aria-expanded={isAuthenticated ? ownerOpen : undefined}
              data-btn
              data-shadow="#d2332a"
              className={`${card} bg-[#fbbc76] text-[#2a1512] md:min-h-[8.25rem]`}
            >
              <span>
                <span className={`${display} block text-lg md:text-xl`}>
                  I'm a car owner
                </span>
                <span className="block text-sm max-md:[@media(max-height:760px)]:hidden md:text-[15px]">
                  Register a car or switch on double park mode
                </span>
              </span>
              <ArrowUpRight className={arrow} data-arrow />
            </button>
            {isAuthenticated && ownerOpen && (
              <div className="grid gap-px bg-[#2a1512] max-md:absolute max-md:bottom-full max-md:left-0 max-md:z-20 max-md:mb-1 max-md:w-[min(20rem,calc(100vw-3rem))]">
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
              <span className={`${display} block text-lg md:text-xl`}>
                I spotted a problem
              </span>
              <span className="block text-sm max-md:[@media(max-height:760px)]:hidden md:text-[15px]">
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
