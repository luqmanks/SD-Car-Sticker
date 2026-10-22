/*
  Shared class strings for the landing page sections.

  Sime Darby palette
  red #e93b30   orange #f48436   apricot #fbbc76   coral #f46c6c   blush #f49c9c
  Support tones derived from the red:
  ink #2a1512 (asphalt, text)   paper #fff7ef (light panels)
  #d2332a = red deepened just enough for white text to pass AA on buttons

  Fonts (set up in layout.tsx): Clash Display Semibold for headings, Archivo Regular for body.
  Clash is a single weight, so headings use font-normal to stop the browser faking a bold.

  Hover motion on buttons is done with GSAP in button-effects.tsx. Any element with data-btn gets it,
  so these class strings deliberately have no transition-transform or hover:translate classes.
*/

export const display =
  "font-[family-name:var(--font-clash)] font-normal tracking-[-0.02em]";
export const focusDark =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2a1512]";
export const focusLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fbbc76]";
export const screen = "relative flex min-h-[100svh] flex-col justify-center";
export const wrap = "mx-auto w-full max-w-6xl px-6 md:px-10";
export const h2 = `${display} text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]`;
export const cta =
  "inline-flex w-full items-center justify-center gap-2 px-6 py-4 md:w-auto md:justify-start";
