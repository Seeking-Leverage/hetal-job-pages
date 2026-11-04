import type { MetadataRoute } from "next"
import { getOpenJobs } from "@/lib/jobs"
import { SITE } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const jobs = getOpenJobs().map((job) => ({
    url: `${SITE.url}/jobs/${job.referencenumber}`,
    lastModified: job.date_posted,
  }))

  return [
    {
      url: `${SITE.url}/jobs`,
      lastModified: jobs[0]?.lastModified,
    },
    ...jobs,
  ]
}
