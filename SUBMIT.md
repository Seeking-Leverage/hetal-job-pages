# Submit the Hetal feed to Indeed

Live feed URL, once `SITE_URL` is the public origin:

`https://jobs.hetalretail.com/feed.xml`

Until `jobs.hetalretail.com` is attached, set `SITE_URL` to the Vercel origin and give Indeed that URL with `/feed.xml` on the end. The feed is only the jobs with `status` `open` in `content/jobs.json`.

`FEED_CONTACT_EMAIL` is the `<email>` inside every job. Use the email on the Indeed employer account.

## Checklist

1. Deploy with `SITE_URL` set to the origin Indeed can fetch, and `FEED_CONTACT_EMAIL` set to the Indeed account email.
2. Open `/feed.xml` on that origin. The response `Content-Type` is `application/xml`, and the body lists the open gigs only.
3. Run `VALIDATE_ORIGIN=https://that-origin npm run validate-feed`. It must pass before you send the URL.
4. Open the Indeed employer contact form: [https://www.indeed.com/hire/contact-us](https://www.indeed.com/hire/contact-us).
5. Send this:
   - Company: Hetal Retail
   - Website: the `SITE_URL` origin
   - XML feed URL: `{SITE_URL}/feed.xml`
   - Contact email: the same address as `FEED_CONTACT_EMAIL`
   - Ask Indeed to crawl the Job Sync XML feed and add the open jobs to the employer account.
6. Keep at least 3 open jobs in the feed. Indeed does not process a smaller feed.
7. After Indeed confirms, open one listing and check the title, pay, city, state, and ZIP against `/jobs/{referencenumber}`.
