import { useId } from 'react'
import type { Language, MessageKey } from '../i18n/messages'
import { useLanguage } from '../i18n/useLanguage'

const options: { code: Language; label: MessageKey }[] = [
  { code: 'en', label: 'langEn' },
  { code: 'es', label: 'langEs' },
  { code: 'pt', label: 'langPt' },
]

export function LanguagePicker({ hint = false }: { hint?: boolean }) {
  const { language, setLanguage, t } = useLanguage()
  const labelId = useId()

  return (
    <div className="lang" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="setting-label">
        {t('language')}
      </span>
      <div className="lang-options">
        {options.map((option) => (
          <button
            key={option.code}
            type="button"
            className="lang-option"
            lang={option.code}
            aria-pressed={language === option.code}
            onClick={() => setLanguage(option.code)}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
      {hint ? <p className="setting-help">{t('languageHelp')}</p> : null}
    </div>
  )
}
