/**
 * Local library model.
 *
 * Ids are stable and every record carries createdAt/updatedAt so a later
 * sync or account layer can mirror these objects without a new shape.
 * schemaVersion on the meta record is the migration hook.
 * Voice audio is a separate IndexedDB record keyed by verse id, not part of
 * the verse object, so the verse stays a plain record.
 */
export const SCHEMA_VERSION = 2

export type Category = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

/** A verse in the bundled Scripture, when the reference is one we can open. */
export type Passage = {
  bookIndex: number
  chapter: number
  verse: number
}

export type Verse = {
  id: string
  /** Book, chapter, and verse — or any freeform reference. */
  reference: string
  text: string
  /** Personal note. Empty string when the verse has none. */
  note: string
  categoryIds: string[]
  /** Set when this saved verse points at the bundled text. */
  passage?: Passage
  createdAt: number
  updatedAt: number
}

export type VerseDraft = {
  reference: string
  text: string
  note: string
  categoryIds: string[]
  passage?: Passage
}

export type LibraryMeta = {
  id: 'app'
  schemaVersion: number
  seeded: boolean
}

/** Audio kept on this device for one verse. */
export type VoiceNoteRecord = {
  verseId: string
  blob: Blob
  mimeType: string
  updatedAt: number
}

/** What to do with the voice note when a verse is saved. */
export type VoiceNoteUpdate = { kind: 'keep' } | { kind: 'replace'; blob: Blob } | { kind: 'remove' }

export type LibrarySnapshot = {
  verses: Verse[]
  categories: Category[]
  voiceNoteIds: string[]
}
