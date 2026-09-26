import type { MessageKey } from '../i18n/messages'
import { BOOKS } from './books'
import type { PassageRef } from './passages'

export type FruitId =
  | 'love'
  | 'joy'
  | 'peace'
  | 'patience'
  | 'kindness'
  | 'goodness'
  | 'faithfulness'
  | 'gentleness'
  | 'self-control'

export type FruitRef = {
  bookId: string
  chapter: number
  verse: number
}

export type Fruit = {
  id: FruitId
  label: MessageKey
  practice: MessageKey
  categoryId: string
  refs: readonly FruitRef[]
}

export const FRUITS: readonly Fruit[] = [
  {
    id: 'love',
    label: 'fruitLove',
    practice: 'practiceLove',
    categoryId: 'cat-love',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: '1co', chapter: 13, verse: 4 },
      { bookId: 'jhn', chapter: 15, verse: 12 },
      { bookId: '1jn', chapter: 4, verse: 19 },
    ],
  },
  {
    id: 'joy',
    label: 'fruitJoy',
    practice: 'practiceJoy',
    categoryId: 'cat-joy',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: 'php', chapter: 4, verse: 4 },
      { bookId: 'jhn', chapter: 15, verse: 11 },
      { bookId: 'rom', chapter: 15, verse: 13 },
    ],
  },
  {
    id: 'peace',
    label: 'fruitPeace',
    practice: 'practicePeace',
    categoryId: 'cat-peace',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: 'jhn', chapter: 14, verse: 27 },
      { bookId: 'php', chapter: 4, verse: 7 },
      { bookId: 'col', chapter: 3, verse: 15 },
    ],
  },
  {
    id: 'patience',
    label: 'fruitPatience',
    practice: 'practicePatience',
    categoryId: 'cat-patience',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: 'jas', chapter: 1, verse: 4 },
      { bookId: 'col', chapter: 3, verse: 12 },
      { bookId: 'eph', chapter: 4, verse: 2 },
    ],
  },
  {
    id: 'kindness',
    label: 'fruitKindness',
    practice: 'practiceKindness',
    categoryId: 'cat-kindness',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: 'eph', chapter: 4, verse: 32 },
      { bookId: 'col', chapter: 3, verse: 12 },
    ],
  },
  {
    id: 'goodness',
    label: 'fruitGoodness',
    practice: 'practiceGoodness',
    categoryId: 'cat-goodness',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: 'gal', chapter: 6, verse: 10 },
      { bookId: 'eph', chapter: 5, verse: 9 },
    ],
  },
  {
    id: 'faithfulness',
    label: 'fruitFaithfulness',
    practice: 'practiceFaithfulness',
    categoryId: 'cat-faithfulness',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: '1co', chapter: 4, verse: 2 },
      { bookId: 'gal', chapter: 2, verse: 20 },
    ],
  },
  {
    id: 'gentleness',
    label: 'fruitGentleness',
    practice: 'practiceGentleness',
    categoryId: 'cat-gentleness',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 23 },
      { bookId: 'gal', chapter: 6, verse: 1 },
      { bookId: 'eph', chapter: 4, verse: 2 },
      { bookId: 'col', chapter: 3, verse: 12 },
    ],
  },
  {
    id: 'self-control',
    label: 'fruitSelfControl',
    practice: 'practiceSelfControl',
    categoryId: 'cat-self-control',
    refs: [
      { bookId: 'gal', chapter: 5, verse: 23 },
      { bookId: '2pe', chapter: 1, verse: 6 },
      { bookId: '1co', chapter: 9, verse: 25 },
      { bookId: 'tit', chapter: 2, verse: 12 },
    ],
  },
]

const extraTopics: { id: string; names: string[]; refs: readonly FruitRef[] }[] = [
  {
    id: 'spirit',
    names: ['spirit', 'espiritu', 'espírito'],
    refs: [
      { bookId: 'gal', chapter: 5, verse: 16 },
      { bookId: 'gal', chapter: 5, verse: 22 },
      { bookId: 'gal', chapter: 5, verse: 25 },
    ],
  },
  {
    id: 'freedom',
    names: ['freedom', 'liberty', 'libertad', 'liberdade'],
    refs: [
      { bookId: 'gal', chapter: 5, verse: 1 },
      { bookId: 'gal', chapter: 5, verse: 13 },
    ],
  },
]

export function fruitById(id: string): Fruit | undefined {
  return FRUITS.find((fruit) => fruit.id === id)
}

export function toPassage(ref: FruitRef): PassageRef | null {
  const bookIndex = BOOKS.findIndex((book) => book.id === ref.bookId)
  if (bookIndex < 0) return null
  return { bookIndex, chapter: ref.chapter, verse: ref.verse }
}

function sameRef(ref: FruitRef, passage: PassageRef): boolean {
  const bookIndex = BOOKS.findIndex((book) => book.id === ref.bookId)
  return bookIndex === passage.bookIndex && ref.chapter === passage.chapter && ref.verse === passage.verse
}

export function crossReferences(passage: PassageRef): PassageRef[] {
  const seen = new Set<string>()
  const hits: PassageRef[] = []
  const add = (ref: FruitRef) => {
    const next = toPassage(ref)
    if (!next) return
    if (next.bookIndex === passage.bookIndex && next.chapter === passage.chapter && next.verse === passage.verse) return
    const key = `${next.bookIndex}:${next.chapter}:${next.verse}`
    if (seen.has(key)) return
    seen.add(key)
    hits.push(next)
  }

  if (BOOKS[passage.bookIndex]?.id === 'gal' && passage.chapter === 5 && (passage.verse === 22 || passage.verse === 23)) {
    for (const fruit of FRUITS) add(fruit.refs[1] ?? fruit.refs[0])
    return hits
  }

  for (const fruit of FRUITS) {
    if (!fruit.refs.some((ref) => sameRef(ref, passage))) continue
    for (const ref of fruit.refs) add(ref)
  }
  for (const topic of extraTopics) {
    if (!topic.refs.some((ref) => sameRef(ref, passage))) continue
    for (const ref of topic.refs) add(ref)
  }
  return hits
}

export type TopicHit = {
  id: string
  labelKey: MessageKey | null
  label: string
  passages: PassageRef[]
}

export function topicsForQuery(query: string, label: (fruit: Fruit) => string): TopicHit[] {
  const folded = query
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
  if (!folded) return []
  const hits: TopicHit[] = []
  for (const fruit of FRUITS) {
    const name = label(fruit)
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
    if (!name.includes(folded) && !fruit.id.includes(folded) && !folded.includes(name)) continue
    hits.push({
      id: fruit.id,
      labelKey: fruit.label,
      label: label(fruit),
      passages: fruit.refs.flatMap((ref) => {
        const passage = toPassage(ref)
        return passage ? [passage] : []
      }),
    })
  }
  for (const topic of extraTopics) {
    if (!topic.names.some((name) => name.includes(folded) || folded.includes(name))) continue
    hits.push({
      id: topic.id,
      labelKey: null,
      label: topic.id,
      passages: topic.refs.flatMap((ref) => {
        const passage = toPassage(ref)
        return passage ? [passage] : []
      }),
    })
  }
  return hits
}
