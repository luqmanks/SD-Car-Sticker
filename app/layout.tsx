import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Fonts live in public/fonts, so the paths go up one level from app/
const clash = localFont({
  src: "../public/fonts/ClashDisplay-Semibold.otf",
  variable: "--font-clash",
  display: "swap",
});

const archivo = localFont({
  src: "../public/fonts/Archivo-Regular.otf",
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to your live domain so link previews (WhatsApp, etc.) get absolute image URLs
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "SydePark - Double parking, solved with a tap",
  description:
    "SydePark by Sime Darby: solve double parking with just a tap using NFC stickers",
  icons: {
    icon: [
      { url: "/images/sydepark-logo.svg", type: "image/svg+xml" },
      {
        url: "/images/sydepark-logo-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: "/images/sydepark-logo-512.png",
  },
  openGraph: {
    title: "SydePark - Double parking, solved with a tap",
    description:
      "Register once, stick it on your windshield, and anyone you block can reach you in seconds.",
    siteName: "SydePark",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "SydePark",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${clash.variable} ${archivo.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
