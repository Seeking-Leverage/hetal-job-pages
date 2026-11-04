import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getJob } from "@/lib/jobs"

export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/jobs\/([^/]+)\/?$/)
  if (!match) return NextResponse.next()

  let referencenumber = match[1]
  try {
    referencenumber = decodeURIComponent(referencenumber)
  } catch {
    return NextResponse.next()
  }

  const job = getJob(referencenumber)
  if (!job || job.status !== "closed") return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/gone/${job.referencenumber}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/jobs/:referencenumber"],
}
