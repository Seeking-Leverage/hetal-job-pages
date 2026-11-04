import { buildIndeedFeed } from "@/lib/feed"

export function GET() {
  return new Response(buildIndeedFeed(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
