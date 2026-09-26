import { useCallback, useMemo, useState } from 'react'
import { planForPace, PLAN_PACES, type PlanDay, type PlanPace } from '../scripture/readingPlan'
import { versionById } from '../scripture/versions'

const STORAGE_KEY = 'fruit-of-the-spirit.reading-plan'

export type StoredPlan = {
  pace: PlanPace
  versionId: string
  edition: 'protestant66'
  startedOn: string
  completed: number[]
}

function localDateStamp(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function isPace(value: unknown): value is PlanPace {
  return typeof value === 'number' && (PLAN_PACES as readonly number[]).includes(value)
}

function readStoredPlan(): StoredPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredPlan>
    if (!isPace(parsed.pace) || parsed.edition !== 'protestant66') return null
    if (!parsed.versionId || !versionById(parsed.versionId)) return null
    const completed = Array.isArray(parsed.completed)
      ? [...new Set(parsed.completed.filter((day) => typeof day === 'number' && day >= 1 && day <= parsed.pace!))].sort(
          (a, b) => a - b,
        )
      : []
    return {
      pace: parsed.pace,
      versionId: parsed.versionId,
      edition: 'protestant66',
      startedOn: typeof parsed.startedOn === 'string' ? parsed.startedOn : localDateStamp(),
      completed,
    }
  } catch {
    return null
  }
}

function writeStoredPlan(plan: StoredPlan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
  } catch {
    // The plan still applies until the page closes.
  }
}

export function useReadingPlan() {
  const [plan, setPlan] = useState<StoredPlan | null>(readStoredPlan)

  const saveOptions = useCallback((pace: PlanPace, versionId: string) => {
    if (!versionById(versionId)) return
    setPlan((current) => {
      const reset = !current || current.pace !== pace
      const next: StoredPlan = {
        pace,
        versionId,
        edition: 'protestant66',
        startedOn: reset ? localDateStamp() : current.startedOn,
        completed: reset ? [] : current.completed.filter((day) => day >= 1 && day <= pace),
      }
      writeStoredPlan(next)
      return next
    })
  }, [])

  const toggleDay = useCallback((day: number) => {
    setPlan((current) => {
      if (!current || day < 1 || day > current.pace) return current
      const completed = current.completed.includes(day)
        ? current.completed.filter((item) => item !== day)
        : [...current.completed, day].sort((a, b) => a - b)
      const next = { ...current, completed }
      writeStoredPlan(next)
      return next
    })
  }, [])

  const days = useMemo(() => (plan ? planForPace(plan.pace) : []), [plan])
  const completedCount = plan?.completed.length ?? 0
  const currentDay: PlanDay | null = plan
    ? (days.find((day) => !plan.completed.includes(day.day)) ?? null)
    : null

  return { plan, days, completedCount, currentDay, saveOptions, toggleDay }
}
