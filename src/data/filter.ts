import type { Verse } from './types'

/** Keeps the incoming order. Tokens must all appear in the reference, text, or note. */
export function filterVerses(
  verses: readonly Verse[],
  query: string,
  categoryId: string | null,
): Verse[] {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const visible: Verse[] = []

  for (const verse of verses) {
    if (categoryId !== null && !verse.categoryIds.includes(categoryId)) continue
    if (tokens.length === 0) {
      visible.push(verse)
      continue
    }

    const haystack = `${verse.reference}\n${verse.text}\n${verse.note}`.toLocaleLowerCase()
    let matches = true
    for (const token of tokens) {
      if (!haystack.includes(token)) {
        matches = false
        break
      }
    }
    if (matches) visible.push(verse)
  }

  return visible
}
