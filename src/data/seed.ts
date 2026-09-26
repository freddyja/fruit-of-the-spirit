import { BOOKS } from '../scripture/books'
import type { Category, Verse } from './types'

const seededAt = Date.UTC(2026, 0, 1)
const galatians = BOOKS.findIndex((book) => book.id === 'gal')

const fruitNames = [
  ['cat-love', 'Love'],
  ['cat-joy', 'Joy'],
  ['cat-peace', 'Peace'],
  ['cat-patience', 'Patience'],
  ['cat-kindness', 'Kindness'],
  ['cat-goodness', 'Goodness'],
  ['cat-faithfulness', 'Faithfulness'],
  ['cat-gentleness', 'Gentleness'],
  ['cat-self-control', 'Self-control'],
] as const

export const SEED_CATEGORIES: Category[] = fruitNames.map(([id, name], index) => ({
  id,
  name,
  createdAt: seededAt + index,
  updatedAt: seededAt + index,
}))

/**
 * Public-domain KJV wording, with a sample note that can be edited or deleted.
 * Fixed ids so a refresh during first launch cannot duplicate them.
 */
export const SEED_VERSES: Verse[] = [
  {
    id: 'verse-galatians-5-22',
    reference: 'Galatians 5:22',
    text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,',
    note: 'One fruit. I want to practice it, not score it.',
    categoryIds: fruitNames.map(([id]) => id),
    passage: { bookIndex: galatians, chapter: 5, verse: 22 },
    createdAt: seededAt + 20,
    updatedAt: seededAt + 20,
  },
]
