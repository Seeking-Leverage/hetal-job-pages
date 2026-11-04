import { SITE } from "@/lib/site"
import type { Job } from "@/lib/types"

export function buildOnelink(
  job: Pick<Job, "title_id" | "postalcode" | "referencenumber">,
  base = SITE.onelinkBase,
): string {
  let url: URL
  try {
    url = new URL(base)
  } catch {
    throw new Error(`ONELINK_BASE_URL is not a valid absolute URL: ${base}`)
  }
  url.searchParams.set("pid", "indeed")
  url.searchParams.set("c", job.title_id)
  url.searchParams.set("af_sub1", job.postalcode)
  url.searchParams.set("af_sub2", job.referencenumber)
  return url.toString()
}
