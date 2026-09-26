import { BOOKS } from './books'
import { bookIsBundled } from './bundled'

type DailyPick = {
  bookId: string
  chapter: number
  verse: number
}

/** Fruit passages that exist in the bundled books. The same calendar day chooses the same one. */
const DAILY: readonly DailyPick[] = [
  { bookId: 'gal', chapter: 5, verse: 22 },
  { bookId: 'gal', chapter: 5, verse: 23 },
  { bookId: 'jhn', chapter: 15, verse: 12 },
  { bookId: '1co', chapter: 13, verse: 4 },
  { bookId: 'php', chapter: 4, verse: 4 },
  { bookId: 'php', chapter: 4, verse: 7 },
  { bookId: 'col', chapter: 3, verse: 12 },
  { bookId: 'col', chapter: 3, verse: 15 },
  { bookId: 'eph', chapter: 4, verse: 32 },
  { bookId: 'rom', chapter: 15, verse: 13 },
  { bookId: '1jn', chapter: 4, verse: 19 },
  { bookId: 'gal', chapter: 6, verse: 1 },
  { bookId: '2pe', chapter: 1, verse: 6 },
  { bookId: 'jas', chapter: 1, verse: 4 },
  { bookId: 'mat', chapter: 5, verse: 9 },
  { bookId: 'tit', chapter: 3, verse: 14 },
  { bookId: '1pe', chapter: 3, verse: 8 },
  { bookId: 'gal', chapter: 2, verse: 20 },
  { bookId: 'jhn', chapter: 15, verse: 5 },
  { bookId: '1co', chapter: 13, verse: 13 },
]

export const SCENES = ['vine', 'grapes', 'book', 'olive', 'water', 'fig'] as const
export type SceneId = (typeof SCENES)[number]

export type DailyPassage = {
  bookIndex: number
  chapter: number
  verse: number
}

export function localDayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
}

export function dailyVerse(date = new Date()): DailyPassage {
  const pick = DAILY[localDayNumber(date) % DAILY.length]
  const bookIndex = BOOKS.findIndex((book) => book.id === pick.bookId)
  if (bookIndex < 0 || !bookIsBundled(pick.bookId)) {
    const gal = BOOKS.findIndex((book) => book.id === 'gal')
    return { bookIndex: gal, chapter: 5, verse: 22 }
  }
  return { bookIndex, chapter: pick.chapter, verse: pick.verse }
}

export function dailyScene(date = new Date()): SceneId {
  return SCENES[localDayNumber(date) % SCENES.length]
}

export function greetingKey(date = new Date()): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
  const hour = date.getHours()
  if (hour < 12) return 'greetingMorning'
  if (hour < 17) return 'greetingAfternoon'
  return 'greetingEvening'
}

const namedGreeting = {
  greetingMorning: 'greetingMorningNamed',
  greetingAfternoon: 'greetingAfternoonNamed',
  greetingEvening: 'greetingEveningNamed',
} as const

export function namedGreetingKey(date = new Date()) {
  return namedGreeting[greetingKey(date)]
}
