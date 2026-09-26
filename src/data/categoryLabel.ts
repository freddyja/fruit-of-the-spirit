import { messages, type MessageKey } from '../i18n/messages'
import { categoryNamesMatch, normalizeCategoryName } from './names'
import { SEED_CATEGORIES } from './seed'
import type { Category } from './types'

const STARTER_LABEL: Record<string, MessageKey> = {
  'cat-love': 'fruitLove',
  'cat-joy': 'fruitJoy',
  'cat-peace': 'fruitPeace',
  'cat-patience': 'fruitPatience',
  'cat-kindness': 'fruitKindness',
  'cat-goodness': 'fruitGoodness',
  'cat-faithfulness': 'fruitFaithfulness',
  'cat-gentleness': 'fruitGentleness',
  'cat-self-control': 'fruitSelfControl',
}

const languages = ['en', 'es', 'pt'] as const

function canonicalName(id: string): string | undefined {
  return SEED_CATEGORIES.find((category) => category.id === id)?.name
}

function untouchedStarter(category: Pick<Category, 'id' | 'name'>): MessageKey | null {
  const key = STARTER_LABEL[category.id]
  const canonical = canonicalName(category.id)
  if (!key || !canonical || !categoryNamesMatch(category.name, canonical)) return null
  return key
}

/** Starter fruit categories follow the language. A renamed one stays as stored. */
export function categoryDisplayName(
  category: Pick<Category, 'id' | 'name'>,
  t: (key: MessageKey) => string,
): string {
  const key = untouchedStarter(category)
  return key ? t(key) : category.name
}

function matchesStarterLabel(category: Pick<Category, 'id' | 'name'>, typed: string): boolean {
  const key = untouchedStarter(category)
  if (!key) return false
  return languages.some((language) => categoryNamesMatch(messages[language][key], typed))
}

export function findCategoryByTypedName(
  categories: readonly Category[],
  typed: string,
): Category | undefined {
  const exact = categories.find((category) => categoryNamesMatch(category.name, typed))
  if (exact) return exact
  return categories.find((category) => matchesStarterLabel(category, typed))
}

export function storedNameForRename(category: Pick<Category, 'id' | 'name'>, typed: string): string {
  const normalized = normalizeCategoryName(typed)
  const key = STARTER_LABEL[category.id]
  const canonical = canonicalName(category.id)
  if (!key || !canonical) return normalized
  const official = languages.some((language) => categoryNamesMatch(messages[language][key], normalized))
  return official ? canonical : normalized
}
