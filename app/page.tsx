import { JobsIndex } from "@/components/jobs-index"
import { jobsIndexMetadata } from "@/lib/site"

export const metadata = jobsIndexMetadata

export default function HomePage() {
  return <JobsIndex />
}
