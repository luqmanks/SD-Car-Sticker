import { display, h2, screen, wrap } from "@/components/landing/styles";

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

/* A testimonial as a windscreen: trapezoid glass, a static wiper, a sticker in the corner. */
function Windscreen({
  t,
  className = "",
}: {
  t: (typeof testimonials)[number];
  className?: string;
}) {
  return (
    <figure
      className={`[filter:drop-shadow(10px_10px_0_#f48436)] ${className}`}
    >
      <div className="relative bg-[#fff7ef] px-10 pb-16 pt-9 text-[#2a1512] [clip-path:polygon(6%_0,94%_0,100%_100%,0_100%)] md:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(251,188,118,.35)_38%,rgba(251,188,118,.35)_46%,transparent_46%,transparent_52%,rgba(251,188,118,.22)_52%,rgba(251,188,118,.22)_55%,transparent_55%)]"
        />
        <span
          aria-hidden="true"
          className={`${display} absolute left-8 top-2 text-8xl leading-none text-[#e93b30]`}
        >
          &ldquo;
        </span>

        <blockquote className="relative pt-9 text-base leading-relaxed">
          {t.quote}
        </blockquote>

        <figcaption className="relative mt-5">
          <span
            className={`${display} inline-block rounded-md border-2 border-[#2a1512] bg-[#fbbc76] px-3 py-1 text-lg`}
          >
            {t.name}
          </span>
          <span className="mt-2 block text-base">{t.role}</span>
        </figcaption>

        <span
          aria-hidden="true"
          className="absolute bottom-5 left-8 h-1.5 w-[62%] origin-left rounded-full bg-[#2a1512]"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[1.05rem] left-[1.6rem] h-3 w-3 rounded-full bg-[#2a1512]"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-5 right-14 h-4 w-4 rounded-full border-2 border-[#fff7ef] bg-[#e93b30]"
        />
      </div>
    </figure>
  );
}

/* Testimonials: each quote on a windscreen. */
export function Testimonials() {
  return (
    <section className={`${screen} overflow-hidden bg-[#f49c9c]`}>
      <div className={`${wrap} py-16`}>
        <h2 className={h2}>Heard from drivers in Pekan</h2>
        <p className="mt-2 text-base">Both quotes translated from Malay.</p>

        <div
          data-anim="windscreens"
          className="mt-10 grid gap-14 md:grid-cols-2 md:gap-10"
        >
          <Windscreen t={testimonials[0]} className="md:-rotate-1" />
          <Windscreen t={testimonials[1]} className="md:mt-10 md:rotate-1" />
        </div>
      </div>
    </section>
  );
}
