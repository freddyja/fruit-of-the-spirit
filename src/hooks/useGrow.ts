import { useCallback, useState } from 'react'
import { localDayNumber } from '../scripture/daily'
import { FRUITS, type Fruit } from '../scripture/fruits'

const STORAGE_KEY = 'fruit-of-the-spirit.practice'

function localDateStamp(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function readDays(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const days: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') days[key] = value
    }
    return days
  } catch {
    return {}
  }
}

function writeDays(days: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days))
  } catch {
    // The mark still applies until the page closes.
  }
}

export function fruitForDate(date = new Date()): Fruit {
  return FRUITS[localDayNumber(date) % FRUITS.length]
}

export function useGrow() {
  const [days, setDays] = useState(readDays)
  const today = localDateStamp()
  const fruit = fruitForDate()
  const practiced = days[today] === fruit.id

  const toggleToday = useCallback(() => {
    setDays((current) => {
      const next = { ...current }
      if (next[today] === fruit.id) delete next[today]
      else next[today] = fruit.id
      writeDays(next)
      return next
    })
  }, [fruit.id, today])

  return { fruit, practiced, toggleToday }
}
