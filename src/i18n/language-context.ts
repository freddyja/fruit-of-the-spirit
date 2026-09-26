import { createContext } from 'react'
import type { BibleVersion } from '../scripture/versions'
import type { Language, MessageKey } from './messages'

export type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  versionId: string
  versionName: string
  versions: readonly BibleVersion[]
  setVersion: (versionId: string) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
