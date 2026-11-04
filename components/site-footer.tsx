import { SITE } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-xl px-4 pt-2 pb-10 text-sm text-muted-foreground">
      <div className="border-t border-border pt-6">
        <p>Hetal Retail hires Hetalites to record shelves while they shop.</p>
        <p className="mt-2">
          <a className="text-foreground underline underline-offset-2" href={`mailto:${SITE.supportEmail}`}>
            {SITE.supportEmail}
          </a>
        </p>
        <p className="mt-1">
          <a className="text-foreground underline underline-offset-2" href={SITE.marketingUrl}>
            hetalretail.com
          </a>
        </p>
      </div>
    </footer>
  )
}
