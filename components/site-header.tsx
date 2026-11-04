import Image from "next/image"
import Link from "next/link"
import { SITE } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="bg-foreground text-background">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/jobs" className="block">
          <Image
            src={SITE.wordmarkPath}
            alt={SITE.name}
            width={170}
            height={28}
            priority
            className="h-7 w-auto invert"
          />
        </Link>
        <Link href="/jobs" className="text-[0.95rem] font-semibold text-background">
          Open gigs
        </Link>
      </div>
      <div className="h-1 bg-primary" aria-hidden="true" />
    </header>
  )
}
