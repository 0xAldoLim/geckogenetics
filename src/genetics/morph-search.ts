import { morphs } from '../data/morphs'
import sourceLabels from '../data/faunary-labels.json'
import { blankParent } from './traits'
import { normalizeMorphInput, parentFromLabel, parseShorthand } from './parser'

const searchKey = (text: string) =>
  normalizeMorphInput(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%]+/gu, ' ')
    .trim()
const compactKey = (text: string) => searchKey(text).replaceAll(' ', '')
const knownNames = new Set(
  morphs.flatMap((m) => [m.name, ...m.aliases]).map(compactKey),
)
export const faunaryLabels = sourceLabels
export function matchesMorphQuery(label: string, query: string): boolean {
  const target = searchKey(label)
  return searchKey(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => target.includes(word))
}
export function searchMorphs(query: string) {
  return morphs
    .filter((m) =>
      [m.name, ...m.aliases].some((name) => matchesMorphQuery(name, query)),
    )
    .sort(
      (a, b) =>
        Number(compactKey(b.name) === compactKey(query)) -
        Number(compactKey(a.name) === compactKey(query)),
    )
    .slice(0, 8)
}
export function searchFaunaryLabels(query: string) {
  if (searchKey(query).length < 2) return []
  return sourceLabels
    .filter(
      (label) =>
        !knownNames.has(compactKey(label)) && matchesMorphQuery(label, query),
    )
    .sort(
      (a, b) =>
        Number(compactKey(b) === compactKey(query)) -
          Number(compactKey(a) === compactKey(query)) || a.length - b.length,
    )
    .slice(0, 5)
}
export function canApplyLabel(input: string): boolean {
  const p = parseShorthand(input)
  if (
    !p.proposals.length ||
    p.warnings.length ||
    p.unresolved.length ||
    p.proposals.some(
      (t) =>
        t.alternatives ||
        t.needsChoice ||
        t.morph?.ambiguous ||
        t.morph?.category === 'unverified',
    )
  )
    return false
  try {
    parentFromLabel(blankParent(), input)
    return true
  } catch {
    return false
  }
}
export function quickCombination(input: string): string | null {
  if (knownNames.has(compactKey(input)) || !canApplyLabel(input)) return null
  const parsed = parseShorthand(input)
  if (parsed.proposals.length < 2 && !parsed.proposals.some((p) => p.het))
    return null
  const parent = parentFromLabel(blankParent(), input)
  const hets = parsed.proposals.filter((p) => p.het).map((p) => p.label)
  return [parent.morph === 'Normal / Wild Type' ? '' : parent.morph, ...hets]
    .filter(Boolean)
    .join(' · ')
}
