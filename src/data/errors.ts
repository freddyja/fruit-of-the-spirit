const libraryErrorText = {
  emptyRecording: 'That recording was empty.',
  referenceRequired: 'Add a reference.',
  textRequired: 'Add the verse text.',
  verseGone: 'That verse is no longer on this device.',
  categoryNameRequired: 'Give the category a name.',
  categoryExists: 'That category already exists.',
  categoryMissing: 'That category is no longer on this device.',
} as const

export type LibraryErrorCode = keyof typeof libraryErrorText

export class LibraryError extends Error {
  readonly code: LibraryErrorCode

  constructor(code: LibraryErrorCode) {
    super(libraryErrorText[code])
    this.name = 'LibraryError'
    this.code = code
  }
}
