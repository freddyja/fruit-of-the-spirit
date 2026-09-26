import { useState } from 'react'
import type { Category, Verse } from '../data/types'
import { categoryDisplayName } from '../data/categoryLabel'
import { verseForPassage } from '../data/matchVerse'
import { useLanguage } from '../i18n/useLanguage'
import { BOOKS } from '../scripture/books'
import { crossReferences } from '../scripture/fruits'
import { formatPassage, type PassageRef } from '../scripture/passages'
import { studyFor } from '../scripture/study'

type Layer = 'meaning' | 'lexicon' | 'context' | 'related'

export function VerseStudy({
  passage,
  text,
  verses,
  categories,
  onOpenPassage,
  onSave,
  onClose,
}: {
  passage: PassageRef
  text: string
  verses: readonly Verse[]
  categories: readonly Category[]
  onOpenPassage: (passage: PassageRef) => void
  onSave: () => void
  onClose: () => void
}) {
  const { language, t } = useLanguage()
  const [layer, setLayer] = useState<Layer>('meaning')
  const study = studyFor(passage)
  const related = crossReferences(passage)
  const saved = verseForPassage(verses, passage)
  const library = saved
    ? verses.filter(
        (verse) =>
          verse.id !== saved.id && verse.categoryIds.some((id) => saved.categoryIds.includes(id)),
      )
    : []
  const reference = formatPassage(language, passage)
  const layers: { id: Layer; label: string }[] = [
    { id: 'meaning', label: t('meaning') },
    { id: 'lexicon', label: t('lexicon') },
    { id: 'context', label: t('contextLayer') },
    { id: 'related', label: t('relatedVerses') },
  ]

  return (
    <div className="study">
      <div className="study-head">
        <div>
          <p className="kicker">{BOOKS[passage.bookIndex]?.names[language]}</p>
          <h2 className="study-ref">{reference}</h2>
        </div>
        <button type="button" className="button button-ghost button-small" onClick={onClose}>
          {t('close')}
        </button>
      </div>
      <p className="study-verse">{text}</p>
      <div className="layer-switch" role="tablist">
        {layers.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={layer === item.id}
            className="layer-btn"
            onClick={() => setLayer(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {language !== 'en' ? <p className="setting-help">{t('studyEnglish')}</p> : null}

      {layer === 'meaning' ? (
        <div className="study-body">
          <p>{study.meaning ?? t('meaningEmpty')}</p>
          <p className="source-line">{t('studySource')}</p>
        </div>
      ) : null}

      {layer === 'lexicon' ? (
        <div className="study-body">
          {study.lexicon.length === 0 ? <p>{t('lexiconEmpty')}</p> : null}
          <ul className="lexicon-list">
            {study.lexicon.map((word) => (
              <li key={word.strong}>
                <span className="lemma">{word.lemma}</span>
                <span className="gloss">
                  {word.transliteration} · {word.gloss}
                </span>
                <span className="strong">{word.strong}</span>
              </li>
            ))}
          </ul>
          <p className="source-line">{t('lexiconSource')}</p>
        </div>
      ) : null}

      {layer === 'context' ? (
        <div className="study-body">
          <h3>{t('contextLayer')}</h3>
          <p>{study.context ?? t('contextEmpty')}</p>
          <h3>{t('studyThen')}</h3>
          <p>{study.thenNote ?? t('contextEmpty')}</p>
          <h3>{t('studyToday')}</h3>
          <p>{study.today ?? t('contextEmpty')}</p>
          <p className="source-line">{t('contextSource')}</p>
        </div>
      ) : null}

      {layer === 'related' ? (
        <div className="study-body">
          <h3>{t('crossReferences')}</h3>
          {related.length === 0 ? <p>{t('relatedEmpty')}</p> : null}
          <ul className="link-list">
            {related.map((item) => (
              <li key={`${item.bookIndex}:${item.chapter}:${item.verse}`}>
                <button type="button" onClick={() => onOpenPassage(item)}>
                  {formatPassage(language, item)}
                </button>
              </li>
            ))}
          </ul>
          <h3>{t('fromLibrary')}</h3>
          {library.length === 0 ? <p>{t('relatedEmpty')}</p> : null}
          <ul className="link-list">
            {library.map((verse) => (
              <li key={verse.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!verse.passage) return
                    onOpenPassage(verse.passage)
                  }}
                  disabled={!verse.passage}
                >
                  {verse.reference}
                  <span className="link-note">
                    {verse.categoryIds
                      .map((id) => categories.find((category) => category.id === id))
                      .filter((category) => category !== undefined)
                      .map((category) => categoryDisplayName(category, t))
                      .join(', ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="study-save">
        {saved?.note ? (
          <p className="your-note">
            <span className="label">{t('yourNote')}</span>
            {saved.note}
          </p>
        ) : null}
        <button type="button" className="button button-block" onClick={onSave}>
          {saved ? t('editNote') : t('saveThisVerse')}
        </button>
        {saved ? <p className="shelf-note">{t('shelfSaved')}</p> : null}
      </div>
    </div>
  )
}
