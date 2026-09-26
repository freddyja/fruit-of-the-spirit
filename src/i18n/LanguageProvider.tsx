import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { defaultVersionId, versionById, versionsFor } from '../scripture/versions'
import { readInitialLanguage } from './detectLanguage'
import type { Language } from './messages'
import { translate } from './messages'
import { LanguageContext, type LanguageContextValue } from './language-context'

const STORAGE_KEY = 'fruit-of-the-spirit.language'

function versionKey(language: Language): string {
  return `fruit-of-the-spirit.version.${language}`
}

function readStoredVersion(language: Language): string {
  try {
    const stored = localStorage.getItem(versionKey(language))
    if (stored && versionById(stored)?.language === language) return stored
  } catch {
    // The default version for this language still applies.
  }
  return defaultVersionId(language)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(readInitialLanguage)
  const [chosen, setChosen] = useState<Record<Language, string>>(() => ({
    en: readStoredVersion('en'),
    es: readStoredVersion('es'),
    pt: readStoredVersion('pt'),
  }))

  const versionId = chosen[language]
  const versionName = versionById(versionId)?.name ?? versionsFor(language)[0].name

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
      localStorage.setItem(versionKey(language), versionId)
    } catch {
      // The choice still applies until the page closes.
    }
  }, [language, versionId])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      versionId,
      versionName,
      versions: versionsFor(language),
      setVersion: (next) => {
        const version = versionById(next)
        if (!version) return
        setChosen((current) =>
          current[version.language] === next ? current : { ...current, [version.language]: next },
        )
        setLanguage((current) => (current === version.language ? current : version.language))
      },
      t: (key, vars) => translate(language, key, vars),
    }),
    [language, versionId, versionName],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
