"use client"

import Link from "next/link"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">This page did not load</h1>
      <p className="mt-3 text-lg leading-7">Refresh and try again, or go back to the open gigs.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 h-14 w-full bg-primary px-4 text-base font-semibold text-primary-foreground"
      >
        Try again
      </button>
      <Link href="/jobs" className="mt-3 block text-center font-semibold underline underline-offset-2">
        See open gigs
      </Link>
    </div>
  )
}
