import rawJobs from "@/content/jobs.json"
import { formatLongDate, formatPlace, isIsoDate } from "@/lib/format"
import { PAY_UNITS, type Job, type JobStatus, type PayUnit } from "@/lib/types"

const REFERENCE = /^[A-Za-z0-9][A-Za-z0-9_-]{1,63}$/
const TITLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const STATE = /^[A-Z]{2}$/
const POSTAL = /^\d{5}$/
const CURRENCY = /^[A-Z]{3}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mentionsAmount(pay: string, amount: number): boolean {
  if (pay.includes(String(amount))) return true
  return pay.includes(amount.toFixed(2))
}

function asPayUnit(value: unknown): PayUnit | null {
  return typeof value === "string" && (PAY_UNITS as readonly string[]).includes(value) ? (value as PayUnit) : null
}

export function validateJobs(input: unknown): Job[] {
  const errors: string[] = []
  if (!Array.isArray(input)) {
    throw new Error("jobs.json must be an array of jobs")
  }

  const jobs: Job[] = []
  const seenRefs = new Set<string>()
  const openZips = new Map<string, string>()

  input.forEach((entry, index) => {
    const errorsBefore = errors.length
    const label = `Job ${index + 1}`
    if (!isRecord(entry)) {
      errors.push(`${label} must be an object`)
      return
    }

    const ref = typeof entry.referencenumber === "string" ? entry.referencenumber : ""
    const where = ref || label

    if (!REFERENCE.test(ref)) {
      errors.push(`${where}: referencenumber must be 2 to 64 letters, numbers, hyphens, or underscores`)
    } else if (seenRefs.has(ref)) {
      errors.push(`${where}: referencenumber is duplicated`)
    } else {
      seenRefs.add(ref)
    }

    const title = entry.title
    if (typeof title !== "string" || title.trim() !== title || title.length < 2 || title.length > 80) {
      errors.push(`${where}: title must be 2 to 80 characters`)
    } else if (title === title.toUpperCase() && /[A-Z]/.test(title)) {
      errors.push(`${where}: title should be a job title, not all caps`)
    }

    const titleId = entry.title_id
    if (typeof titleId !== "string" || !TITLE_ID.test(titleId)) {
      errors.push(`${where}: title_id must be a lowercase slug such as shelf-recording`)
    }

    const requisitionid = entry.requisitionid
    if (typeof requisitionid !== "string" || !REFERENCE.test(requisitionid)) {
      errors.push(`${where}: requisitionid must be 2 to 64 letters, numbers, hyphens, or underscores`)
    }

    const city = entry.city
    if (typeof city !== "string" || city.trim().length < 2 || /[\r\n]/.test(city)) {
      errors.push(`${where}: city must be plain text`)
    }

    const state = entry.state
    if (typeof state !== "string" || !STATE.test(state)) {
      errors.push(`${where}: state must be a 2-letter USPS code`)
    }

    const postalcode = entry.postalcode
    if (typeof postalcode !== "string" || !POSTAL.test(postalcode)) {
      errors.push(
        `${where}: postalcode must be a 5-digit string so leading zeros stay put (got ${JSON.stringify(postalcode)})`,
      )
    }

    const pay = entry.pay
    if (typeof pay !== "string" || pay.trim().length < 2 || pay !== pay.trim()) {
      errors.push(`${where}: pay must be the text shown on the page, such as "$10 per visit"`)
    }

    const payAmount = entry.pay_amount
    if (typeof payAmount !== "number" || !Number.isFinite(payAmount) || payAmount <= 0) {
      errors.push(`${where}: pay_amount must be a positive number`)
    } else if (typeof pay === "string" && !mentionsAmount(pay, payAmount)) {
      errors.push(`${where}: pay text must include pay_amount (${payAmount})`)
    }

    const payCurrency = entry.pay_currency
    if (typeof payCurrency !== "string" || !CURRENCY.test(payCurrency)) {
      errors.push(`${where}: pay_currency must be a 3-letter code such as USD`)
    }

    const payUnit = asPayUnit(entry.pay_unit)
    if (!payUnit) {
      errors.push(`${where}: pay_unit must be one of ${PAY_UNITS.join(", ")}`)
    }

    const status = entry.status
    if (status !== "open" && status !== "closed") {
      errors.push(`${where}: status must be open or closed`)
    }

    const datePosted = entry.date_posted
    if (typeof datePosted !== "string" || !isIsoDate(datePosted)) {
      errors.push(`${where}: date_posted must be YYYY-MM-DD`)
    }

    const validThrough = entry.valid_through
    if (typeof validThrough !== "string" || !isIsoDate(validThrough)) {
      errors.push(`${where}: valid_through must be YYYY-MM-DD`)
    } else if (typeof datePosted === "string" && isIsoDate(datePosted) && validThrough < datePosted) {
      errors.push(`${where}: valid_through cannot be before date_posted`)
    }

    const description = entry.description_html
    if (typeof description !== "string" || description.trim().length < 80) {
      errors.push(`${where}: description_html must be HTML that explains the visit`)
    } else if (/<script|on\w+\s*=|javascript:/i.test(description)) {
      errors.push(`${where}: description_html contains unsafe markup`)
    } else if (typeof title === "string" && description.trim() === title.trim()) {
      errors.push(`${where}: description_html cannot be the same as the title`)
    }

    if (
      typeof city === "string" &&
      typeof state === "string" &&
      typeof postalcode === "string" &&
      typeof description === "string" &&
      !description.includes(formatPlace(city, state, postalcode))
    ) {
      errors.push(`${where}: description_html must include "${formatPlace(city, state, postalcode)}"`)
    }

    if (typeof pay === "string" && typeof description === "string" && !description.includes(pay)) {
      errors.push(`${where}: description_html must include the pay text exactly`)
    }

    if (typeof description === "string" && !description.includes("No experience is required.")) {
      errors.push(`${where}: description_html must say "No experience is required."`)
    }

    if (typeof description === "string" && !description.includes("No special education is required.")) {
      errors.push(`${where}: description_html must say "No special education is required."`)
    }

    if (typeof description === "string" && !/temporary/i.test(description)) {
      errors.push(`${where}: description_html must say the visit is temporary`)
    }

    if (typeof description === "string" && typeof validThrough === "string" && isIsoDate(validThrough)) {
      const sentence = `This listing is open through ${formatLongDate(validThrough)}.`
      if (!description.includes(sentence)) {
        errors.push(`${where}: description_html must include "${sentence}"`)
      }
    }

    if (
      status === "open" &&
      typeof postalcode === "string" &&
      POSTAL.test(postalcode) &&
      ref
    ) {
      const other = openZips.get(postalcode)
      if (other) {
        errors.push(`${where}: ZIP ${postalcode} is already open on ${other}`)
      } else {
        openZips.set(postalcode, ref)
      }
    }

    if (errors.length > errorsBefore) return

    if (
      typeof title === "string" &&
      typeof titleId === "string" &&
      typeof requisitionid === "string" &&
      typeof city === "string" &&
      typeof state === "string" &&
      typeof postalcode === "string" &&
      typeof pay === "string" &&
      typeof payAmount === "number" &&
      typeof payCurrency === "string" &&
      payUnit &&
      typeof description === "string" &&
      (status === "open" || status === "closed") &&
      typeof datePosted === "string" &&
      typeof validThrough === "string"
    ) {
      jobs.push({
        referencenumber: ref,
        requisitionid,
        title,
        title_id: titleId,
        city,
        state,
        postalcode,
        pay,
        pay_amount: payAmount,
        pay_currency: payCurrency,
        pay_unit: payUnit,
        description_html: description,
        status: status as JobStatus,
        date_posted: datePosted,
        valid_through: validThrough,
      })
    }
  })

  if (errors.length > 0) {
    throw new Error(`jobs.json\n${errors.map((error) => `- ${error}`).join("\n")}`)
  }

  return jobs
}

let cache: Job[] | null = null

export function getJobs(): Job[] {
  if (!cache) cache = validateJobs(rawJobs)
  return cache
}

export function getJob(referencenumber: string): Job | null {
  return getJobs().find((job) => job.referencenumber === referencenumber) ?? null
}

export function getOpenJobs(): Job[] {
  return getJobs()
    .filter((job) => job.status === "open")
    .sort(
      (a, b) =>
        a.state.localeCompare(b.state) ||
        a.city.localeCompare(b.city) ||
        a.title.localeCompare(b.title) ||
        a.referencenumber.localeCompare(b.referencenumber),
    )
}

export function getClosedJobs(): Job[] {
  return getJobs().filter((job) => job.status === "closed")
}
