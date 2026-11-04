export const PAY_UNITS = ["HOUR", "DAY", "WEEK", "MONTH", "YEAR", "TASK"] as const

export type PayUnit = (typeof PAY_UNITS)[number]

export const SALARY_UNITS = ["HOUR", "DAY", "WEEK", "MONTH", "YEAR"] as const

export type SalaryUnit = (typeof SALARY_UNITS)[number]

export type JobStatus = "open" | "closed"

export type Job = {
  referencenumber: string
  title: string
  title_id: string
  city: string
  state: string
  postalcode: string
  pay: string
  pay_amount: number
  pay_currency: string
  pay_unit: PayUnit
  description_html: string
  status: JobStatus
  date_posted: string
  valid_through: string
}
