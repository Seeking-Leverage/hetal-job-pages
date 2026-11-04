# Hetal job pages

Public pages for open Hetal Retail gigs. Indeed needs one URL per job. Each page shows the title, pay, city, state, and ZIP from `content/jobs.json`, then sends the worker to the Hetal app.

The pages are server-rendered. The words on the page are in the HTML, so they can be read with JavaScript turned off.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
npm test
npm run build
```

## Add or close a job

Edit `content/jobs.json`. No code change. A build reads that file and regenerates the pages.

Each job needs:

| Field | Notes |
| --- | --- |
| `referencenumber` | Unique. Letters, numbers, hyphens. Used in `/jobs/{referencenumber}`. Make a new one when the title changes. |
| `title` | Job title only. Example: `Shelf recording`. Do not put the city or the pay in the title. |
| `title_id` | Campaign slug for the download link, such as `shelf-recording`. |
| `city` | City name. |
| `state` | Two-letter USPS code. |
| `postalcode` | **String** of 5 digits. `"03060"` keeps the zero. A number will not. |
| `pay` | Exact text shown on the page, such as `$10 per visit` or `$18/hr`. |
| `pay_amount` | Number that appears inside `pay`. |
| `pay_currency` | `USD`. |
| `pay_unit` | `TASK` for a per-visit rate. `HOUR`, `DAY`, `WEEK`, `MONTH`, or `YEAR` also adds salary structured data. |
| `description_html` | HTML for the visit. Must include the pay text, `City, ST ZIP`, `No experience is required.`, `No special education is required.`, the word temporary, and `This listing is open through Month D, YYYY.` using the same date as `valid_through`. |
| `status` | `open` or `closed`. |
| `date_posted` | `YYYY-MM-DD`. |
| `valid_through` | `YYYY-MM-DD`. One open job per ZIP. |

Set `status` to `closed` when the visit ends. The URL stays up, says the job is no longer available, links to the open list, returns HTTP 410, and has no JobPosting structured data.

Only one open job per ZIP. A second open job in the same ZIP fails the build.

## Download link

The button is a normal link. It opens `ONELINK_BASE_URL` with:

- `pid=indeed`
- `c={title_id}`
- `af_sub1={postalcode}`
- `af_sub2={referencenumber}`

Copy `.env.example` to `.env.local` and set the real AppsFlyer OneLink. `SITE_URL` is the public origin, `https://jobs.hetalretail.com`. Changing either value needs a new build, because the pages are generated ahead of time.

Until those values are set, the site uses `https://hetal.onelink.me/placeholder` and `https://jobs.hetalretail.com`.

## Domain

On Vercel, add `jobs.hetalretail.com` and set `ONELINK_BASE_URL` and `SITE_URL`. The DNS admin adds a CNAME for `jobs` to the target Vercel shows (usually `cname.vercel-dns.com`).

## Placeholders

Sample gigs in `content/jobs.json` are not live Indeed postings. Pay is a single per-visit figure in the range Hetal publishes for Hetalites, until the client confirms the rate.

The header uses the public Hetal wordmark. Colors are the public site navy `#112041`, cream `#fffcf2`, and yellow `#ffdc5c`. Replace `public/hetal-logo.png` and `public/hetal-mark.png` when final brand files arrive. The square mark is what JobPosting JSON-LD points at, because Google asks for a logo whose width-to-height ratio is between 0.75 and 2.5. The wordmark is wider than that.

After deploy, run an open job URL through [Google's Rich Results Test](https://search.google.com/test/rich-results). The logo URL has to be reachable on the public domain.
