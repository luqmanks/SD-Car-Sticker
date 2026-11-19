"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { display } from "@/components/landing/styles";

gsap.registerPlugin(ScrollTrigger);

export function Sticker() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        calm: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)",
        wide: "(min-width: 1024px)",
      },
      (ctx) => {
        const { calm, wide } = ctx.conditions as {
          calm: boolean;
          wide: boolean;
        };
        const offset = wide ? 12 : 8;

        const q = gsap.utils.selector(el);
        const face = q("[data-face]");
        const shadow = q("[data-shadow-layer]");
        const dot = q("[data-nfc-dot]");
        const waves = q("[data-nfc-wave]");
        const lines = q("[data-line]");

        // Reduced motion: just show the resting state.
        if (calm) {
          gsap.set(shadow, { x: offset, y: offset });
          return;
        }

        gsap.set(el, { autoAlpha: 0, scale: 1.6, rotation: -14, y: -40 });
        gsap.set(shadow, { x: 0, y: 0 });
        gsap.set(dot, { svgOrigin: "40 100", scale: 0 });
        gsap.set(waves, { opacity: 0 });
        gsap.set(lines, { yPercent: 110 });

        // Waves ripple outward on a loop, and again on every tap.
        const ripple = gsap
          .timeline({ paused: true, repeat: -1, repeatDelay: 1.6 })
          .fromTo(
            waves,
            { opacity: 0.15 },
            { opacity: 1, duration: 0.25, stagger: 0.18, ease: "power1.out" },
          )
          .to(waves, { opacity: 0.15, duration: 0.5, stagger: 0.1 }, ">0.3");

        const slap = gsap.timeline({
          paused: true,
          onComplete: () => {
            gsap.to(el, {
              y: -6,
              duration: 2.2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
            ripple.play();
          },
        });

        slap
          // drop onto the windshield
          .to(el, {
            autoAlpha: 1,
            scale: 1,
            rotation: 3,
            y: 0,
            duration: 0.55,
            ease: "power4.in",
          })
          // impact squash
          .to(face, {
            scaleX: 1.05,
            scaleY: 0.94,
            duration: 0.08,
            ease: "power1.out",
            transformOrigin: "50% 100%",
          })
          .to(face, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.35)",
          })
          // the hard shadow pops out as it lands
          .to(
            shadow,
            {
              x: offset,
              y: offset,
              duration: 0.45,
              ease: "back.out(2.5)",
            },
            "<",
          )
          .to(dot, { scale: 1, duration: 0.4, ease: "back.out(3)" }, "-=0.4")
          .to(
            lines,
            { yPercent: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" },
            "<0.1",
          );

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          once: true,
          onEnter: () => slap.play(),
        });

        // Press-in on tap or click.
        const press = () => {
          gsap.to(shadow, { x: 2, y: 2, duration: 0.1, overwrite: "auto" });
          gsap.to(face, {
            x: offset - 2,
            y: offset - 2,
            duration: 0.1,
            overwrite: "auto",
          });
          ripple.restart();
        };
        const release = () => {
          gsap.to(shadow, {
            x: offset,
            y: offset,
            duration: 0.5,
            ease: "elastic.out(1, 0.4)",
            overwrite: "auto",
          });
          gsap.to(face, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.4)",
            overwrite: "auto",
          });
        };

        el.addEventListener("pointerdown", press);
        window.addEventListener("pointerup", release);

        return () => {
          trigger.kill();
          el.removeEventListener("pointerdown", press);
          window.removeEventListener("pointerup", release);
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      style={{ transform: "rotate(3deg)" }}
      className="relative aspect-square w-[min(60vw,16rem)] cursor-pointer select-none lg:w-[22rem]"
    >
      {/* hard offset shadow, animated by GSAP */}
      <div
        data-shadow-layer
        className="absolute inset-0 rounded-[2rem] bg-[#2a1512] lg:rounded-[2.5rem]"
      />

      <div
        data-face
        className="relative h-full w-full rounded-[2rem] bg-[#fff7ef] p-6 text-[#2a1512] lg:rounded-[2.5rem] lg:p-8"
      >
        <svg viewBox="0 0 200 200" className="h-[52%] w-[52%] overflow-visible">
          <circle data-nfc-dot cx="40" cy="100" r="13" fill="#e93b30" />
          <path
            data-nfc-wave
            d="M68 70a42 42 0 0 1 0 60"
            fill="none"
            stroke="#e93b30"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            data-nfc-wave
            d="M92 46a76 76 0 0 1 0 108"
            fill="none"
            stroke="#e93b30"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            data-nfc-wave
            d="M116 22a110 110 0 0 1 0 156"
            fill="none"
            stroke="#f48436"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>

        <p
          className={`${display} absolute bottom-6 left-6 right-6 text-2xl leading-[1.05] lg:bottom-8 lg:left-8 lg:right-8 lg:text-3xl`}
        >
          <span className="block overflow-hidden">
            <span data-line className="block">
              Tap to reach
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-line className="block">
              the owner
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}
