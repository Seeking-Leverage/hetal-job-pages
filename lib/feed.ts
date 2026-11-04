import { sanitizeJobHtml } from "@/lib/html"
import { getOpenJobs } from "@/lib/jobs"
import { SITE } from "@/lib/site"
import type { Job } from "@/lib/types"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const FEED_COUNTRY = "United States"
export const FEED_JOBTYPE = "temporary"

export function feedContactEmail(): string {
  const value = process.env.FEED_CONTACT_EMAIL?.trim() || SITE.supportEmail
  if (!EMAIL.test(value)) {
    throw new Error(`FEED_CONTACT_EMAIL is not an email address: ${value}`)
  }
  return value
}

export function jobPageUrl(job: Pick<Job, "referencenumber">, origin = SITE.url): string {
  return `${origin}/jobs/${job.referencenumber}`
}

function cdata(value: string): string {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`
}

function element(name: string, value: string): string {
  return `<${name}>${cdata(value)}</${name}>`
}

export function feedJobElements(job: Job, origin = SITE.url, email = feedContactEmail()): string[] {
  const fields: Array<[string, string]> = [
    ["title", job.title],
    ["date", job.date_posted],
    ["referencenumber", job.referencenumber],
    ["requisitionid", job.requisitionid],
    ["url", jobPageUrl(job, origin)],
    ["company", SITE.name],
    ["city", job.city],
    ["state", job.state],
    ["country", FEED_COUNTRY],
    ["postalcode", job.postalcode],
    ["email", email],
    ["description", sanitizeJobHtml(job.description_html)],
    ["jobtype", FEED_JOBTYPE],
    ["salary", job.pay],
  ]
  return fields.map(([name, value]) => element(name, value))
}

export function buildIndeedFeed(origin = SITE.url, email = feedContactEmail()): string {
  const jobs = getOpenJobs()
    .map((job) => `  <job>\n${feedJobElements(job, origin, email).map((line) => `    ${line}`).join("\n")}\n  </job>`)
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<source>
  ${element("publisher", SITE.name)}
  ${element("publisherurl", origin)}
${jobs}
</source>
`
}
