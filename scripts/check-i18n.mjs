import ts from 'typescript'
import { readFileSync } from 'node:fs'
import { greetingDiffersFromBlessing, messages } from '../src/i18n/messages.ts'

const source = readFileSync(new URL('../src/i18n/messages.ts', import.meta.url), 'utf8')
const file = ts.createSourceFile('messages.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

function literalOf(node) {
  let current = node
  while (current && (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isParenthesizedExpression(current))) {
    current = current.expression
  }
  return current && ts.isObjectLiteralExpression(current) ? current : null
}

function objectNames(name) {
  let found = null
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) {
      const literal = literalOf(node.initializer)
      if (literal) {
        found = literal.properties.flatMap((property) => {
          if (!ts.isPropertyAssignment(property)) return []
          if (ts.isIdentifier(property.name)) return [property.name.text]
          if (ts.isStringLiteral(property.name)) return [property.name.text]
          return []
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  if (!found) throw new Error(`Missing message object ${name}`)
  return found
}

function duplicates(names) {
  const seen = new Set()
  const dupes = []
  for (const name of names) {
    if (seen.has(name)) dupes.push(name)
    seen.add(name)
  }
  return dupes
}

const en = objectNames('en')
const es = objectNames('es')
const pt = objectNames('pt')

for (const [label, names] of [
  ['en', en],
  ['es', es],
  ['pt', pt],
]) {
  const dupes = duplicates(names)
  if (dupes.length) throw new Error(`Duplicate i18n keys in ${label}: ${dupes.join(', ')}`)
}

function sameKeys(left, right, label) {
  if (left.length !== right.length || left.some((key, index) => key !== right[index])) {
    const missing = left.filter((key) => !right.includes(key))
    const extra = right.filter((key) => !left.includes(key))
    throw new Error(`${label} keys differ. Missing: ${missing.join(', ') || '—'}. Extra: ${extra.join(', ') || '—'}.`)
  }
}

sameKeys(en, es, 'es')
sameKeys(en, pt, 'pt')

for (const language of ['en', 'es', 'pt']) {
  if (!greetingDiffersFromBlessing(language)) {
    throw new Error(`${language} greeting repeats the blessing`)
  }
  if (messages[language].brandName !== 'Fruit of the Spirit') {
    throw new Error(`${language} brandName changed`)
  }
  if (messages[language].designedBy !== 'Designed by Freddy Jara-Almonte') {
    throw new Error(`${language} designedBy changed`)
  }
  if (messages[language].designedBy === messages[language].brandName) {
    throw new Error(`${language} credit repeats the title`)
  }
  if (messages[language].greetingBlessing === messages[language].tagline) {
    throw new Error(`${language} blessing repeats the tagline`)
  }
}

const runtimeKeys = Object.keys(messages.en)
if (runtimeKeys.length !== en.length) {
  throw new Error('Runtime message keys collapsed a duplicate')
}

console.log(`i18n ok: ${en.length} keys, en/es/pt, greetings distinct from blessings`)
