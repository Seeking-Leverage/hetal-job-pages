import Link from "next/link"
import { formatLongDate } from "@/lib/format"
import { getOpenJobs } from "@/lib/jobs"

export function JobsIndex() {
  const jobs = getOpenJobs()

  return (
    <div>
      <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">Open gigs</h1>
      <p className="mt-3 text-lg leading-7">
        See the pay and the city, then download the Hetal app to reserve the visit. Each gig is one
        store recording. No sign-in on this page.
      </p>
      {jobs.length === 0 ? (
        <div className="mt-6 border border-border bg-card px-4 py-6">
          <p className="text-lg font-semibold">No open gigs right now.</p>
          <p className="mt-2">Check back soon. New visits show up here when they are added to the jobs file.</p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-lg">
            {jobs.length} open {jobs.length === 1 ? "gig" : "gigs"}.
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {jobs.map((job) => (
              <li key={job.referencenumber}>
                <Link
                  href={`/jobs/${job.referencenumber}`}
                  className="block border border-border bg-card px-4 py-4 text-foreground no-underline hover:border-foreground"
                >
                  <span className="block text-xl leading-tight font-semibold">{job.title}</span>
                  <span className="mt-3 inline-block bg-primary px-2 py-1 text-lg leading-none font-semibold text-primary-foreground">
                    {job.pay}
                  </span>
                  <span className="mt-3 block">
                    {job.city}, {job.state} {job.postalcode}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Posted {formatLongDate(job.date_posted)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
