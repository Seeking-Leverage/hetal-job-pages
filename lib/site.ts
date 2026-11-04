import type { Metadata } from "next"

function originFromEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback
  try {
    return new URL(value).origin
  } catch {
    throw new Error(`${name} is not a valid absolute URL: ${value}`)
  }
}

function onelinkFromEnv(): string {
  const value = process.env.ONELINK_BASE_URL?.trim() || "https://hetal.onelink.me/placeholder"
  try {
    return new URL(value).toString()
  } catch {
    throw new Error(`ONELINK_BASE_URL is not a valid absolute URL: ${value}`)
  }
}

export const SITE = {
  name: "Hetal Retail",
  url: originFromEnv("SITE_URL", "https://jobs.hetalretail.com"),
  onelinkBase: onelinkFromEnv(),
  supportEmail: "support@hetalretail.com",
  marketingUrl: "https://www.hetalretail.com",
  wordmarkPath: "/hetal-logo.png",
  logoPath: "/hetal-mark.png",
  employmentType: "TEMPORARY",
  educationRequirements: "no requirements",
  experienceRequirements: "no requirements",
} as const

export const jobsIndexMetadata: Metadata = {
  title: "Open gigs",
  description:
    "Open Hetal Retail gigs for Hetalites. See the pay, the city, and what the store visit involves, then download the Hetal app.",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "Open gigs | Hetal Retail",
    description: "See the pay and the city, then download the Hetal app to reserve the visit.",
    url: "/jobs",
  },
}
