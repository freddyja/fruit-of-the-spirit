import type { ReactNode } from 'react'
import { useLanguage } from '../i18n/useLanguage'

export type TabId = 'home' | 'read' | 'grow' | 'saved'

function IconHome() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.4v1.7M12 18.9v1.7M3.4 12h1.7M18.9 12h1.7M5.8 5.8l1.2 1.2M17 17l1.2 1.2M18.2 5.8 17 7M7 17l-1.2 1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconRead() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 5.5h6.2c1.2 0 2.3.6 2.8 1.5.5-.9 1.6-1.5 2.8-1.5H21V18h-4.2c-1.1 0-2.1.4-2.8 1.1-.7-.7-1.7-1.1-2.8-1.1H5V5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 7.2v11.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconGrow() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.5V11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M12 15.2c0-3.2-2.4-5.2-6.2-6.2 1.6 3.4 3.4 5.2 6.2 6.2zM12 13.2c0-3.4 2.8-6 7-7.2-1.4 3.6-3.6 5.6-7 7.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSaved() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const TABS: { id: TabId; label: 'navHome' | 'navRead' | 'navGrow' | 'navSaved'; icon: () => ReactNode }[] = [
  { id: 'home', label: 'navHome', icon: IconHome },
  { id: 'read', label: 'navRead', icon: IconRead },
  { id: 'grow', label: 'navGrow', icon: IconGrow },
  { id: 'saved', label: 'navSaved', icon: IconSaved },
]

export function TabBar({ tab, onSelect }: { tab: TabId; onSelect: (tab: TabId) => void }) {
  const { t } = useLanguage()
  return (
    <nav className="tab-bar" aria-label={t('brandName')}>
      {TABS.map((item) => {
        const Icon = item.icon
        const selected = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            className="tab-btn"
            aria-current={selected ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <Icon />
            <span>{t(item.label)}</span>
          </button>
        )
      })}
    </nav>
  )
}
