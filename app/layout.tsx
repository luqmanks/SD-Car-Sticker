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
  title: "SD Car Sticker - Sime Darby Car Sticker",
  description:
    "Sime Darby Car Sticker: solve double parking with just a tap using NFC stickers",
  icons: {
    icon: "/images/sd-logo.svg",
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
