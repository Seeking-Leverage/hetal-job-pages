import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DownloadAppLink } from "@/components/download-app-link"
import { excerpt, formatLongDate } from "@/lib/format"
import { plainText, sanitizeJobHtml } from "@/lib/html"
import { getJob, getOpenJobs } from "@/lib/jobs"
import { buildOnelink } from "@/lib/onelink"
import { jobPostingSchema, serializeJsonLd } from "@/lib/schema"
import type { Job } from "@/lib/types"

type Props = {
  params: Promise<{ referencenumber: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getOpenJobs().map((job) => ({ referencenumber: job.referencenumber }))
}

function metaDescription(job: Job): string {
  const lead = `${job.pay} in ${job.city}, ${job.state} ${job.postalcode}.`
  return excerpt(`${lead} ${plainText(job.description_html)}`, 160)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { referencenumber } = await params
  const job = getJob(referencenumber)
  if (!job || job.status !== "open") {
    return { title: "That gig is not listed", robots: { index: false, follow: true } }
  }
  const title = `${job.title} in ${job.city}, ${job.state}`
  const description = metaDescription(job)
  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.referencenumber}` },
    openGraph: {
      title: `${title} | Hetal Retail`,
      description,
      url: `/jobs/${job.referencenumber}`,
    },
  }
}

export default async function JobPage({ params }: Props) {
  const { referencenumber } = await params
  const job = getJob(referencenumber)
  if (!job || job.status !== "open") notFound()

  const schema = jobPostingSchema(job)
  if (!schema) notFound()

  const html = sanitizeJobHtml(job.description_html)

  return (
    <article>
      <p className="text-[0.8rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Open gig</p>
      <h1 className="mt-2 text-[2rem] leading-tight font-semibold tracking-tight">{job.title}</h1>
      <p className="mt-4 inline-block bg-primary px-3 py-2 text-[2.5rem] leading-none font-semibold tracking-tight text-primary-foreground">
        {job.pay}
      </p>
      <p className="mt-4 text-lg">
        {job.city}, {job.state} <span translate="no">{job.postalcode}</span>
        <span className="text-muted-foreground"> · United States</span>
      </p>
      <div className="mt-5">
        <DownloadAppLink href={buildOnelink(job)} />
        <p className="mt-2 text-sm text-muted-foreground">
          Opens the Hetal app download. You will reserve this visit there.
        </p>
      </div>
      <div className="job-description mt-8 text-[1.0625rem] leading-7" dangerouslySetInnerHTML={{ __html: html }} />
      <p className="mt-8 text-sm text-muted-foreground">
        Posted {formatLongDate(job.date_posted)}. Reference <span translate="no">{job.referencenumber}</span>.
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    </article>
  )
}
