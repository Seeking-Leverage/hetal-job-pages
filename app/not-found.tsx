import Link from "next/link"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div>
      <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">That gig is not listed</h1>
      <p className="mt-3 text-lg leading-7">The link may be mistyped. Open gigs are on one page.</p>
      <Link
        href="/jobs"
        className={cn(buttonVariants({ size: "lg" }), "mt-6 h-14 w-full px-4 text-base font-semibold hover:bg-[#e6c43a]")}
      >
        See open gigs
      </Link>
    </div>
  )
}
