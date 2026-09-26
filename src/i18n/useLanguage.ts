import { useContext } from 'react'
import { LanguageContext, type LanguageContextValue } from './language-context'

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('LanguageProvider is missing')
  return value
}
