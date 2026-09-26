import { useSyncExternalStore } from 'react'

const BANNER_KEY = 'fruit-of-the-spirit.install-banner'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallSnapshot = {
  canInstall: boolean
  installed: boolean
  ios: boolean
  showBanner: boolean
}

const listeners = new Set<() => void>()

let deferred: BeforeInstallPromptEvent | null = null
let installed = false
let ios = false
let bannerDismissed = false
let started = false

const serverSnapshot: InstallSnapshot = {
  canInstall: false,
  installed: false,
  ios: false,
  showBanner: false,
}

let snapshot: InstallSnapshot = serverSnapshot

function publish() {
  const next: InstallSnapshot = {
    canInstall: deferred !== null && !installed,
    installed,
    ios,
    showBanner: deferred !== null && !installed && !bannerDismissed,
  }
  if (
    next.canInstall === snapshot.canInstall &&
    next.installed === snapshot.installed &&
    next.ios === snapshot.ios &&
    next.showBanner === snapshot.showBanner
  ) {
    return
  }
  snapshot = next
  for (const listener of listeners) listener()
}

function isIos(): boolean {
  const ua = navigator.userAgent
  const classic = /iPad|iPhone|iPod/.test(ua)
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return classic || iPadOs
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  ios = isIos()
  installed = isStandalone()
  try {
    bannerDismissed = localStorage.getItem(BANNER_KEY) === '1'
  } catch {
    bannerDismissed = false
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    publish()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    publish()
  })
  publish()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  start()
  return () => listeners.delete(listener)
}

if (typeof window !== 'undefined') start()

export function useInstallPrompt() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot)

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    deferred = null
    if (choice.outcome === 'accepted') installed = true
    publish()
  }

  function dismissBanner() {
    bannerDismissed = true
    try {
      localStorage.setItem(BANNER_KEY, '1')
    } catch {
      /* The banner can still hide for this visit. */
    }
    publish()
  }

  return { ...state, install, dismissBanner }
}
