import { useState } from 'react'
import { DISPLAY_NAME_LIMIT, useDisplayName } from '../hooks/useDisplayName'
import { useLanguage } from '../i18n/useLanguage'
import { InstallSettings } from './InstallOffer'
import { LanguagePicker } from './LanguagePicker'

export function SettingsPanel({ onPlan }: { onPlan: () => void }) {
  const { t, versionName } = useLanguage()
  const displayName = useDisplayName()
  const [draft, setDraft] = useState(displayName.name)

  return (
    <div className="settings">
      <section className="panel-block">
        <h2>{t('versionLabel')}</h2>
        <p className="version-line">{versionName}</p>
        <p className="setting-help">{t('languageHelp')}</p>
      </section>
      <LanguagePicker hint />
      <section className="panel-block">
        <h2>{t('greetingName')}</h2>
        <p className="setting-help">{t('greetingNameHelp')}</p>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault()
            displayName.save(draft)
          }}
        >
          <input
            value={draft}
            maxLength={DISPLAY_NAME_LIMIT}
            placeholder={t('greetingNamePlaceholder')}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="button button-small">
            {t('save')}
          </button>
          <button
            type="button"
            className="button button-ghost button-small"
            onClick={() => {
              setDraft('')
              displayName.save('')
            }}
          >
            {t('clearName')}
          </button>
        </form>
      </section>
      <section className="panel-block">
        <h2>{t('planTitle')}</h2>
        <button type="button" className="button button-ghost" onClick={onPlan}>
          {t('planTitle')}
        </button>
      </section>
      <InstallSettings />
      <p className="source-line">{t('privacy')}</p>
    </div>
  )
}
