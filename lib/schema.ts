import { sanitizeJobHtml } from "@/lib/html"
import { SITE } from "@/lib/site"
import { SALARY_UNITS, type Job, type SalaryUnit } from "@/lib/types"

function isSalaryUnit(unit: Job["pay_unit"]): unit is SalaryUnit {
  return (SALARY_UNITS as readonly string[]).includes(unit)
}

export function jobPostingSchema(job: Job, origin = SITE.url): Record<string, unknown> | null {
  if (job.status !== "open") return null

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: sanitizeJobHtml(job.description_html),
    datePosted: job.date_posted,
    validThrough: job.valid_through,
    employmentType: SITE.employmentType,
    directApply: false,
    educationRequirements: SITE.educationRequirements,
    experienceRequirements: SITE.experienceRequirements,
    identifier: {
      "@type": "PropertyValue",
      name: SITE.name,
      value: job.referencenumber,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: SITE.name,
      sameAs: SITE.marketingUrl,
      logo: `${origin}${SITE.logoPath}`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: job.state,
        postalCode: job.postalcode,
        addressCountry: "US",
      },
    },
    url: `${origin}/jobs/${job.referencenumber}`,
  }

  if (isSalaryUnit(job.pay_unit)) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.pay_currency,
      value: {
        "@type": "QuantitativeValue",
        value: job.pay_amount,
        unitText: job.pay_unit,
      },
    }
  }

  return schema
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
