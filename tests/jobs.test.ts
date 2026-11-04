import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { closedJobDocument } from "../lib/closed-document"
import { formatLongDate } from "../lib/format"
import { sanitizeJobHtml } from "../lib/html"
import { getJob, getOpenJobs, validateJobs } from "../lib/jobs"
import { buildOnelink } from "../lib/onelink"
import { jobPostingSchema } from "../lib/schema"
import type { Job } from "../lib/types"

const nashua = getJob("HR-03060-20261104")
const secaucus = getJob("HR-07094-20261104")
const pawtucket = getJob("HR-02860-20261020")

function sample(overrides: Partial<Job> = {}): Job {
  return {
    referencenumber: "HR-99999-20261104",
    title: "Shelf recording",
    title_id: "shelf-recording",
    city: "Testville",
    state: "NY",
    postalcode: "10001",
    pay: "$10 per visit",
    pay_amount: 10,
    pay_currency: "USD",
    pay_unit: "TASK",
    description_html:
      "<p>Film the assigned grocery aisle at a store in Testville, NY 10001.</p><p>Pay: $10 per visit.</p><p>This is a short, temporary visit. This listing is open through December 15, 2026.</p><p>No experience is required. No special education is required.</p>",
    status: "open",
    date_posted: "2026-11-04",
    valid_through: "2026-12-15",
    ...overrides,
  }
}

describe("jobs.json", () => {
  it("keeps leading zeros on postal codes", () => {
    assert.ok(nashua)
    assert.equal(typeof nashua.postalcode, "string")
    assert.equal(nashua.postalcode, "03060")
    assert.ok(secaucus)
    assert.equal(secaucus!.postalcode, "07094")
    assert.ok(pawtucket)
    assert.equal(pawtucket.postalcode, "02860")
  })

  it("lists only open jobs on the index source", () => {
    const open = getOpenJobs()
    assert.ok(open.length >= 1)
    assert.equal(open.some((job) => job.referencenumber === "HR-02860-20261020"), false)
    assert.equal(open.some((job) => job.status !== "open"), false)
    assert.deepEqual(
      open.map((job) => job.state),
      [...open.map((job) => job.state)].sort(),
    )
  })

  it("puts the pay, place, and deadline in every description", () => {
    for (const job of [nashua, secaucus, pawtucket]) {
      assert.ok(job)
      assert.equal(job.description_html.includes(job.pay), true)
      assert.equal(job.description_html.includes(`${job.city}, ${job.state} ${job.postalcode}`), true)
      assert.equal(
        job.description_html.includes(`This listing is open through ${formatLongDate(job.valid_through)}.`),
        true,
      )
    }
  })
})

describe("OneLink", () => {
  it("fills pid, campaign, ZIP, and reference without dropping the leading zero", () => {
    assert.ok(nashua)
    assert.equal(
      buildOnelink(nashua, "https://hetal.onelink.me/placeholder"),
      "https://hetal.onelink.me/placeholder?pid=indeed&c=shelf-recording&af_sub1=03060&af_sub2=HR-03060-20261104",
    )
  })

  it("uses the title id for a different role", () => {
    const boston = getJob("HR-02115-20261103")
    assert.ok(boston)
    const url = new URL(buildOnelink(boston, "https://hetal.onelink.me/placeholder"))
    assert.equal(url.searchParams.get("c"), "endcap-check")
    assert.equal(url.searchParams.get("af_sub1"), "02115")
    assert.equal(url.searchParams.get("pid"), "indeed")
  })

  it("overwrites params already on the base URL", () => {
    assert.ok(nashua)
    const url = new URL(buildOnelink(nashua, "https://hetal.onelink.me/abc?pid=old&c=old"))
    assert.equal(url.searchParams.get("pid"), "indeed")
    assert.equal(url.searchParams.get("c"), "shelf-recording")
  })
})

describe("JobPosting", () => {
  it("matches the visible job and keeps the ZIP as a string", () => {
    assert.ok(nashua)
    const schema = jobPostingSchema(nashua, "https://jobs.hetalretail.com")
    assert.ok(schema)
    assert.equal(schema.title, nashua.title)
    assert.equal(schema.datePosted, nashua.date_posted)
    assert.equal(schema.validThrough, nashua.valid_through)
    const location = schema.jobLocation as { address: { postalCode: string; addressRegion: string } }
    assert.equal(typeof location.address.postalCode, "string")
    assert.equal(location.address.postalCode, "03060")
    assert.equal(location.address.addressRegion, "NH")
    assert.equal(schema.baseSalary, undefined)
    assert.equal(String(schema.description).includes("$10 per visit"), true)
    assert.equal(String(schema.description).includes("03060"), true)
  })

  it("adds baseSalary only for hourly, daily, weekly, monthly, or yearly pay", () => {
    const hourly = jobPostingSchema(sample({ pay: "$18/hr", pay_amount: 18, pay_unit: "HOUR" }))
    assert.ok(hourly)
    const salary = hourly.baseSalary as { value: { value: number; unitText: string } }
    assert.equal(salary.value.value, 18)
    assert.equal(salary.value.unitText, "HOUR")
  })

  it("omits structured data for a closed job", () => {
    assert.ok(pawtucket)
    assert.equal(jobPostingSchema(pawtucket), null)
  })
})

describe("closed page", () => {
  it("says the job ended and does not include JSON-LD or the download link", () => {
    assert.ok(pawtucket)
    const html = closedJobDocument(pawtucket)
    assert.match(html, /This job is no longer available\./)
    assert.match(html, /Pawtucket, RI 02860/)
    assert.match(html, /href="\/jobs"/)
    assert.equal(html.includes("application/ld+json"), false)
    assert.equal(html.includes("onelink"), false)
    assert.equal(html.includes(pawtucket.pay), false)
  })
})

describe("description html", () => {
  it("drops script tags and keeps the visit copy", () => {
    const clean = sanitizeJobHtml('<p>Pay: $10 per visit in Nashua.</p><script>alert(1)</script>')
    assert.equal(clean.includes("alert"), false)
    assert.equal(clean.includes("Pay: $10 per visit in Nashua."), true)
  })
})

describe("validateJobs", () => {
  it("rejects a ZIP that lost its leading zero", () => {
    assert.throws(() => validateJobs([sample({ postalcode: "3060" })]), /postalcode/)
  })

  it("rejects a numeric ZIP", () => {
    assert.throws(() => validateJobs([sample({ postalcode: 3060 as unknown as string })]), /postalcode/)
  })

  it("rejects two open jobs in the same ZIP", () => {
    assert.throws(
      () =>
        validateJobs([
          sample(),
          sample({ referencenumber: "HR-10001-20261105", city: "Other", description_html: sample().description_html.replaceAll("Testville", "Other") }),
        ]),
      /already open/,
    )
  })
})
