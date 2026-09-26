import type { Language } from '../i18n/messages'
import { BOOKS } from './books.ts'

export type PassageRef = {
  bookIndex: number
  chapter: number
  verse: number
}

const SHORT: Record<string, string[]> = {
  gen: ['gn', 'ge', 'gen'],
  exo: ['ex', 'exo', 'exod'],
  lev: ['lv', 'lev'],
  num: ['nm', 'num'],
  deu: ['dt', 'deut'],
  jos: ['josh', 'jos'],
  jdg: ['judg', 'jdg', 'jg'],
  rut: ['ru'],
  '1sa': ['1 sam', '1sa', '1 sm'],
  '2sa': ['2 sam', '2sa', '2 sm'],
  '1ki': ['1 kgs', '1ki', '1 kg'],
  '2ki': ['2 kgs', '2ki', '2 kg'],
  '1ch': ['1 chr', '1ch'],
  '2ch': ['2 chr', '2ch'],
  ezr: ['ezr'],
  neh: ['neh'],
  est: ['est'],
  job: ['jb'],
  psa: ['ps', 'psa', 'psalm', 'psalms', 'salmo', 'salmos'],
  pro: ['prov', 'prv'],
  ecc: ['eccl', 'ecc', 'qoh'],
  sng: ['song', 'song of songs', 'sos', 'cant', 'cantar', 'canticles'],
  isa: ['isa', 'is'],
  jer: ['jer'],
  lam: ['lam'],
  ezk: ['ezek', 'ezk', 'eze'],
  dan: ['dan', 'dn'],
  hos: ['hos'],
  jol: ['jl'],
  amo: ['am'],
  oba: ['obad', 'ob'],
  jon: ['jonah', 'jon'],
  mic: ['mic'],
  nah: ['nah'],
  hab: ['hab'],
  zep: ['zeph', 'zep'],
  hag: ['hag'],
  zec: ['zech', 'zec'],
  mal: ['mal'],
  mat: ['matt', 'mt'],
  mrk: ['mk', 'mrk'],
  luk: ['lk', 'luk'],
  jhn: ['jn', 'jhn', 'juan', 'joao'],
  act: ['ac'],
  rom: ['ro', 'rom'],
  '1co': ['1 cor', '1co'],
  '2co': ['2 cor', '2co'],
  gal: ['gal'],
  eph: ['eph'],
  php: ['phil', 'php'],
  col: ['col'],
  '1th': ['1 thess', '1th'],
  '2th': ['2 thess', '2th'],
  '1ti': ['1 tim', '1ti'],
  '2ti': ['2 tim', '2ti'],
  tit: ['titus', 'tit'],
  phm: ['phlm', 'phm', 'philem'],
  heb: ['heb'],
  jas: ['jas', 'james'],
  '1pe': ['1 pet', '1pe', '1 pt'],
  '2pe': ['2 pet', '2pe', '2 pt'],
  '1jn': ['1 jn', '1jn'],
  '2jn': ['2 jn', '2jn'],
  '3jn': ['3 jn', '3jn'],
  jud: ['jude'],
  rev: ['rev', 'ap', 'apocalypse'],
}

const ROMAN: Record<string, string> = { '1': 'i', '2': 'ii', '3': 'iii' }

export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function aliasesFor(index: number): string[] {
  const book = BOOKS[index]
  const aliases = new Set<string>(SHORT[book.id] ?? [])
  for (const name of Object.values(book.names)) {
    const folded = fold(name)
    aliases.add(folded)
    const numbered = /^([123]) (.+)$/.exec(folded)
    if (!numbered) continue
    const roman = ROMAN[numbered[1]]
    aliases.add(`${roman} ${numbered[2]}`)
    aliases.add(`${numbered[1]}${numbered[2]}`)
  }
  return [...aliases]
}

const aliasToBook = new Map<string, number>()
BOOKS.forEach((_, index) => {
  for (const alias of aliasesFor(index)) {
    const existing = aliasToBook.get(alias)
    if (existing !== undefined && existing !== index) continue
    aliasToBook.set(alias, index)
  }
})

export function normalizeReference(value: string): string {
  return fold(value)
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s:-]/g, ' ')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

const referencePattern = /^(.+?)\s+(\d+):(\d+)(?:-\d+)?$/

export function parseReference(value: string): PassageRef | null {
  const match = referencePattern.exec(normalizeReference(value))
  if (!match) return null
  const bookIndex = aliasToBook.get(match[1])
  if (bookIndex === undefined) return null
  const chapter = Number(match[2])
  const verse = Number(match[3])
  if (chapter < 1 || verse < 1) return null
  return { bookIndex, chapter, verse }
}

export function matchBook(value: string): number | null {
  const folded = fold(value).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const index = aliasToBook.get(folded)
  return index === undefined ? null : index
}

export function formatPassage(language: Language, passage: PassageRef): string {
  const name = BOOKS[passage.bookIndex]?.names[language] ?? ''
  return `${name} ${passage.chapter}:${passage.verse}`
}

export function formatPassageRange(
  language: Language,
  passage: PassageRef & { endVerse?: number },
): string {
  const name = BOOKS[passage.bookIndex]?.names[language] ?? ''
  const end = passage.endVerse
  if (end !== undefined && end > passage.verse) return `${name} ${passage.chapter}:${passage.verse}–${end}`
  return `${name} ${passage.chapter}:${passage.verse}`
}

export function samePassage(a: PassageRef, b: PassageRef): boolean {
  return a.bookIndex === b.bookIndex && a.chapter === b.chapter && a.verse === b.verse
}
