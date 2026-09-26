import type { FruitId } from './fruits'
import { FRUITS } from './fruits'
import { BOOKS } from './books'
import type { PassageRef } from './passages'

export type LexiconWord = {
  strong: string
  lemma: string
  transliteration: string
  gloss: string
  language: 'greek' | 'hebrew'
}

export type StudyLayers = {
  meaning: string | null
  lexicon: readonly LexiconWord[]
  context: string | null
  thenNote: string | null
  today: string | null
}

const galFruitMeaning =
  'Paul names one fruit. Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control grow together.'

const NOTES: Record<string, StudyLayers> = {
  'gal:5:22': {
    meaning: galFruitMeaning,
    lexicon: [
      { strong: 'G2590', lemma: 'καρπός', transliteration: 'karpos', gloss: 'fruit', language: 'greek' },
      { strong: 'G4151', lemma: 'πνεῦμα', transliteration: 'pneuma', gloss: 'Spirit', language: 'greek' },
      { strong: 'G26', lemma: 'ἀγάπη', transliteration: 'agapē', gloss: 'love', language: 'greek' },
      { strong: 'G5479', lemma: 'χαρά', transliteration: 'chara', gloss: 'joy', language: 'greek' },
      { strong: 'G1515', lemma: 'εἰρήνη', transliteration: 'eirēnē', gloss: 'peace', language: 'greek' },
      { strong: 'G3115', lemma: 'μακροθυμία', transliteration: 'makrothymia', gloss: 'patience', language: 'greek' },
      { strong: 'G5544', lemma: 'χρηστότης', transliteration: 'chrēstotēs', gloss: 'kindness', language: 'greek' },
      { strong: 'G19', lemma: 'ἀγαθωσύνη', transliteration: 'agathōsynē', gloss: 'goodness', language: 'greek' },
      { strong: 'G4102', lemma: 'πίστις', transliteration: 'pistis', gloss: 'faithfulness', language: 'greek' },
    ],
    context: 'This list follows the warning not to use freedom as a chance for the flesh. The contrast is a life led by the Spirit.',
    thenNote: 'The churches in Galatia were being pressed to add circumcision to faith in Christ.',
    today: 'Treat the list as one fruit to notice, not nine scores to keep.',
  },
  'gal:5:23': {
    meaning: 'Gentleness and self-control finish the list. Paul says no law stands against this fruit.',
    lexicon: [
      { strong: 'G4236', lemma: 'πραΰτης', transliteration: 'prautēs', gloss: 'gentleness', language: 'greek' },
      { strong: 'G1466', lemma: 'ἐγκράτεια', transliteration: 'enkrateia', gloss: 'self-control', language: 'greek' },
    ],
    context: 'Verse 23 completes 5:22. The two verses are one sentence in the letter.',
    thenNote: 'The churches in Galatia were being pressed to add circumcision to faith in Christ.',
    today: 'Pick gentleness or self-control for the next conversation, not both at once.',
  },
  'gal:5:16': {
    meaning: 'Walk by the Spirit is the instruction that the fruit list then describes.',
    lexicon: [],
    context: 'The sentence sits just before the works of the flesh and the fruit of the Spirit.',
    thenNote: 'The churches in Galatia were being pressed to add circumcision to faith in Christ.',
    today: 'One step with the Spirit is enough for today.',
  },
  'gal:5:25': {
    meaning: 'If the Spirit is the source of life, the walk should match that life.',
    lexicon: [],
    context: 'This line comes right after the fruit list.',
    thenNote: 'The churches in Galatia were being pressed to add circumcision to faith in Christ.',
    today: 'Let today’s practice match the fruit you already named.',
  },
}

const FRUIT_LINE: Record<FruitId, string> = {
  love: 'Love is the first word of the fruit. It shows up again in the command to serve one another.',
  joy: 'Joy here is a settled gladness, named beside peace rather than beside circumstances.',
  peace: 'Peace is named with the fruit, and again where hearts are called to let it rule.',
  patience: 'Patience is the long-suffering in the list: slow toward people, not only toward plans.',
  kindness: 'Kindness is the gentle usefulness in the list, close to goodness but aimed at someone.',
  goodness: 'Goodness is the moral weight of the fruit: doing what is right, especially when it costs.',
  faithfulness: 'Faithfulness is the “faith” of this verse when the list is read as character, not only belief.',
  gentleness: 'Gentleness is the meekness of the next verse: strength that does not crush.',
  'self-control': 'Self-control is temperance: holding the self, not holding others.',
}

export function studyFor(passage: PassageRef): StudyLayers {
  const bookId = BOOKS[passage.bookIndex]?.id
  const key = bookId ? `${bookId}:${passage.chapter}:${passage.verse}` : ''
  const direct = NOTES[key]
  if (direct) return direct
  const fruit = FRUITS.find((item) =>
    item.refs.some((ref) => ref.bookId === bookId && ref.chapter === passage.chapter && ref.verse === passage.verse),
  )
  if (!fruit) {
    return { meaning: null, lexicon: [], context: null, thenNote: null, today: null }
  }
  return {
    meaning: FRUIT_LINE[fruit.id],
    lexicon: [],
    context: null,
    thenNote: bookId === 'gal' ? NOTES['gal:5:22'].thenNote : null,
    today: null,
  }
}
