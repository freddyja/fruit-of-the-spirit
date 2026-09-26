import { useEffect, useId, useRef, useState } from 'react'
import { DISPLAY_NAME_LIMIT, useDisplayName } from '../hooks/useDisplayName'
import { useLanguage } from '../i18n/useLanguage'

export function GreetingNamePrompt() {
  const { t } = useLanguage()
  const { save } = useDisplayName()
  const [draft, setDraft] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const labelId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    inputRef.current?.focus()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  function finish(value: string) {
    save(value)
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={labelId}
      onCancel={(event) => {
        event.preventDefault()
        finish('')
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          finish(draft)
        }}
      >
        <h2 id={labelId} className="dialog-title">
          {t('greetingAsk')}
        </h2>
        <p className="dialog-message">{t('greetingAskHelp')}</p>
        <label className="field">
          <span className="label">{t('greetingName')}</span>
          <input
            ref={inputRef}
            value={draft}
            maxLength={DISPLAY_NAME_LIMIT}
            autoComplete="nickname"
            placeholder={t('greetingNamePlaceholder')}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <div className="dialog-actions">
          <button type="button" className="button button-ghost" onClick={() => finish('')}>
            {t('greetingSkip')}
          </button>
          <button type="submit" className="button">
            {t('save')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
