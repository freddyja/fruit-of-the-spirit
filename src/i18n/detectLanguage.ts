import type { Language } from './messages'

export function languageFromTags(tags: readonly string[]): Language {
  for (const tag of tags) {
    const base = tag.toLowerCase().split('-')[0]
    if (base === 'en' || base === 'es' || base === 'pt') return base
  }
  return 'en'
}

export function readInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem('fruit-of-the-spirit.language')
    if (stored === 'en' || stored === 'es' || stored === 'pt') return stored
  } catch {
    // A blocked store still follows the phone for this visit.
  }
  const tags =
    typeof navigator === 'undefined'
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
  return languageFromTags(tags)
}
