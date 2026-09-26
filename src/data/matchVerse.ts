import type { Passage } from './types'
import type { Verse } from './types'

export function verseForPassage(verses: readonly Verse[], passage: Passage): Verse | undefined {
  return verses.find(
    (verse) =>
      verse.passage?.bookIndex === passage.bookIndex &&
      verse.passage.chapter === passage.chapter &&
      verse.passage.verse === passage.verse,
  )
}
