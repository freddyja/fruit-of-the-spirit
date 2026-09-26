import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import { LibraryError } from './errors'
import { categoryNamesMatch, normalizeCategoryName } from './names'
import { SEED_CATEGORIES, SEED_VERSES } from './seed'
import type { Category, LibraryMeta, LibrarySnapshot, Verse, VerseDraft, VoiceNoteRecord } from './types'
import { SCHEMA_VERSION } from './types'

const DB_NAME = 'fruit-of-the-spirit'
const DB_VERSION = 2

interface VerseTrackerDB extends DBSchema {
  verses: {
    key: string
    value: Verse
    indexes: { 'by-updated': number }
  }
  categories: {
    key: string
    value: Category
    indexes: { 'by-name': string }
  }
  meta: {
    key: string
    value: LibraryMeta
  }
  voiceNotes: {
    key: string
    value: VoiceNoteRecord
  }
}

let databasePromise: Promise<IDBPDatabase<VerseTrackerDB>> | null = null

function getDatabase(): Promise<IDBPDatabase<VerseTrackerDB>> {
  if (!databasePromise) {
    databasePromise = openDB<VerseTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          const verses = database.createObjectStore('verses', { keyPath: 'id' })
          verses.createIndex('by-updated', 'updatedAt')
          const categories = database.createObjectStore('categories', { keyPath: 'id' })
          categories.createIndex('by-name', 'name')
          database.createObjectStore('meta', { keyPath: 'id' })
        }
        if (oldVersion < 2 && !database.objectStoreNames.contains('voiceNotes')) {
          database.createObjectStore('voiceNotes', { keyPath: 'verseId' })
        }
      },
    }).catch((error: unknown) => {
      databasePromise = null
      throw error
    })
  }
  return databasePromise
}

async function ensureSeeded(database: IDBPDatabase<VerseTrackerDB>): Promise<void> {
  const transaction = database.transaction(['meta', 'verses', 'categories'], 'readwrite')
  const metaStore = transaction.objectStore('meta')
  const verseStore = transaction.objectStore('verses')
  const categoryStore = transaction.objectStore('categories')
  const meta = await metaStore.get('app')

  if (!meta?.seeded) {
    const verseCount = await verseStore.count()
    const categoryCount = await categoryStore.count()
    if (verseCount === 0 && categoryCount === 0) {
      for (const category of SEED_CATEGORIES) await categoryStore.put(category)
      for (const verse of SEED_VERSES) await verseStore.put(verse)
    }
    await metaStore.put({
      id: 'app',
      schemaVersion: SCHEMA_VERSION,
      seeded: true,
    })
  } else if (meta.schemaVersion !== SCHEMA_VERSION) {
    await metaStore.put({ ...meta, schemaVersion: SCHEMA_VERSION })
  }

  await transaction.done
}

function sortSnapshot(snapshot: LibrarySnapshot): LibrarySnapshot {
  return {
    verses: snapshot.verses.toSorted(
      (left, right) => right.createdAt - left.createdAt || left.reference.localeCompare(right.reference),
    ),
    categories: snapshot.categories.toSorted((left, right) => left.name.localeCompare(right.name)),
    voiceNoteIds: snapshot.voiceNoteIds,
  }
}

export async function loadLibrary(): Promise<LibrarySnapshot> {
  const database = await getDatabase()
  await ensureSeeded(database)
  const [verses, categories, voiceNoteKeys] = await Promise.all([
    database.getAll('verses'),
    database.getAll('categories'),
    database.getAllKeys('voiceNotes'),
  ])
  return sortSnapshot({
    verses,
    categories,
    voiceNoteIds: voiceNoteKeys.map((key) => String(key)),
  })
}

export async function getVoiceNote(verseId: string): Promise<VoiceNoteRecord | undefined> {
  const database = await getDatabase()
  return database.get('voiceNotes', verseId)
}

export async function putVoiceNote(verseId: string, blob: Blob): Promise<void> {
  if (blob.size === 0) throw new LibraryError('emptyRecording')
  const database = await getDatabase()
  await database.put('voiceNotes', {
    verseId,
    blob,
    mimeType: blob.type || 'audio/webm',
    updatedAt: Date.now(),
  })
}

export async function deleteVoiceNote(verseId: string): Promise<void> {
  const database = await getDatabase()
  await database.delete('voiceNotes', verseId)
}

export async function saveVerse(draft: VerseDraft, id?: string): Promise<Verse> {
  const reference = draft.reference.trim()
  const text = draft.text.trim()
  const note = draft.note.trim()
  if (!reference) throw new LibraryError('referenceRequired')
  if (!text) throw new LibraryError('textRequired')

  const database = await getDatabase()
  const existing = id ? await database.get('verses', id) : undefined
  if (id && !existing) throw new LibraryError('verseGone')

  const categories = await database.getAll('categories')
  const validIds = new Set(categories.map((category) => category.id))
  const now = Date.now()
  const verse: Verse = {
    id: existing?.id ?? crypto.randomUUID(),
    reference,
    text,
    note,
    categoryIds: [...new Set(draft.categoryIds.filter((categoryId) => validIds.has(categoryId)))],
    ...(draft.passage ? { passage: draft.passage } : {}),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await database.put('verses', verse)
  return verse
}

export async function deleteVerse(id: string): Promise<void> {
  const database = await getDatabase()
  const transaction = database.transaction(['verses', 'voiceNotes'], 'readwrite')
  await transaction.objectStore('verses').delete(id)
  await transaction.objectStore('voiceNotes').delete(id)
  await transaction.done
}

export async function createCategory(name: string): Promise<Category> {
  const normalized = normalizeCategoryName(name)
  if (!normalized) throw new LibraryError('categoryNameRequired')

  const database = await getDatabase()
  const existing = await database.getAll('categories')
  if (existing.some((category) => categoryNamesMatch(category.name, normalized))) {
    throw new LibraryError('categoryExists')
  }

  const now = Date.now()
  const category: Category = {
    id: crypto.randomUUID(),
    name: normalized,
    createdAt: now,
    updatedAt: now,
  }
  await database.put('categories', category)
  return category
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const normalized = normalizeCategoryName(name)
  if (!normalized) throw new LibraryError('categoryNameRequired')

  const database = await getDatabase()
  const categories = await database.getAll('categories')
  const current = categories.find((category) => category.id === id)
  if (!current) throw new LibraryError('categoryMissing')
  if (
    categories.some(
      (category) => category.id !== id && categoryNamesMatch(category.name, normalized),
    )
  ) {
    throw new LibraryError('categoryExists')
  }

  await database.put('categories', {
    ...current,
    name: normalized,
    updatedAt: Date.now(),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  const database = await getDatabase()
  const transaction = database.transaction(['categories', 'verses'], 'readwrite')
  const verseStore = transaction.objectStore('verses')
  await transaction.objectStore('categories').delete(id)
  const verses = await verseStore.getAll()
  const now = Date.now()

  for (const verse of verses) {
    if (!verse.categoryIds.includes(id)) continue
    await verseStore.put({
      ...verse,
      categoryIds: verse.categoryIds.filter((categoryId) => categoryId !== id),
      updatedAt: now,
    })
  }

  await transaction.done
}
