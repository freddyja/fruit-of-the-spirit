import { BOOKS } from './books'
import { bookIsBundled } from './bundled'
import { versionById } from './versions'

const books = new Map<string, string[][]>()

function scriptureUrl(path: string): string {
  return `${import.meta.env.BASE_URL}scripture/${path}`
}

export function peekBook(versionId: string, bookIndex: number): string[][] | null {
  const id = BOOKS[bookIndex]?.id
  if (!id) return null
  return books.get(`${versionId}:${id}`) ?? null
}

export async function loadBook(versionId: string, bookIndex: number): Promise<string[][] | null> {
  const book = BOOKS[bookIndex]
  if (!book || !bookIsBundled(book.id)) return null
  const folder = versionById(versionId)?.folder
  if (!folder) return null
  const key = `${versionId}:${book.id}`
  const cached = books.get(key)
  if (cached) return cached
  const response = await fetch(scriptureUrl(`${folder}/${book.id}.json`))
  if (response.status === 404) return null
  if (!response.ok) throw new Error('chapter')
  const chapters = (await response.json()) as string[][]
  books.set(key, chapters)
  return chapters
}

export async function loadVerse(
  versionId: string,
  bookIndex: number,
  chapter: number,
  verse: number,
): Promise<string | null> {
  const chapters = await loadBook(versionId, bookIndex)
  return chapters?.[chapter - 1]?.[verse - 1] ?? null
}

export type ScriptureHit = {
  bookIndex: number
  chapter: number
  verse: number
  text: string
}

export async function searchWords(versionId: string, query: string, limit = 40): Promise<ScriptureHit[]> {
  const terms = query
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 1)
  if (!terms.length) return []
  const hits: ScriptureHit[] = []
  for (let bookIndex = 0; bookIndex < BOOKS.length; bookIndex += 1) {
    if (!bookIsBundled(BOOKS[bookIndex].id)) continue
    const chapters = await loadBook(versionId, bookIndex)
    if (!chapters) continue
    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
      const verses = chapters[chapterIndex]
      for (let verseIndex = 0; verseIndex < verses.length; verseIndex += 1) {
        const text = verses[verseIndex]
        const folded = text
          .normalize('NFD')
          .replace(/\p{M}/gu, '')
          .toLowerCase()
        if (!terms.every((term) => folded.includes(term))) continue
        hits.push({ bookIndex, chapter: chapterIndex + 1, verse: verseIndex + 1, text })
        if (hits.length >= limit) return hits
      }
    }
  }
  return hits
}
