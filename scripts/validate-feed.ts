import { spawnSync } from "node:child_process"
import { FEED_COUNTRY, FEED_JOBTYPE, feedContactEmail } from "../lib/feed"
import { getClosedJobs, getOpenJobs } from "../lib/jobs"
import { sanitizeJobHtml } from "../lib/html"
import { SITE } from "../lib/site"

const REQUIRED = [
  "title",
  "date",
  "referencenumber",
  "requisitionid",
  "url",
  "company",
  "city",
  "state",
  "country",
  "postalcode",
  "email",
  "description",
  "jobtype",
  "salary",
] as const

type FeedJob = Record<(typeof REQUIRED)[number], string>

const origin = (process.env.VALIDATE_ORIGIN ?? "http://127.0.0.1:43127").replace(/\/$/, "")
const errors: string[] = []

function fail(message: string) {
  errors.push(message)
}

function parseFeed(xml: string): { publisher: string; publisherurl: string; jobs: FeedJob[] } {
  const parsed = spawnSync(
    "python3",
    [
      "-c",
      `
import json, sys, xml.etree.ElementTree as ET
raw = sys.stdin.read()
try:
    root = ET.fromstring(raw)
except ET.ParseError as exc:
    print(str(exc), file=sys.stderr)
    sys.exit(2)
if root.tag != "source":
    print("root is " + root.tag, file=sys.stderr)
    sys.exit(3)
def text(node):
    return "" if node is None or node.text is None else node.text
jobs = []
for job in root.findall("job"):
    jobs.append({child.tag: text(child) for child in list(job)})
print(json.dumps({"publisher": text(root.find("publisher")), "publisherurl": text(root.find("publisherurl")), "jobs": jobs}))
`,
    ],
    { input: xml, encoding: "utf8" },
  )
  if (parsed.status !== 0) {
    throw new Error(parsed.stderr.trim() || "XML is not well formed")
  }
  return JSON.parse(parsed.stdout) as { publisher: string; publisherurl: string; jobs: FeedJob[] }
}

function pageTitle(html: string): string {
  const match = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)
  if (!match) return ""
  return match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

async function main() {
  const feedResponse = await fetch(`${origin}/feed.xml`)
  if (!feedResponse.ok) {
    throw new Error(`${origin}/feed.xml returned ${feedResponse.status}. Start the app, then run npm run validate-feed.`)
  }
  const contentType = feedResponse.headers.get("content-type") ?? ""
  if (!contentType.includes("application/xml")) {
    fail(`Content-Type is ${contentType || "missing"}, expected application/xml`)
  }
  const xml = await feedResponse.text()
  if (xml.includes("&amp;") || xml.includes("&lt;") || xml.includes("&gt;") || /&#\d+;|&#x[0-9a-f]+;/i.test(xml)) {
    fail("Feed text uses HTML entities. Put values in CDATA instead.")
  }
  if (!xml.includes("<![CDATA[")) {
    fail("Feed text is not wrapped in CDATA")
  }

  const feed = parseFeed(xml)
  if (feed.publisher !== SITE.name) fail(`publisher is ${JSON.stringify(feed.publisher)}`)
  if (feed.publisherurl !== SITE.url) fail(`publisherurl is ${JSON.stringify(feed.publisherurl)}, expected ${SITE.url}`)

  const open = getOpenJobs()
  const closed = new Set(getClosedJobs().map((job) => job.referencenumber))
  if (feed.jobs.length < 3) fail(`Feed has ${feed.jobs.length} jobs. Indeed needs at least 3 open jobs.`)
  if (feed.jobs.length !== open.length) fail(`Feed has ${feed.jobs.length} jobs. ${open.length} jobs are open.`)

  const seen = new Set<string>()
  for (const job of feed.jobs) {
    for (const field of REQUIRED) {
      if (typeof job[field] !== "string" || job[field].trim() === "") {
        fail(`${job.referencenumber || "(missing reference)"}: ${field} is missing`)
      }
    }
    const ref = job.referencenumber
    if (seen.has(ref)) fail(`${ref}: referencenumber is duplicated`)
    seen.add(ref)
    if (closed.has(ref)) fail(`${ref}: closed job is in the feed`)
    if (!/^\d{5}$/.test(job.postalcode)) fail(`${ref}: postalcode ${JSON.stringify(job.postalcode)} is not 5 digits`)

    const source = open.find((item) => item.referencenumber === ref)
    if (!source) {
      fail(`${ref}: feed job is not an open job`)
      continue
    }
    if (job.postalcode !== source.postalcode) fail(`${ref}: postalcode ${job.postalcode} does not match ${source.postalcode}`)
    if (job.title !== source.title) fail(`${ref}: title does not match the job page`)
    if (job.date !== source.date_posted) fail(`${ref}: date does not match the posted date`)
    if (job.requisitionid !== source.requisitionid) fail(`${ref}: requisitionid does not match jobs.json`)
    if (job.salary !== source.pay) fail(`${ref}: salary does not match the pay on the page`)
    if (job.city !== source.city || job.state !== source.state) fail(`${ref}: city or state does not match the page`)
    if (job.country !== FEED_COUNTRY) fail(`${ref}: country is ${JSON.stringify(job.country)}`)
    if (job.company !== SITE.name) fail(`${ref}: company does not match the page`)
    if (job.jobtype !== FEED_JOBTYPE) fail(`${ref}: jobtype is ${JSON.stringify(job.jobtype)}`)
    if (job.email !== feedContactEmail()) fail(`${ref}: email does not match FEED_CONTACT_EMAIL`)
    if (job.description !== sanitizeJobHtml(source.description_html)) {
      fail(`${ref}: description does not match the HTML on the job page`)
    }
    const expectedUrl = `${SITE.url}/jobs/${ref}`
    if (job.url !== expectedUrl) fail(`${ref}: url is ${job.url}, expected ${expectedUrl}`)

    const pageUrl = new URL(`/jobs/${ref}`, origin)
    const page = await fetch(pageUrl)
    if (page.status !== 200) fail(`${pageUrl} returned ${page.status}`)
    else {
      const title = pageTitle(await page.text())
      if (title !== job.title) fail(`${ref}: page title ${JSON.stringify(title)} does not match feed title ${JSON.stringify(job.title)}`)
    }
  }

  for (const job of closed) {
    if (seen.has(job)) fail(`${job}: closed job is in the feed`)
  }

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"))
    process.exit(1)
  }
  console.log(`${feed.jobs.length} open jobs in ${origin}/feed.xml. Closed jobs are absent. ZIP codes kept their leading zeros.`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
