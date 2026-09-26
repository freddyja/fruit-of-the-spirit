import { useCallback, useEffect, useState } from 'react'
import { ChapterReader } from './components/ChapterReader'
import { GrowScreen } from './components/GrowScreen'
import { HomeScreen } from './components/HomeScreen'
import { LanguagePicker } from './components/LanguagePicker'
import { PlanPanel } from './components/PlanPanel'
import { ChapterList, MissingBook, ReadScreen } from './components/ReadScreen'
import { CategoryManager, SavedList, VerseForm } from './components/SavedScreens'
import { SettingsPanel } from './components/SettingsPanel'
import { TabBar, type TabId } from './components/TabBar'
import { verseForPassage } from './data/matchVerse'
import type { Passage } from './data/types'
import { useLibrary } from './hooks/useLibrary'
import { useReadingPlan } from './hooks/useReadingPlan'
import { useLanguage } from './i18n/useLanguage'
import { bookIsBundled } from './scripture/bundled'
import { BOOKS } from './scripture/books'
import { dailyVerse } from './scripture/daily'
import type { FruitId } from './scripture/fruits'
import { formatPassage, type PassageRef } from './scripture/passages'
import { useListen } from './speech/useListen'

type Panel = null | 'settings' | 'plan'

type ReadPlace =
  | { kind: 'shelf' }
  | { kind: 'book'; bookIndex: number }
  | { kind: 'missing'; bookIndex: number }
  | { kind: 'chapter'; bookIndex: number; chapter: number; verse: number | null }

type ReturnTo = 'home' | 'read' | 'saved'

type View =
  | { kind: 'tabs' }
  | { kind: 'categories' }
  | {
      kind: 'edit'
      verseId: string | null
      prefillReference?: string
      prefillText?: string
      prefillPassage?: Passage
      returnTo: ReturnTo
    }

function BackIcon() {
  return (
    <svg className="back-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg className="gear-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.1a7.7 7.7 0 0 0 .05-2.2l1.7-1.3-1.6-2.8-2 .8a7.6 7.6 0 0 0-1.9-1.1l-.3-2.1h-3.2l-.3 2.1a7.6 7.6 0 0 0-1.9 1.1l-2-.8-1.6 2.8 1.7 1.3a7.7 7.7 0 0 0 0 2.2l-1.7 1.3 1.6 2.8 2-.8c.6.45 1.2.82 1.9 1.1l.3 2.1h3.2l.3-2.1c.7-.28 1.3-.65 1.9-1.1l2 .8 1.6-2.8-1.7-1.3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function App() {
  const library = useLibrary()
  const reading = useReadingPlan()
  const { language, versionId, versionName, t } = useLanguage()
  const [tab, setTab] = useState<TabId>('home')
  const [panel, setPanel] = useState<Panel>(null)
  const [read, setRead] = useState<ReadPlace>({ kind: 'shelf' })
  const [heading, setHeading] = useState<{ bookIndex: number; chapter: number } | null>(null)
  const [selected, setSelected] = useState<PassageRef | null>(null)
  const [view, setView] = useState<View>({ kind: 'tabs' })
  const [searchMode, setSearchMode] = useState<'word' | 'topics'>('word')
  const [searchQuery, setSearchQuery] = useState('')
  const [fruitId, setFruitId] = useState<FruitId | null>(null)
  const [autoplay, setAutoplay] = useState(false)
  const listen = useListen(language)

  const onVisible = useCallback((bookIndex: number, chapter: number) => {
    setHeading((current) =>
      current?.bookIndex === bookIndex && current.chapter === chapter ? current : { bookIndex, chapter },
    )
  }, [])

  const showTabs = view.kind === 'tabs' && panel === null
  const onHome = showTabs && tab === 'home'
  const onRead = showTabs && tab === 'read'
  const onGrow = showTabs && tab === 'grow'
  const onSaved = showTabs && tab === 'saved'
  const showBack = panel !== null || view.kind !== 'tabs' || (onRead && read.kind !== 'shelf')

  const bookIndex =
    read.kind === 'book' || read.kind === 'missing' || read.kind === 'chapter'
      ? (heading && read.kind === 'chapter' ? heading.bookIndex : read.bookIndex)
      : null
  const bookName = bookIndex === null ? '' : BOOKS[bookIndex].names[language]

  let title = t('brandName')
  if (panel === 'settings') title = t('settingsTitle')
  else if (panel === 'plan') title = t('planTitle')
  else if (view.kind === 'categories') title = t('categoriesTitle')
  else if (view.kind === 'edit') title = view.verseId ? t('editTitle') : t('newTitle')
  else if (tab === 'home') title = t('brandName')
  else if (tab === 'read' && read.kind === 'shelf') title = t('navRead')
  else if (tab === 'read' && (read.kind === 'book' || read.kind === 'missing')) title = bookName
  else if (tab === 'read' && read.kind === 'chapter') {
    const chapter = heading?.chapter ?? read.chapter
    title = `${bookName} ${chapter}`
  } else if (tab === 'grow') title = t('navGrow')
  else if (tab === 'saved') title = t('navSaved')

  useEffect(() => {
    document.title = onHome ? t('brandName') : title
  }, [onHome, title, t])

  function openChapter(nextBook: number, chapter: number, verse: number | null, play = false) {
    listen.stop()
    setAutoplay(play)
    setTab('read')
    setPanel(null)
    setView({ kind: 'tabs' })
    setHeading({ bookIndex: nextBook, chapter })
    setSelected(null)
    setRead({ kind: 'chapter', bookIndex: nextBook, chapter, verse })
  }

  function openBook(nextBook: number) {
    listen.stop()
    setAutoplay(false)
    setTab('read')
    setPanel(null)
    setView({ kind: 'tabs' })
    setSelected(null)
    if (!bookIsBundled(BOOKS[nextBook]?.id ?? '')) setRead({ kind: 'missing', bookIndex: nextBook })
    else setRead({ kind: 'book', bookIndex: nextBook })
  }

  function showShelf() {
    listen.stop()
    setAutoplay(false)
    setPanel(null)
    setView({ kind: 'tabs' })
    setSelected(null)
    setRead({ kind: 'shelf' })
    setTab('read')
  }

  function selectTab(next: TabId) {
    listen.stop()
    setAutoplay(false)
    setPanel(null)
    setView({ kind: 'tabs' })
    if (next === 'read' && tab === 'read' && read.kind !== 'shelf') {
      setSelected(null)
      setRead({ kind: 'shelf' })
    }
    setTab(next)
  }

  function goBack() {
    listen.stop()
    setAutoplay(false)
    if (panel === 'plan') {
      setPanel(null)
      return
    }
    if (panel) {
      setPanel(null)
      return
    }
    if (view.kind === 'edit') {
      setTab(view.returnTo === 'saved' ? 'saved' : view.returnTo === 'home' ? 'home' : 'read')
      setView({ kind: 'tabs' })
      return
    }
    if (view.kind === 'categories') {
      setTab('saved')
      setView({ kind: 'tabs' })
      return
    }
    if (tab === 'read' && read.kind === 'chapter') {
      setSelected(null)
      setRead({ kind: 'book', bookIndex: read.bookIndex })
      return
    }
    if (tab === 'read' && (read.kind === 'book' || read.kind === 'missing')) setRead({ kind: 'shelf' })
  }

  function readPlanDay(day: { start: { bookIndex: number; chapter: number } }) {
    if (!bookIsBundled(BOOKS[day.start.bookIndex]?.id ?? '')) {
      setTab('read')
      setPanel(null)
      setView({ kind: 'tabs' })
      setRead({ kind: 'missing', bookIndex: day.start.bookIndex })
      return
    }
    openChapter(day.start.bookIndex, day.start.chapter, null)
  }

  const editing =
    view.kind === 'edit' && view.verseId ? (library.verses.find((verse) => verse.id === view.verseId) ?? null) : null

  return (
    <div className={view.kind === 'tabs' && panel === null ? 'app app-tabs' : 'app'}>
      <header className={onHome ? 'mast mast-home' : 'mast'}>
        <div className="top">
          <div className="title-block">
            {showBack ? (
              <button type="button" className="back" onClick={goBack}>
                <BackIcon />
                {t('navBack')}
              </button>
            ) : null}
            {onHome ? (
              <div className="home-brand">
                <h1 className="brand">{t('brandName')}</h1>
                <p className="credit">{t('designedBy')}</p>
              </div>
            ) : (
              <h1 className="brand">{title}</h1>
            )}
            {onHome || onRead ? <p className="version-line">{versionName}</p> : null}
            {onHome ? (
              <>
                <p className="tagline">{t('tagline')}</p>
                <LanguagePicker />
              </>
            ) : null}
          </div>
          <div className="top-actions">
            {onSaved ? (
              <button type="button" className="button button-ghost button-small" onClick={() => setView({ kind: 'categories' })}>
                {t('categories')}
              </button>
            ) : null}
            {view.kind === 'tabs' && panel !== 'settings' ? (
              <button type="button" className="icon-button" aria-label={t('openSettings')} onClick={() => setPanel('settings')}>
                <GearIcon />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {library.status === 'loading' && (onSaved || view.kind !== 'tabs') ? <p className="status">{t('opening')}</p> : null}
      {library.status === 'error' && (onSaved || view.kind !== 'tabs') ? (
        <div className="status">
          <p>{t('openFailed')}</p>
          <button type="button" className="button" onClick={() => void library.reload()}>
            {t('tryAgain')}
          </button>
        </div>
      ) : null}

      {view.kind === 'tabs' && panel === 'settings' ? (
        <main>
          <SettingsPanel onPlan={() => setPanel('plan')} />
        </main>
      ) : null}
      {view.kind === 'tabs' && panel === 'plan' ? (
        <main>
          <PlanPanel
            stored={reading.plan}
            completedCount={reading.completedCount}
            currentDay={reading.currentDay}
            onSaveOptions={reading.saveOptions}
            onToggle={reading.toggleDay}
            onRead={readPlanDay}
          />
        </main>
      ) : null}

      {onHome ? (
        <main>
          <HomeScreen
            onOpenPassage={(nextBook, chapter, verse) => openChapter(nextBook, chapter, verse)}
            onRead={showShelf}
            onTopics={() => {
              setSearchMode('topics')
              setSearchQuery('')
              setFruitId(null)
              showShelf()
            }}
            onPlan={() => setPanel('plan')}
            onGrow={() => selectTab('grow')}
            onSaved={() => selectTab('saved')}
            onListen={() => {
              const passage = dailyVerse()
              openChapter(passage.bookIndex, passage.chapter, passage.verse, true)
            }}
            onFruit={(id) => {
              setFruitId(id)
              setSearchMode('topics')
              setSearchQuery('')
              showShelf()
            }}
          />
        </main>
      ) : null}

      {onRead && read.kind === 'shelf' ? (
        <main>
          <ReadScreen
            versionId={versionId}
            mode={searchMode}
            query={searchQuery}
            fruitId={fruitId}
            saved={library.verses}
            onMode={setSearchMode}
            onQuery={setSearchQuery}
            onClearFruit={() => setFruitId(null)}
            onOpenBook={openBook}
            onOpenPassage={(passage) => openChapter(passage.bookIndex, passage.chapter, passage.verse)}
          />
        </main>
      ) : null}

      {onRead && read.kind === 'book' ? (
        <main>
          <ChapterList bookIndex={read.bookIndex} onOpenChapter={(chapter) => openChapter(read.bookIndex, chapter, null)} />
        </main>
      ) : null}

      {onRead && read.kind === 'missing' ? (
        <main>
          <MissingBook />
        </main>
      ) : null}

      {onRead && read.kind === 'chapter' ? (
        <main>
          <ChapterReader
            key={`${versionId}:${read.bookIndex}:${read.chapter}:${read.verse ?? 0}`}
            versionId={versionId}
            startBook={read.bookIndex}
            startChapter={read.chapter}
            startVerse={read.verse}
            selected={selected}
            verses={library.verses}
            categories={library.categories}
            listen={listen}
            autoplay={autoplay}
            onAutoplayDone={() => setAutoplay(false)}
            onSelect={setSelected}
            onVisible={onVisible}
            onOpenPassage={(passage) => openChapter(passage.bookIndex, passage.chapter, passage.verse)}
            onSave={(passage, text) => {
              const existing = verseForPassage(library.verses, passage)
              listen.stop()
              setView({
                kind: 'edit',
                verseId: existing?.id ?? null,
                prefillReference: formatPassage(language, passage),
                prefillText: text,
                prefillPassage: passage,
                returnTo: 'read',
              })
            }}
          />
        </main>
      ) : null}

      {onGrow ? (
        <main>
          <GrowScreen
            onOpenPassage={(passage) => openChapter(passage.bookIndex, passage.chapter, passage.verse)}
            onOpenPlan={() => setPanel('plan')}
          />
        </main>
      ) : null}

      {onSaved && library.status === 'ready' ? (
        <main>
          <SavedList
            verses={library.verses}
            categories={library.categories}
            voiceNoteIds={library.voiceNoteIds}
            onOpen={(verseId) => setView({ kind: 'edit', verseId, returnTo: 'saved' })}
            onCreate={() => setView({ kind: 'edit', verseId: null, returnTo: 'saved' })}
          />
        </main>
      ) : null}

      {library.status === 'ready' && view.kind === 'edit' ? (
        <main>
          {view.verseId && !editing ? (
            <div className="status">
              <p>{t('verseGone')}</p>
              <button type="button" className="button" onClick={() => setView({ kind: 'tabs' })}>
                {t('backToVerses')}
              </button>
            </div>
          ) : (
            <VerseForm
              key={`${editing?.id ?? 'new'}:${view.prefillReference ?? ''}`}
              verse={editing}
              initialReference={editing ? undefined : view.prefillReference}
              initialText={editing ? undefined : view.prefillText}
              initialPassage={editing ? undefined : view.prefillPassage}
              categories={library.categories}
              onSave={library.saveVerse}
              onDelete={library.deleteVerse}
              onCreateCategory={library.createCategory}
              onDone={() => {
                setTab(view.returnTo === 'saved' ? 'saved' : view.returnTo === 'home' ? 'home' : 'read')
                setView({ kind: 'tabs' })
              }}
            />
          )}
        </main>
      ) : null}

      {library.status === 'ready' && view.kind === 'categories' ? (
        <main>
          <CategoryManager
            categories={library.categories}
            onCreate={library.createCategory}
            onRename={library.renameCategory}
            onDelete={library.deleteCategory}
          />
        </main>
      ) : null}

      {view.kind === 'tabs' && panel === null ? <TabBar tab={tab} onSelect={selectTab} /> : null}
    </div>
  )
}
