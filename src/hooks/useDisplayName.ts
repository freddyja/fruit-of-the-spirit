import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'fruit-of-the-spirit.display-name'
export const DISPLAY_NAME_LIMIT = 40

export type DisplayName = {
  /** False until the person saves a name or skips the prompt. */
  chosen: boolean
  name: string
}

function clip(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, DISPLAY_NAME_LIMIT)
}

function readDisplayName(): DisplayName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return { chosen: false, name: '' }
    return { chosen: true, name: clip(stored) }
  } catch {
    return { chosen: false, name: '' }
  }
}

let memory = readDisplayName()
const listeners = new Set<() => void>()

function commit(name: string): string {
  const next = { chosen: true, name: clip(name) }
  memory = next
  try {
    localStorage.setItem(STORAGE_KEY, next.name)
  } catch {
    // The choice still applies until the page closes.
  }
  listeners.forEach((listener) => listener())
  return next.name
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return memory
}

export function useDisplayName() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { ...current, save: commit }
}
