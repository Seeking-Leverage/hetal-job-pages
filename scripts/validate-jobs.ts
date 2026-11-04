import { todayInNewYork } from "../lib/format"
import { getJobs, getOpenJobs } from "../lib/jobs"

const jobs = getJobs()
const open = getOpenJobs()
const today = todayInNewYork()

for (const job of open) {
  if (job.valid_through < today) {
    console.warn(
      `Warning: ${job.referencenumber} is open but valid_through ${job.valid_through} is before ${today}.`,
    )
  }
}

console.log(`${jobs.length} jobs, ${open.length} open, ${jobs.length - open.length} closed`)
