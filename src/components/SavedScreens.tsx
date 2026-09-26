import { useEffect, useId, useRef, useState } from 'react'
import { categoryDisplayName, findCategoryByTypedName, storedNameForRename } from '../data/categoryLabel'
import { getVoiceNote } from '../data/db'
import { LibraryError } from '../data/errors'
import { filterVerses } from '../data/filter'
import type { Category, Passage, Verse, VerseDraft, VoiceNoteUpdate } from '../data/types'
import type { MessageKey } from '../i18n/messages'
import { useLanguage } from '../i18n/useLanguage'

function errorText(caught: unknown, t: (key: MessageKey) => string): string {
  if (caught instanceof LibraryError) return t(caught.code)
  return t('couldNotSave')
}

export function SavedList({
  verses,
  categories,
  voiceNoteIds,
  onOpen,
  onCreate,
}: {
  verses: readonly Verse[]
  categories: readonly Category[]
  voiceNoteIds: readonly string[]
  onOpen: (verseId: string) => void
  onCreate: () => void
}) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const visible = filterVerses(verses, query, categoryId)
  const active = categories.find((category) => category.id === categoryId)
  let empty = t('emptyNone')
  if (verses.length > 0 && query && active) empty = t('emptySearch', { query })
  else if (query) empty = t('emptySearch', { query })
  else if (active) empty = t('emptyCategory', { name: categoryDisplayName(active, t) })

  return (
    <div className="saved">
      <label className="field">
        <span className="sr-only">{t('searchLabel')}</span>
        <input value={query} placeholder={t('searchWordPlaceholder')} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="chip-row" role="group" aria-label={t('filterLabel')}>
        <button type="button" className="chip" aria-pressed={categoryId === null} onClick={() => setCategoryId(null)}>
          {t('all')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="chip"
            aria-pressed={categoryId === category.id}
            onClick={() => setCategoryId(category.id)}
          >
            {categoryDisplayName(category, t)}
          </button>
        ))}
      </div>
      <p className="count">{visible.length === 1 ? t('countOne') : t('countMany', { count: visible.length })}</p>
      {visible.length === 0 ? <p className="status">{empty}</p> : null}
      <ul className="saved-list">
        {visible.map((verse) => (
          <li key={verse.id}>
            <button type="button" className="saved-card" onClick={() => onOpen(verse.id)}>
              <span className="result-ref">{verse.reference}</span>
              <span className="result-text">{verse.text}</span>
              {verse.note ? <span className="link-note">{verse.note}</span> : null}
              {voiceNoteIds.includes(verse.id) ? <span className="later">{t('voiceNote')}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="dock">
        <button type="button" className="button button-block" onClick={onCreate}>
          {t('saveDock')}
        </button>
        <p className="privacy">{t('privacy')}</p>
      </div>
    </div>
  )
}

export function CategoryManager({
  categories,
  onCreate,
  onRename,
  onDelete,
}: {
  categories: readonly Category[]
  onCreate: (name: string) => Promise<Category>
  onRename: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function add() {
    setError(null)
    if (findCategoryByTypedName(categories, name)) {
      setError(t('categoryExists'))
      return
    }
    try {
      await onCreate(name)
      setName('')
    } catch (caught) {
      setError(errorText(caught, t))
    }
  }

  return (
    <div className="categories">
      <p className="setting-help">{t('categoryLede')}</p>
      {categories.length === 0 ? <p className="status">{t('noCategories')}</p> : null}
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.id}>
            {editing === category.id ? (
              <form
                className="inline-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void onRename(category.id, storedNameForRename(category, draft))
                    .then(() => setEditing(null))
                    .catch((caught: unknown) => setError(errorText(caught, t)))
                }}
              >
                <input value={draft} onChange={(event) => setDraft(event.target.value)} />
                <button type="submit" className="button button-small">
                  {t('save')}
                </button>
                <button type="button" className="button button-ghost button-small" onClick={() => setEditing(null)}>
                  {t('cancel')}
                </button>
              </form>
            ) : (
              <div className="category-row">
                <span>{categoryDisplayName(category, t)}</span>
                <button
                  type="button"
                  className="button button-ghost button-small"
                  onClick={() => {
                    setEditing(category.id)
                    setDraft(categoryDisplayName(category, t))
                  }}
                >
                  {t('rename')}
                </button>
                <button
                  type="button"
                  className="button button-ghost button-small"
                  onClick={() => {
                    if (window.confirm(t('deleteCategoryTitle', { name: categoryDisplayName(category, t) }))) {
                      void onDelete(category.id).catch((caught: unknown) => setError(errorText(caught, t)))
                    }
                  }}
                >
                  {t('delete')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <form
        className="inline-form"
        onSubmit={(event) => {
          event.preventDefault()
          void add()
        }}
      >
        <label className="field">
          <span className="label">{t('newCategory')}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit" className="button button-small">
          {t('add')}
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
}

export function VerseForm({
  verse,
  initialReference,
  initialText,
  initialPassage,
  categories,
  onSave,
  onDelete,
  onCreateCategory,
  onDone,
}: {
  verse: Verse | null
  initialReference?: string
  initialText?: string
  initialPassage?: Passage
  categories: readonly Category[]
  onSave: (draft: VerseDraft, id: string | undefined, voice: VoiceNoteUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCreateCategory: (name: string) => Promise<Category>
  onDone: () => void
}) {
  const { t } = useLanguage()
  const [reference, setReference] = useState(verse?.reference ?? initialReference ?? '')
  const [text, setText] = useState(verse?.text ?? initialText ?? '')
  const [note, setNote] = useState(verse?.note ?? '')
  const [categoryIds, setCategoryIds] = useState<string[]>(verse?.categoryIds ?? [])
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [removeVoice, setRemoveVoice] = useState(false)
  const [hasVoice, setHasVoice] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const labelId = useId()

  useEffect(() => {
    if (!verse) return
    let cancelled = false
    getVoiceNote(verse.id)
      .then((record) => {
        if (!cancelled) setHasVoice(Boolean(record))
      })
      .catch(() => {
        if (!cancelled) setHasVoice(false)
      })
    return () => {
      cancelled = true
    }
  }, [verse])

  function stopRecorder() {
    recorder.current?.stop()
    setRecording(false)
  }

  async function startRecorder() {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(t('cannotRecord'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const media = new MediaRecorder(stream)
      chunks.current = []
      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data)
      }
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const next = new Blob(chunks.current, { type: media.mimeType || 'audio/webm' })
        if (next.size === 0) setError(t('emptyRecording'))
        else {
          setBlob(next)
          setRemoveVoice(false)
        }
      }
      recorder.current = media
      media.start()
      setRecording(true)
    } catch {
      setError(t('micUnavailable'))
    }
  }

  async function play() {
    try {
      const source = blob ?? (verse ? (await getVoiceNote(verse.id))?.blob : undefined)
      if (!source) return
      const url = URL.createObjectURL(source)
      const audio = new Audio(url)
      audio.onended = () => URL.revokeObjectURL(url)
      await audio.play()
    } catch {
      setError(t('playbackFailed'))
    }
  }

  async function submit() {
    if (recording) {
      setError(t('stopThenSave'))
      return
    }
    setError(null)
    const voice: VoiceNoteUpdate = blob
      ? { kind: 'replace', blob }
      : removeVoice
        ? { kind: 'remove' }
        : { kind: 'keep' }
    try {
      await onSave(
        {
          reference,
          text,
          note,
          categoryIds,
          passage: verse?.passage ?? initialPassage,
        },
        verse?.id,
        voice,
      )
      onDone()
    } catch (caught) {
      setError(errorText(caught, t))
    }
  }

  return (
    <form
      className="verse-form"
      aria-labelledby={labelId}
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h2 id={labelId} className="sr-only">
        {verse ? t('editTitle') : t('newTitle')}
      </h2>
      <label className="field">
        <span className="label">{t('reference')}</span>
        <input value={reference} placeholder={t('referencePlaceholder')} onChange={(event) => setReference(event.target.value)} />
      </label>
      <label className="field">
        <span className="label">{t('verse')}</span>
        <textarea rows={5} value={text} placeholder={t('versePlaceholder')} onChange={(event) => setText(event.target.value)} />
      </label>
      <label className="field">
        <span className="label">
          {t('why')} <span className="optional">{t('optional')}</span>
        </span>
        <textarea rows={3} value={note} placeholder={t('notePlaceholder')} onChange={(event) => setNote(event.target.value)} />
      </label>
      <fieldset className="category-picks">
        <legend>{t('categories')}</legend>
        {categories.map((category) => (
          <label key={category.id} className="check">
            <input
              type="checkbox"
              checked={categoryIds.includes(category.id)}
              onChange={() =>
                setCategoryIds((current) =>
                  current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id],
                )
              }
            />
            {categoryDisplayName(category, t)}
          </label>
        ))}
      </fieldset>
      <div className="inline-form">
        <input
          value={categoryName}
          placeholder={t('newCategory')}
          onChange={(event) => setCategoryName(event.target.value)}
        />
        <button
          type="button"
          className="button button-small button-ghost"
          onClick={() => {
            if (findCategoryByTypedName(categories, categoryName)) {
              setError(t('categoryExists'))
              return
            }
            void onCreateCategory(categoryName)
              .then((category) => {
                setCategoryIds((current) => [...current, category.id])
                setCategoryName('')
              })
              .catch((caught: unknown) => setError(errorText(caught, t)))
          }}
        >
          {t('add')}
        </button>
      </div>
      <fieldset>
        <legend>{t('voiceNote')}</legend>
        <div className="listen-bar">
          {recording ? (
            <button type="button" className="button button-small" onClick={stopRecorder}>
              {t('stop')}
            </button>
          ) : (
            <button type="button" className="button button-small" onClick={() => void startRecorder()}>
              {blob || hasVoice ? t('recordAgain') : t('record')}
            </button>
          )}
          <button type="button" className="button button-ghost button-small" onClick={() => void play()} disabled={!blob && !hasVoice}>
            {t('play')}
          </button>
          <button
            type="button"
            className="button button-ghost button-small"
            onClick={() => {
              setBlob(null)
              setRemoveVoice(true)
              setHasVoice(false)
            }}
          >
            {t('remove')}
          </button>
        </div>
      </fieldset>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="button button-block">
        {t('saveVerse')}
      </button>
      {verse ? (
        <button
          type="button"
          className="button button-ghost button-block"
          onClick={() => {
            if (!window.confirm(t('deleteTitle'))) return
            void onDelete(verse.id)
              .then(onDone)
              .catch((caught: unknown) => setError(errorText(caught, t)))
          }}
        >
          {t('deleteVerse')}
        </button>
      ) : null}
    </form>
  )
}
