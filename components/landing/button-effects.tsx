"use client";

import { useEffect } from "react";
import gsap from "gsap";

/*
  Hover motion for every element marked data-btn: it lifts, a hard shadow grows underneath,
  the arrow icon (data-arrow) flicks out to the corner, and a press drops it back down.

  Optional attributes on the element:
    data-shadow        shadow colour (default ink)
    data-rest-shadow   shadow at rest, "x y blur spread colour" (default none)
    data-hover-shadow  shadow on hover (default 0 6px under the button)

  Runs only where there is a real hover (mouse or trackpad) and the visitor has not asked for
  reduced motion. Keyboard focus triggers the same motion.
*/
export function ButtonEffects() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
      const cleanups: Array<() => void> = [];

      document.querySelectorAll<HTMLElement>("[data-btn]").forEach((el) => {
        const trigger = (el.closest("a,button") as HTMLElement | null) ?? el;
        const arrow = el.querySelector<SVGElement>("[data-arrow]");
        const color = el.dataset.shadow ?? "#2a1512";
        const rest = el.dataset.restShadow ?? `0px 0px 0px 0px ${color}`;
        const lifted = el.dataset.hoverShadow ?? `0px 6px 0px 0px ${color}`;

        gsap.set(el, { boxShadow: rest });

        const lift = () => {
          gsap.to(el, {
            y: -4,
            boxShadow: lifted,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
          if (arrow)
            gsap.to(arrow, {
              x: 4,
              y: -4,
              duration: 0.35,
              ease: "back.out(2.5)",
              overwrite: "auto",
            });
        };
        const settle = () => {
          gsap.to(el, {
            y: 0,
            boxShadow: rest,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
          if (arrow)
            gsap.to(arrow, {
              x: 0,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
        };
        const press = () =>
          gsap.to(el, {
            y: 0,
            boxShadow: rest,
            duration: 0.1,
            ease: "power1.out",
            overwrite: "auto",
          });
        const focusIn = () => {
          if (trigger.matches(":focus-visible")) lift();
        };

        trigger.addEventListener("mouseenter", lift);
        trigger.addEventListener("mouseleave", settle);
        trigger.addEventListener("mousedown", press);
        trigger.addEventListener("mouseup", lift);
        trigger.addEventListener("focusin", focusIn);
        trigger.addEventListener("focusout", settle);

        cleanups.push(() => {
          trigger.removeEventListener("mouseenter", lift);
          trigger.removeEventListener("mouseleave", settle);
          trigger.removeEventListener("mousedown", press);
          trigger.removeEventListener("mouseup", lift);
          trigger.removeEventListener("focusin", focusIn);
          trigger.removeEventListener("focusout", settle);
        });
      });

      return () => cleanups.forEach((c) => c());
    });

    return () => mm.revert();
  }, []);

  return null;
}
