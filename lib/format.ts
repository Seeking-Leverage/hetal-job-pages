const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function formatLongDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match || !isIsoDate(isoDate)) return isoDate
  const month = MONTHS[Number(match[2]) - 1]
  return `${month} ${Number(match[3])}, ${match[1]}`
}

export function todayInNewYork(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date())
}

export function formatPlace(city: string, state: string, postalcode: string): string {
  return `${city}, ${state} ${postalcode}`
}

export function excerpt(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= max) return normalized
  const cut = normalized.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const base = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()
  return `${base}…`
}
