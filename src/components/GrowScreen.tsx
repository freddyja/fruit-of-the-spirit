import { useGrow } from '../hooks/useGrow'
import { useLanguage } from '../i18n/useLanguage'
import { toPassage } from '../scripture/fruits'
import { formatPassage } from '../scripture/passages'
import type { PassageRef } from '../scripture/passages'

export function GrowScreen({
  onOpenPassage,
  onOpenPlan,
}: {
  onOpenPassage: (passage: PassageRef) => void
  onOpenPlan: () => void
}) {
  const { t, language } = useLanguage()
  const grow = useGrow()
  const anchor = toPassage(grow.fruit.refs[0])

  return (
    <div className="grow">
      <section className="glass-card">
        <p className="kicker">{t('fruitOfDay')}</p>
        <h2 className="grow-fruit">{t(grow.fruit.label)}</h2>
        <p className="practice">{t(grow.fruit.practice)}</p>
        <button type="button" className="button" onClick={grow.toggleToday}>
          {grow.practiced ? t('growMarked') : t('growMark')}
        </button>
        {anchor ? (
          <button type="button" className="text-link" onClick={() => onOpenPassage(anchor)}>
            {formatPassage(language, anchor)}
          </button>
        ) : null}
      </section>
      <section className="glass-card">
        <h2>{t('planTitle')}</h2>
        <p className="setting-help">{t('planHelp')}</p>
        <button type="button" className="button button-ghost" onClick={onOpenPlan}>
          {t('planTitle')}
        </button>
      </section>
      <p className="source-line">{t('growLocal')}</p>
    </div>
  )
}
