import { closedJobDocument } from "@/lib/closed-document"
import { getClosedJobs, getJob } from "@/lib/jobs"

type Context = {
  params: Promise<{ referencenumber: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getClosedJobs().map((job) => ({ referencenumber: job.referencenumber }))
}

export async function GET(_request: Request, context: Context) {
  const { referencenumber } = await context.params
  const job = getJob(referencenumber)
  if (!job || job.status !== "closed") {
    return new Response("That gig is not listed.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  }

  return new Response(closedJobDocument(job), {
    status: 410,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
      "cache-control": "public, max-age=3600",
    },
  })
}
