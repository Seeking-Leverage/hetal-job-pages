import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import localFont from "next/font/local"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SITE } from "@/lib/site"
import "./globals.css"

const sans = localFont({
  src: [
    { path: "../public/fonts/SourceSans3-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/SourceSans3-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-app-sans",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Open gigs | Hetal Retail",
    template: "%s | Hetal Retail",
  },
  description:
    "Open Hetal Retail gigs for Hetalites. See the pay, the city, and what the store visit involves, then download the Hetal app.",
  applicationName: "Hetal Retail",
  openGraph: {
    siteName: "Hetal Retail",
    type: "website",
    locale: "en_US",
  },
}

export const viewport: Viewport = {
  themeColor: "#112041",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="mx-auto w-full max-w-xl px-4 py-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
