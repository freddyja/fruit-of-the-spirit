import type { Language } from '../i18n/messages'
import { BOOKS } from './books'

/** Whole-Bible paces. Chapter counts stay whole; days share the canon evenly. */
export const PLAN_PACES = [90, 180, 365] as const

export type PlanPace = (typeof PLAN_PACES)[number]

export type ChapterRef = {
  bookIndex: number
  chapter: number
}

export type PlanDay = {
  day: number
  start: ChapterRef
  end: ChapterRef
}

const CHAPTERS: readonly ChapterRef[] = BOOKS.flatMap((book, bookIndex) =>
  Array.from({ length: book.chapters }, (_, index) => ({ bookIndex, chapter: index + 1 })),
)

const cache = new Map<PlanPace, readonly PlanDay[]>()

/**
 * Sequential Protestant canon, Genesis through Revelation.
 * Remainder chapters are spread through the plan so no day is empty
 * and no chapter is split.
 */
export function planForPace(pace: PlanPace): readonly PlanDay[] {
  const cached = cache.get(pace)
  if (cached) return cached
  const total = CHAPTERS.length
  const base = Math.floor(total / pace)
  const extra = total % pace
  const bump = new Set<number>()
  for (let index = 0; index < extra; index += 1) {
    bump.add(Math.floor((index * pace) / extra))
  }
  const days: PlanDay[] = []
  let cursor = 0
  for (let index = 0; index < pace; index += 1) {
    const count = base + (bump.has(index) ? 1 : 0)
    const start = CHAPTERS[cursor]
    const end = CHAPTERS[cursor + count - 1]
    if (!start || !end) break
    days.push({ day: index + 1, start, end })
    cursor += count
  }
  cache.set(pace, days)
  return days
}

/** One line per book inside a day’s reading, such as “1 Kings 15–22”. */
export function planBookLines(language: Language, day: PlanDay): string[] {
  const lines: string[] = []
  for (let bookIndex = day.start.bookIndex; bookIndex <= day.end.bookIndex; bookIndex += 1) {
    const book = BOOKS[bookIndex]
    if (!book) continue
    const startChapter = bookIndex === day.start.bookIndex ? day.start.chapter : 1
    const endChapter = bookIndex === day.end.bookIndex ? day.end.chapter : book.chapters
    const name = book.names[language]
    lines.push(startChapter === endChapter ? `${name} ${startChapter}` : `${name} ${startChapter}–${endChapter}`)
  }
  return lines
}

/** The books for a day, such as “1 Kings – 2 Kings” or “Genesis”. */
export function planTitle(language: Language, day: PlanDay): string {
  const start = BOOKS[day.start.bookIndex]?.names[language] ?? ''
  const end = BOOKS[day.end.bookIndex]?.names[language] ?? ''
  if (!start || day.start.bookIndex === day.end.bookIndex) return start
  return `${start} – ${end}`
}

export function formatPlanSpan(language: Language, day: PlanDay): string {
  const startBook = BOOKS[day.start.bookIndex]
  const endBook = BOOKS[day.end.bookIndex]
  if (!startBook || !endBook) return ''
  const startName = startBook.names[language]
  const endName = endBook.names[language]
  if (day.start.bookIndex === day.end.bookIndex && day.start.chapter === day.end.chapter) {
    return `${startName} ${day.start.chapter}`
  }
  if (day.start.bookIndex === day.end.bookIndex) {
    return `${startName} ${day.start.chapter}–${day.end.chapter}`
  }
  return `${startName} ${day.start.chapter} – ${endName} ${day.end.chapter}`
}
