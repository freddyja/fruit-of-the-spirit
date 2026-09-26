import type { Language } from '../i18n/messages'
import { useLanguage } from '../i18n/useLanguage'
import { bookIsBundled } from '../scripture/bundled'
import { BOOKS } from '../scripture/books'
import { PLAN_PACES, planBookLines, planForPace, type PlanDay, type PlanPace } from '../scripture/readingPlan'
import type { StoredPlan } from '../hooks/useReadingPlan'

export function PlanPanel({
  stored,
  completedCount,
  currentDay,
  onSaveOptions,
  onToggle,
  onRead,
}: {
  stored: StoredPlan | null
  completedCount: number
  currentDay: PlanDay | null
  onSaveOptions: (pace: PlanPace, versionId: string) => void
  onToggle: (day: number) => void
  onRead: (day: PlanDay) => void
}) {
  const { language, versionId, t } = useLanguage()
  const paceLabel: Record<PlanPace, 'plan90' | 'plan180' | 'plan365'> = {
    90: 'plan90',
    180: 'plan180',
    365: 'plan365',
  }

  return (
    <div className="plan">
      <p className="setting-help">{t('planHelp')}</p>
      <div className="pace-row">
        {PLAN_PACES.map((pace) => (
          <button
            key={pace}
            type="button"
            className="button button-small"
            aria-pressed={stored?.pace === pace}
            onClick={() => onSaveOptions(pace, stored?.versionId ?? versionId)}
          >
            {t(paceLabel[pace])}
          </button>
        ))}
      </div>
      {!stored ? <p className="status">{t('planNone')}</p> : null}
      {stored ? (
        <p className="plan-progress">{t('planProgress', { done: completedCount, total: stored.pace })}</p>
      ) : null}
      {currentDay ? (
        <TodayCard
          day={currentDay}
          language={language}
          done={stored?.completed.includes(currentDay.day) ?? false}
          onToggle={() => onToggle(currentDay.day)}
          onRead={() => onRead(currentDay)}
        />
      ) : null}
      {stored ? (
        <ol className="plan-days">
          {planForPace(stored.pace).slice(0, 14).map((day) => {
            const bundled = bookIsBundled(BOOKS[day.start.bookIndex]?.id ?? '')
            return (
              <li key={day.day}>
                <button type="button" className="result-row" onClick={() => (bundled ? onRead(day) : undefined)} disabled={!bundled}>
                  <span>
                    {t('planDay', { day: day.day })}
                    {stored.completed.includes(day.day) ? ` · ${t('planMarked')}` : ''}
                  </span>
                  <span className="result-text">{bundled ? planBookLines(language, day).join(', ') : t('planMissing')}</span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : null}
    </div>
  )
}

function TodayCard({
  day,
  language,
  done,
  onToggle,
  onRead,
}: {
  day: PlanDay
  language: Language
  done: boolean
  onToggle: () => void
  onRead: () => void
}) {
  const { t } = useLanguage()
  const bundled = bookIsBundled(BOOKS[day.start.bookIndex]?.id ?? '')
  return (
    <section className="glass-card">
      <p className="kicker">{t('planToday')}</p>
      <h2>{t('planDay', { day: day.day })}</h2>
      <p>{planBookLines(language, day).join(' · ')}</p>
      {bundled ? (
        <button type="button" className="button" onClick={onRead}>
          {t('readPassage')}
        </button>
      ) : (
        <p className="setting-help">{t('planMissing')}</p>
      )}
      <button type="button" className="button button-ghost" onClick={onToggle}>
        {done ? t('planMarked') : t('planMark')}
      </button>
    </section>
  )
}
