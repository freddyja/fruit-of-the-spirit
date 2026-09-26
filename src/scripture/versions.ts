import type { Language } from '../i18n/messages'

export type BibleVersion = {
  id: string
  language: Language
  folder: string
  name: string
  abbr: string
  license: string
}

/** Free texts only. Commercial translations are not part of this list. */
export const VERSIONS: readonly BibleVersion[] = [
  {
    id: 'kjv',
    language: 'en',
    folder: 'kjv',
    name: 'King James Version (1769)',
    abbr: 'KJV',
    license: 'Public domain',
  },
  {
    id: 'rv1909',
    language: 'es',
    folder: 'rv1909',
    name: 'Reina-Valera 1909',
    abbr: 'RV1909',
    license: 'Public domain',
  },
  {
    id: 'blivre',
    language: 'pt',
    folder: 'blivre',
    name: 'Bíblia Livre',
    abbr: 'BL',
    license: 'CC BY 3.0 Brazil',
  },
]

const byId = new Map(VERSIONS.map((version) => [version.id, version]))

export function versionById(id: string): BibleVersion | undefined {
  return byId.get(id)
}

export function versionsFor(language: Language): readonly BibleVersion[] {
  return VERSIONS.filter((version) => version.language === language)
}

export function defaultVersionId(language: Language): string {
  return versionsFor(language)[0].id
}
