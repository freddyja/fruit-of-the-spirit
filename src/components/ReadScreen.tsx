import { useEffect, useState } from 'react'
import type { Verse } from '../data/types'
import { useLanguage } from '../i18n/useLanguage'
import { searchWords, type ScriptureHit } from '../scripture/api'
import { bookIsBundled } from '../scripture/bundled'
import { BOOKS, NEW_TESTAMENT_INDEX } from '../scripture/books'
import { fruitById, topicsForQuery, type FruitId } from '../scripture/fruits'
import { formatPassage, parseReference, type PassageRef } from '../scripture/passages'
import { BookArt } from './BookArt'

type ReadScreenProps = {
  versionId: string
  mode: 'word' | 'topics'
  query: string
  fruitId: FruitId | null
  saved: readonly Verse[]
  onMode: (mode: 'word' | 'topics') => void
  onQuery: (query: string) => void
  onClearFruit: () => void
  onOpenBook: (bookIndex: number) => void
  onOpenPassage: (passage: PassageRef) => void
}

export function ReadScreen({
  versionId,
  mode,
  query,
  fruitId,
  saved,
  onMode,
  onQuery,
  onClearFruit,
  onOpenBook,
  onOpenPassage,
}: ReadScreenProps) {
  const { language, t } = useLanguage()
  const [hits, setHits] = useState<ScriptureHit[]>([])
  const [busy, setBusy] = useState(false)
  const fruit = fruitId ? fruitById(fruitId) : undefined
  const parsed = mode === 'word' ? parseReference(query) : null
  const topics = mode === 'topics' ? topicsForQuery(query || (fruit ? t(fruit.label) : ''), (item) => t(item.label)) : []
  const fruitPassages = fruit && mode === 'topics' && !query.trim()
    ? topicsForQuery(t(fruit.label), (item) => t(item.label)).filter((topic) => topic.id === fruit.id)
    : topics

  useEffect(() => {
    if (mode !== 'word' || query.trim().length < 2) {
      setHits([])
      setBusy(false)
      return
    }
    let cancelled = false
    setBusy(true)
    searchWords(versionId, query)
      .then((next) => {
        if (!cancelled) setHits(next)
      })
      .catch(() => {
        if (!cancelled) setHits([])
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, query, versionId])

  const savedHits = query.trim()
    ? saved.filter((verse) => `${verse.reference} ${verse.text} ${verse.note}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    : []
  const showBooks = mode === 'word' ? query.trim().length < 2 : !fruit && query.trim().length < 2

  return (
    <div className="read-home">
      <div className="mode-switch" role="group" aria-label={t('searchLabel')}>
        <button type="button" aria-pressed={mode === 'word'} onClick={() => onMode('word')}>
          {t('searchWord')}
        </button>
        <button type="button" aria-pressed={mode === 'topics'} onClick={() => onMode('topics')}>
          {t('searchTopics')}
        </button>
      </div>
      <label className="field">
        <span className="sr-only">{t('searchLabel')}</span>
        <input
          value={query}
          placeholder={mode === 'word' ? t('searchWordPlaceholder') : t('searchTopicsPlaceholder')}
          onChange={(event) => {
            onQuery(event.target.value)
            if (fruitId) onClearFruit()
          }}
        />
      </label>
      <p className="setting-help">{mode === 'word' ? t('wordHint') : t('topicsHint')}</p>
      {fruit && mode === 'topics' ? (
        <button type="button" className="button button-ghost button-small" onClick={onClearFruit}>
          {t('clearFruit')}
        </button>
      ) : null}

      {parsed && bookIsBundled(BOOKS[parsed.bookIndex]?.id ?? '') ? (
        <button type="button" className="result-row" onClick={() => onOpenPassage(parsed)}>
          <span>{formatPassage(language, parsed)}</span>
          <span className="result-action">{t('readPassage')}</span>
        </button>
      ) : null}

      {mode === 'word' && busy ? <p className="status">{t('searching')}</p> : null}
      {mode === 'word' && !busy && query.trim().length >= 2 && hits.length === 0 && !parsed ? (
        <p className="status">{t('noWordMatches')}</p>
      ) : null}
      {mode === 'word' && hits.length > 0 ? (
        <section>
          <h2 className="section-title">{t('scriptureMatches')}</h2>
          <ul className="result-list">
            {hits.map((hit) => (
              <li key={`${hit.bookIndex}:${hit.chapter}:${hit.verse}`}>
                <button type="button" className="result-row" onClick={() => onOpenPassage(hit)}>
                  <span className="result-ref">{formatPassage(language, hit)}</span>
                  <span className="result-text">{hit.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {mode === 'word' && savedHits.length > 0 ? (
        <section>
          <h2 className="section-title">{t('savedMatches')}</h2>
          <ul className="result-list">
            {savedHits.map((verse) => (
              <li key={verse.id}>
                <button
                  type="button"
                  className="result-row"
                  onClick={() => verse.passage && onOpenPassage(verse.passage)}
                  disabled={!verse.passage}
                >
                  <span className="result-ref">{verse.reference}</span>
                  <span className="result-text">{verse.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {mode === 'topics' && (query.trim() || fruit) && fruitPassages.length === 0 ? (
        <p className="status">{t('noTopicMatches')}</p>
      ) : null}
      {mode === 'topics'
        ? fruitPassages.map((topic) => (
            <section key={topic.id}>
              <h2 className="section-title">{topic.labelKey ? t(topic.labelKey) : topic.label}</h2>
              <ul className="result-list">
                {topic.passages.map((passage) => (
                  <li key={`${topic.id}:${passage.bookIndex}:${passage.chapter}:${passage.verse}`}>
                    <button type="button" className="result-row" onClick={() => onOpenPassage(passage)}>
                      <span className="result-ref">{formatPassage(language, passage)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        : null}
      {mode === 'topics' ? <p className="source-line">{t('topicsNote')}</p> : null}

      {showBooks ? (
        <>
          <BookGroup title={t('oldTestament')} books={BOOKS.slice(0, NEW_TESTAMENT_INDEX)} offset={0} onOpenBook={onOpenBook} />
          <BookGroup title={t('newTestament')} books={BOOKS.slice(NEW_TESTAMENT_INDEX)} offset={NEW_TESTAMENT_INDEX} onOpenBook={onOpenBook} />
        </>
      ) : null}
    </div>
  )
}

function BookGroup({
  title,
  books,
  offset,
  onOpenBook,
}: {
  title: string
  books: readonly (typeof BOOKS)[number][]
  offset: number
  onOpenBook: (bookIndex: number) => void
}) {
  const { language, t } = useLanguage()
  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <div className="book-grid">
        {books.map((book, index) => {
          const bundled = bookIsBundled(book.id)
          return (
            <button key={book.id} type="button" className="book-card" data-later={bundled ? undefined : 'true'} onClick={() => onOpenBook(offset + index)}>
              <BookArt bookId={book.id} />
              <span>{book.names[language]}</span>
              {bundled ? null : <span className="later">{t('later')}</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function ChapterList({ bookIndex, onOpenChapter }: { bookIndex: number; onOpenChapter: (chapter: number) => void }) {
  const { t } = useLanguage()
  const book = BOOKS[bookIndex]
  return (
    <div>
      <h2 className="section-title">{t('chapters')}</h2>
      <div className="chapter-grid">
        {Array.from({ length: book.chapters }, (_, index) => (
          <button key={index + 1} type="button" className="chapter-btn" onClick={() => onOpenChapter(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MissingBook() {
  const { t } = useLanguage()
  return (
    <div className="status">
      <p>{t('bookMissing')}</p>
      <p className="setting-help">{t('bookMissingHelp')}</p>
    </div>
  )
}
