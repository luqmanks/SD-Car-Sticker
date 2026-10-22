"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
  Scroll-in motion for the sections below the hero. Each one is specific to what the section shows,
  and each plays once. Elements are found by their data-anim attribute, so the sections themselves
  can stay server components.

    stairs       the staircase builds up from the ground, one step after another
    tickets      the alert tickets drop onto the windscreen
    windscreens  the two quotes slide in from opposite sides
    sticker      the sticker is stamped on
    wordmark     the footer wordmark rises into place

  With reduced motion, none of this runs.
*/
export function ScrollEffects() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const once = (trigger: Element, start = "top 80%") => ({
        trigger,
        start,
        once: true,
      });

      document
        .querySelectorAll<HTMLElement>('[data-anim="stairs"]')
        .forEach((el) => {
          gsap.from(el.children, {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.18,
            clearProps: "clipPath",
            scrollTrigger: once(el),
          });
        });

      document
        .querySelectorAll<HTMLElement>('[data-anim="tickets"]')
        .forEach((el) => {
          gsap.from(el.children, {
            y: -70,
            opacity: 0,
            duration: 0.7,
            ease: "back.out(1.6)",
            stagger: 0.15,
            scrollTrigger: once(el),
          });
        });

      document
        .querySelectorAll<HTMLElement>('[data-anim="windscreens"]')
        .forEach((el) => {
          gsap.from(el.children, {
            x: (i) => (i === 0 ? -80 : 80),
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: once(el),
          });
        });

      document
        .querySelectorAll<HTMLElement>('[data-anim="sticker"]')
        .forEach((el) => {
          gsap.from(el, {
            scale: 1.35,
            opacity: 0,
            duration: 0.7,
            ease: "back.out(1.7)",
            scrollTrigger: once(el),
          });
        });

      document
        .querySelectorAll<HTMLElement>('[data-anim="wordmark"]')
        .forEach((el) => {
          gsap.from(el, {
            yPercent: 45,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: once(el, "top 95%"),
          });
        });
    });

    return () => mm.revert();
  }, []);

  return null;
}
