import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

export function DownloadAppLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-14 w-full px-4 text-base font-semibold whitespace-normal hover:bg-[#e6c43a]",
      )}
    >
      Download the Hetal app
    </a>
  )
}
