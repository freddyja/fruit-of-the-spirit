import { useRef, useState } from 'react'
import type { Language } from '../i18n/messages'
import type { PassageRef } from '../scripture/passages'

type Status = 'idle' | 'playing' | 'paused'

export type SpokenLine = {
  passage: PassageRef
  text: string
}

function speechLang(language: Language): string {
  if (language === 'es') return 'es-ES'
  if (language === 'pt') return 'pt-BR'
  return 'en-US'
}

export function useListen(language: Language) {
  const [status, setStatus] = useState<Status>('idle')
  const [passage, setPassage] = useState<PassageRef | null>(null)
  const generation = useRef(0)
  const queue = useRef<SpokenLine[]>([])
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  function stop() {
    generation.current += 1
    queue.current = []
    window.speechSynthesis?.cancel()
    setStatus('idle')
    setPassage(null)
  }

  function speakNext(gen: number) {
    if (generation.current !== gen) return
    const item = queue.current.shift()
    if (!item) {
      setStatus('idle')
      setPassage(null)
      return
    }
    const utterance = new SpeechSynthesisUtterance(item.text)
    utterance.lang = speechLang(language)
    utterance.onend = () => speakNext(gen)
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') return
      speakNext(gen)
    }
    setPassage(item.passage)
    setStatus('playing')
    window.speechSynthesis.speak(utterance)
  }

  function start(lines: readonly SpokenLine[]) {
    generation.current += 1
    window.speechSynthesis?.cancel()
    const gen = generation.current
    queue.current = lines.filter((line) => line.text.trim())
    if (!queue.current.length || !supported) {
      setStatus('idle')
      setPassage(null)
      return
    }
    speakNext(gen)
  }

  function pause() {
    if (status !== 'playing') return
    window.speechSynthesis?.pause()
    setStatus('paused')
  }

  function resume() {
    if (status !== 'paused') return
    window.speechSynthesis?.resume()
    setStatus('playing')
  }

  return { supported, status, passage, start, stop, pause, resume }
}

export type ListenController = ReturnType<typeof useListen>
