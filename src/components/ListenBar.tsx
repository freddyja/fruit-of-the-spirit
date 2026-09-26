import type { PassageRef } from '../scripture/passages'
import { useLanguage } from '../i18n/useLanguage'
import type { ListenController } from '../speech/useListen'

type Listen = ListenController

export function ListenBar({
  listen,
  verse,
  chapter,
}: {
  listen: Listen
  verse: () => void
  chapter: () => void
}) {
  const { t } = useLanguage()
  if (!listen.supported) {
    return <p className="listen-note">{t('listenUnsupported')}</p>
  }
  const playing = listen.status === 'playing' || listen.status === 'paused'
  return (
    <div className="listen-bar">
      <button type="button" className="button button-small" onClick={verse}>
        {t('listenVerse')}
      </button>
      <button type="button" className="button button-small button-ghost" onClick={chapter}>
        {t('listenChapter')}
      </button>
      {playing ? (
        <>
          <button
            type="button"
            className="button button-small button-ghost"
            onClick={listen.status === 'paused' ? listen.resume : listen.pause}
          >
            {listen.status === 'paused' ? t('listenResume') : t('listenPause')}
          </button>
          <button type="button" className="button button-small" onClick={listen.stop}>
            {t('listenStop')}
          </button>
        </>
      ) : null}
    </div>
  )
}

export function isSpeaking(listen: Listen, passage: PassageRef): boolean {
  const current = listen.passage
  return (
    listen.status !== 'idle' &&
    current?.bookIndex === passage.bookIndex &&
    current.chapter === passage.chapter &&
    current.verse === passage.verse
  )
}
