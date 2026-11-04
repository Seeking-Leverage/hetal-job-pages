import { formatLongDate, formatPlace } from "@/lib/format"
import { SITE } from "@/lib/site"
import type { Job } from "@/lib/types"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function closedJobDocument(job: Job): string {
  const title = escapeHtml(job.title)
  const place = escapeHtml(formatPlace(job.city, job.state, job.postalcode))
  const posted = escapeHtml(formatLongDate(job.date_posted))
  const reference = escapeHtml(job.referencenumber)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#112041">
  <title>This job is no longer available | ${escapeHtml(SITE.name)}</title>
  <link rel="icon" href="/icon.png">
  <link rel="preload" href="/fonts/SourceSans3-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/SourceSans3-Semibold.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face { font-family: "Source Sans 3"; src: url("/fonts/SourceSans3-Regular.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: "Source Sans 3"; src: url("/fonts/SourceSans3-Semibold.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
    * { box-sizing: border-box; }
    html { color-scheme: light; }
    body { margin: 0; background: #fffcf2; color: #112041; font-family: "Source Sans 3", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; }
    ::selection { background: #ffdc5c; color: #112041; }
    .skip { position: absolute; left: 0.75rem; top: 0.75rem; transform: translateY(-150%); background: #ffdc5c; color: #112041; padding: 0.5rem 0.75rem; font-weight: 600; z-index: 2; }
    .skip:focus { transform: none; }
    .header { background: #112041; }
    .bar { max-width: 36rem; margin: 0 auto; padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .header img { display: block; height: 28px; width: auto; filter: invert(1); }
    .nav { color: #fffcf2; font-weight: 600; font-size: 0.95rem; text-decoration: none; }
    .nav:focus-visible, .cta:focus-visible, .footer a:focus-visible { outline: 2px solid #112041; outline-offset: 3px; }
    .stripe { height: 4px; background: #ffdc5c; }
    main { max-width: 36rem; margin: 0 auto; padding: 1.5rem 1rem 2rem; }
    .eyebrow { margin: 0; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #3e4d66; }
    h1 { margin: 0.45rem 0 0; font-size: 2rem; line-height: 1.15; font-weight: 600; letter-spacing: -0.02em; }
    .banner { margin: 1.25rem 0 0; background: #fff; border: 1px solid #e4dcc8; padding: 1rem 1.05rem; font-size: 1.35rem; font-weight: 600; line-height: 1.3; }
    .where { margin: 0.9rem 0 0; font-size: 1.125rem; }
    .meta { margin: 0.4rem 0 0; color: #3e4d66; font-size: 0.95rem; }
    .cta { display: flex; align-items: center; justify-content: center; margin-top: 1.5rem; min-height: 3.5rem; padding: 0.8rem 1rem; background: #ffdc5c; color: #112041; font-weight: 600; font-size: 1.05rem; text-decoration: none; text-align: center; }
    .cta:hover { background: #e6c43a; }
    .footer { max-width: 36rem; margin: 0 auto; padding: 0 1rem 2.5rem; color: #3e4d66; font-size: 0.9rem; }
    .footer-inner { border-top: 1px solid #e4dcc8; padding-top: 1.25rem; }
    .footer p { margin: 0.35rem 0; }
    .footer a { color: #112041; }
  </style>
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="header">
    <div class="bar">
      <a href="/jobs"><img src="${SITE.wordmarkPath}" alt="${escapeHtml(SITE.name)}" width="170" height="28"></a>
      <a class="nav" href="/jobs">Open gigs</a>
    </div>
    <div class="stripe"></div>
  </header>
  <main id="content">
    <p class="eyebrow">Closed</p>
    <h1>${title}</h1>
    <p class="banner">This job is no longer available.</p>
    <p class="where">${place} · United States</p>
    <p class="meta">Posted ${posted}. Reference ${reference}.</p>
    <a class="cta" href="/jobs">See open gigs</a>
  </main>
  <footer class="footer">
    <div class="footer-inner">
      <p>Hetal Retail hires Hetalites to record shelves while they shop.</p>
      <p><a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a></p>
      <p><a href="${SITE.marketingUrl}">hetalretail.com</a></p>
    </div>
  </footer>
</body>
</html>`
}
