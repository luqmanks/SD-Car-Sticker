import Link from "next/link";
import Image from "next/image";
import { display, focusLight, wrap } from "@/components/landing/styles";

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

/* Footer: kerb stripe, licence-plate contact, link groups and a large wordmark. */
export function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-[#2a1512] text-[#fff7ef]">
      <div
        aria-hidden="true"
        className="h-3 w-full bg-[repeating-linear-gradient(-45deg,#e93b30_0_16px,#fff7ef_16px_32px)]"
      />
      <div className={`${wrap} grid gap-10 pt-12 md:grid-cols-[1.6fr_1fr_1fr]`}>
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/sydepark-logo.svg"
              alt=""
              width={40}
              height={40}
            />
            <span className={`${display} text-xl`}>SydePark</span>
          </div>
          <p className="mt-1 text-base text-[#fff7ef]/80">by Sime Darby</p>
          <p className="mt-4 max-w-xs text-base">
            Making double parking manageable for everyone.
          </p>

          <div className="mt-6">
            <a
              href="mailto:support@sdcarsticker.com"
              className={`block md:inline-block ${focusLight}`}
            >
              <span
                data-btn
                data-shadow="#e93b30"
                className="relative flex w-full items-center justify-center rounded-lg bg-[#fff7ef] px-8 py-2.5 text-[#2a1512] md:inline-flex md:w-auto"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#2a1512]/40"
                />
                <span className={`${display} text-lg`}>
                  support@sdcarsticker.com
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#2a1512]/40"
                />
              </span>
            </a>
            <a
              href="tel:+60123456789"
              className={`mt-3 block w-fit text-base underline-offset-4 hover:underline ${focusLight}`}
            >
              +60 12-345-6789
            </a>
          </div>
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
      </div>

      <p
        aria-hidden="true"
        data-anim="wordmark"
        className={`${display} ${wrap} mt-10 select-none whitespace-nowrap text-[clamp(3rem,14vw,11rem)] leading-[0.9] text-[#fbbc76]`}
      >
        SydePark
      </p>

      <div className="mt-6 border-t border-[#fff7ef]/25">
        <p className={`${wrap} py-5 text-sm text-[#fff7ef]/75`}>
          &copy; {new Date().getFullYear()} SydePark, Sime Darby. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
