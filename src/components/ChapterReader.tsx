import { useEffect, useRef, useState } from 'react'
import type { Category, Verse } from '../data/types'
import { TABLET_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useLanguage } from '../i18n/useLanguage'
import { loadBook } from '../scripture/api'
import { bookIsBundled } from '../scripture/bundled'
import { BOOKS } from '../scripture/books'
import type { PassageRef } from '../scripture/passages'
import type { ListenController } from '../speech/useListen'
import { BookArt } from './BookArt'
import { isSpeaking, ListenBar } from './ListenBar'
import { VerseStudy } from './VerseStudy'

type Block = {
  bookIndex: number
  chapter: number
  verses: string[]
}

type Listen = ListenController

async function nextPlace(versionId: string, bookIndex: number, chapter: number): Promise<PassageRef | null> {
  const book = BOOKS[bookIndex]
  if (book && chapter < book.chapters && bookIsBundled(book.id)) {
    const chapters = await loadBook(versionId, bookIndex)
    if (chapters?.[chapter]) return { bookIndex, chapter: chapter + 1, verse: 1 }
  }
  for (let index = bookIndex + 1; index < BOOKS.length; index += 1) {
    if (!bookIsBundled(BOOKS[index].id)) continue
    const chapters = await loadBook(versionId, index)
    if (chapters?.[0]) return { bookIndex: index, chapter: 1, verse: 1 }
  }
  return null
}

export function ChapterReader({
  versionId,
  startBook,
  startChapter,
  startVerse,
  selected,
  verses,
  categories,
  listen,
  onSelect,
  onOpenPassage,
  onSave,
  onVisible,
  autoplay = false,
  onAutoplayDone,
}: {
  versionId: string
  startBook: number
  startChapter: number
  startVerse: number | null
  selected: PassageRef | null
  verses: readonly Verse[]
  categories: readonly Category[]
  listen: Listen
  onSelect: (passage: PassageRef | null) => void
  onOpenPassage: (passage: PassageRef) => void
  onSave: (passage: PassageRef, text: string) => void
  onVisible: (bookIndex: number, chapter: number) => void
  autoplay?: boolean
  onAutoplayDone?: () => void
}) {
  const { language, t } = useLanguage()
  const tablet = useMediaQuery(TABLET_QUERY)
  const [blocks, setBlocks] = useState<Block[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [done, setDone] = useState(false)
  const blocksRef = useRef<Block[]>([])
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingMore = useRef(false)
  const scrolled = useRef(false)

  useEffect(() => {
    let cancelled = false
    scrolled.current = false
    setFailed(false)
    setDone(false)
    setBlocks(null)
    loadBook(versionId, startBook)
      .then((chapters) => {
        if (cancelled) return
        const versesInChapter = chapters?.[startChapter - 1]
        if (!versesInChapter) {
          setFailed(true)
          blocksRef.current = []
          setBlocks([])
          return
        }
        const first = [{ bookIndex: startBook, chapter: startChapter, verses: versesInChapter }]
        blocksRef.current = first
        setBlocks(first)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [versionId, startBook, startChapter])

  const autoplayed = useRef(false)
  useEffect(() => {
    if (!autoplay || !blocks?.length || autoplayed.current) return
    autoplayed.current = true
    const first = blocks[0]
    listen.start(
      first.verses.map((text, index) => ({
        passage: { bookIndex: first.bookIndex, chapter: first.chapter, verse: index + 1 },
        text,
      })),
    )
    onAutoplayDone?.()
  }, [autoplay, blocks, listen, onAutoplayDone])

  useEffect(() => {
    if (!blocks?.length || !startVerse || scrolled.current) return
    const node = document.getElementById(`v-${startBook}-${startChapter}-${startVerse}`)
    node?.scrollIntoView({ block: 'center' })
    scrolled.current = true
  }, [blocks, startBook, startChapter, startVerse])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !blocks?.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (loadingMore.current || done) return
        const last = blocksRef.current[blocksRef.current.length - 1]
        if (!last) return
        loadingMore.current = true
        void nextPlace(versionId, last.bookIndex, last.chapter)
          .then(async (next) => {
            if (!next) {
              setDone(true)
              return
            }
            const chapters = await loadBook(versionId, next.bookIndex)
            const versesInChapter = chapters?.[next.chapter - 1]
            if (!versesInChapter) {
              setDone(true)
              return
            }
            const block = { bookIndex: next.bookIndex, chapter: next.chapter, verses: versesInChapter }
            blocksRef.current = [...blocksRef.current, block]
            setBlocks(blocksRef.current)
          })
          .finally(() => {
            loadingMore.current = false
          })
      },
      { rootMargin: '480px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [blocks, done, versionId])

  useEffect(() => {
    const root = document.querySelector('.reader-column')
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]
        if (!visible) return
        const chapter = Number((visible.target as HTMLElement).dataset.chapter)
        const bookIndex = Number((visible.target as HTMLElement).dataset.book)
        if (Number.isFinite(chapter) && Number.isFinite(bookIndex)) onVisible(bookIndex, chapter)
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0.1, 0.4] },
    )
    root.querySelectorAll('[data-chapter]').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [blocks, onVisible])

  function linesFor(block: Block, onlyVerse: number | null): { passage: PassageRef; text: string }[] {
    return block.verses.flatMap((text, index) => {
      const verse = index + 1
      if (onlyVerse !== null && verse !== onlyVerse) return []
      return [{ passage: { bookIndex: block.bookIndex, chapter: block.chapter, verse }, text }]
    })
  }

  const first = blocks?.[0]
  const selectedText =
    selected && blocks
      ? (blocks.find((block) => block.bookIndex === selected.bookIndex && block.chapter === selected.chapter)?.verses[
          selected.verse - 1
        ] ?? '')
      : ''

  const study =
    selected && selectedText ? (
      <VerseStudy
        passage={selected}
        text={selectedText}
        verses={verses}
        categories={categories}
        onOpenPassage={onOpenPassage}
        onSave={() => onSave(selected, selectedText)}
        onClose={() => onSelect(null)}
      />
    ) : null

  return (
    <div className={tablet && study ? 'reader-layout' : 'reader-layout reader-single'}>
      <div className="reader-column">
        {failed ? <p className="status">{t('chapterFailed')}</p> : null}
        {blocks === null && !failed ? <p className="status">{t('openingChapter')}</p> : null}
        <div className="reader-card">
          {blocks?.map((block, index) => {
            const showArt = index === 0 || block.bookIndex !== blocks[index - 1]?.bookIndex
            return (
              <section
                key={`${block.bookIndex}:${block.chapter}`}
                data-book={block.bookIndex}
                data-chapter={block.chapter}
              >
                {showArt ? (
                  <div className="chapter-art">
                    <BookArt bookId={BOOKS[block.bookIndex].id} />
                  </div>
                ) : null}
                <h2 className="chapter-heading">
                  {BOOKS[block.bookIndex].names[language]} {block.chapter}
                </h2>
                {block.verses.map((text, verseIndex) => {
                  const verse = verseIndex + 1
                  const passage = { bookIndex: block.bookIndex, chapter: block.chapter, verse }
                  const active =
                    selected?.bookIndex === passage.bookIndex &&
                    selected.chapter === passage.chapter &&
                    selected.verse === verse
                  const landed =
                    !active &&
                    startVerse === verse &&
                    block.chapter === startChapter &&
                    block.bookIndex === startBook
                  return (
                    <button
                      key={verse}
                      id={`v-${block.bookIndex}-${block.chapter}-${verse}`}
                      type="button"
                      className="verse-line"
                      data-active={active ? 'true' : undefined}
                      data-landed={landed ? 'true' : undefined}
                      data-speaking={isSpeaking(listen, passage) ? 'true' : undefined}
                      onClick={() => onSelect(active ? null : passage)}
                    >
                      <span className="verse-num">{verse}</span>
                      <span>{text}</span>
                    </button>
                  )
                })}
              </section>
            )
          })}
          {done ? <p className="end-note">{t('endOfReading')}</p> : null}
          <div ref={sentinelRef} className="sentinel" />
        </div>
        {first ? (
          <ListenBar
            listen={listen}
            verse={() => {
              const verse = selected?.verse ?? startVerse ?? 1
              const block = blocks?.find((item) => item.chapter === (selected?.chapter ?? startChapter) && item.bookIndex === (selected?.bookIndex ?? startBook)) ?? first
              const line = linesFor(block, verse)[0]
              if (line) listen.start([line])
            }}
            chapter={() => {
              const block = blocks?.find((item) => item.chapter === (selected?.chapter ?? startChapter) && item.bookIndex === (selected?.bookIndex ?? startBook)) ?? first
              listen.start(linesFor(block, null))
            }}
          />
        ) : null}
      </div>
      {tablet && study ? <aside className="study-pane">{study}</aside> : null}
      {!tablet && study ? (
        <div className="sheet-backdrop" onClick={() => onSelect(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={selected ? `${BOOKS[selected.bookIndex]?.names[language]} ${selected.chapter}:${selected.verse}` : undefined}
            onClick={(event) => event.stopPropagation()}
          >
            {study}
          </div>
        </div>
      ) : null}
    </div>
  )
}
