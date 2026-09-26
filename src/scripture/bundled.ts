/** Books shipped in this scaffold. Add an id here after its JSON files exist. */
export const BUNDLED_BOOK_IDS = [
  'mat',
  'jhn',
  'rom',
  '1co',
  'gal',
  'eph',
  'php',
  'col',
  'tit',
  'jas',
  '1pe',
  '2pe',
  '1jn',
] as const

const bundled = new Set<string>(BUNDLED_BOOK_IDS)

export function bookIsBundled(bookId: string): boolean {
  return bundled.has(bookId)
}
