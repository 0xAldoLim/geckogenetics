import { morphs, type Morph } from '../data/morphs'
import {
  known,
  traitById,
  type Parent,
  type GeneticState,
  type Genotype,
} from './traits'

export interface Proposal {
  label: string
  morph?: Morph
  alternatives?: Morph[]
  token?: string
  het?: 'known' | 'possible'
  chance?: number
  needsChoice?: boolean
  uncertain?: boolean
  referenceOnly?: boolean
}
export interface ParseResult {
  proposals: Proposal[]
  unresolved: string[]
  warnings: string[]
}
export type LabelChoices = Record<string, string>
/** Only documented word forms and explicit abbreviations; no fuzzy allele guessing. */
export function normalizeMorphInput(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/\bblack\s*ngiht\b/gi, 'Black Night')
    .replace(/\b(?:phet|posshet|poshet|possiblehet)\b/gi, 'ph')
    .replace(/\bpht(?=\s+(?:MP|Eclipse|Ecl|Raptor|Blizzard|Bell)\b)/gi, 'ph')
    .replace(/\bphT\b/gi, 'ph T')
    .replace(/\b(POSS|POS)(?=(?:MS|SS|MSBN|WY|GIANT|SNOW)\b)/gi, '$1 ')
    .replace(
      /\b(PH|HET|H)(?=(?:TREMPER|MP|ECLIPSE|ECL|RAPTOR|BELL|BLIZZARD|RW)\b)/gi,
      '$1 ',
    )
    .replace(/\b(MSLF|MS|MST|BS)(?=TREMPER|TANGERINE|ENIGMA|BELL)/gi, '$1 ')
    .replace(/(TANGERINE|TREMPER|BELL)(?=TREMPER|ENIGMA)/gi, '$1 ')
}
const find = (name: string) => morphs.find((m) => m.name === name)!
const allRecessive = (m: Morph) =>
  Object.keys(m.loci ?? {}).length > 0 &&
  Object.keys(m.loci!).every((id) => traitById[id]?.inheritance === 'recessive')
const validChance = (n: number) =>
  n >= 0 && n <= 100 && (String(n).split('.')[1]?.length ?? 0) <= 4
const snowChoice = (
  copies: Genotype,
  raptor: boolean,
  blackNight: boolean,
): Morph => ({
  name: `${copies === 2 ? 'Super Snow' : 'Mack Snow'} ${raptor ? 'RAPTOR' : 'Rainwater'}${blackNight ? ' Black Night' : ''}`,
  aliases: [],
  loci: {
    snow: copies,
    ...(raptor ? { tremper: 2, eclipse: 2 } : { rainwater: 2 }),
  },
  lineage: blackNight ? ['Black Night'] : [],
  note: 'Explicitly selected interpretation of ambiguous breeder shorthand.',
})
let candidates: { rx: RegExp; morph: Morph; length: number }[] | undefined
function aliases() {
  return (candidates ??= morphs
    .flatMap((morph) =>
      [morph.name, ...morph.aliases].map((alias) => ({
        morph,
        length: alias.length,
        rx: new RegExp(
          `^${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')}(?=$|[^\\p{L}\\p{N}])`,
          'iu',
        ),
      })),
    )
    .sort((a, b) => b.length - a.length))
}

/** Expansions remain proposals until the user confirms; qualifiers are read in source order. */
export function parseShorthand(input: string): ParseResult {
  const warnings = /\b(?:oreo|zulu|african\s+fat|aft)\b/i.test(input)
    ? [
        'Oreo/Zulu and African fat-tailed gecko labels belong to another species. They cannot use the leopard gecko genetics model.',
      ]
    : []
  let remaining = normalizeMorphInput(input)
    .replace(/\((?:unsex\s*)?(?:poss\s*)?(?:male|female|unsex)[^)]*\)/gi, ' ')
    .replace(/\b(?:HYP|WB)\d+\b[\s\S]*$/i, ' ')
    .replace(/\b(?:double|triple)\s+(?=het\b)/gi, '')
    .replace(/\b(possible\s+het|het|ph|h)\s*\.\s*/gi, '$1 ')
    .trim()
  const proposals: Proposal[] = [],
    unresolved: string[] = []
  let mode: 'known' | 'possible' | undefined, chance: number | undefined
  let uncertain = false,
    line = false,
    explicit = false
  while (remaining) {
    const separator = remaining.match(/^[\s,;+&/():\-]+/)
    if (separator) {
      if (separator[0].includes(')')) line = false
      remaining = remaining.slice(separator[0].length)
      continue
    }
    const modifier = remaining.match(
      /^(?:(\d+(?:\.\d+)?)%?\s+)?(possible\s+het|ph|het|h|poss\.?|pos\.?|p|possible)\b\s*(?:(\d+(?:\.\d+)?)%\s*)?/i,
    )
    if (modifier) {
      line = false
      uncertain = /^(poss\.?|pos\.?|p|possible)$/i.test(modifier[2])
      mode = uncertain
        ? undefined
        : /ph|possible/i.test(modifier[2])
          ? 'possible'
          : 'known'
      chance =
        modifier[1] || modifier[3]
          ? Number(modifier[1] ?? modifier[3])
          : undefined
      explicit = true
      remaining = remaining.slice(modifier[0].length)
      continue
    }
    const connector = remaining.match(
      /^(line|bloodline|cross|cros|outcross|and|x|f\d+|proven)\b/i,
    )
    if (connector) {
      if (/^line|bloodline$/i.test(connector[1])) line = true
      remaining = remaining.slice(connector[0].length)
      continue
    }
    const ambiguous = remaining.match(
      /^(SSRBN|MSRBN|SSR|MSR|HT|T|R)(?=$|[^\p{L}\p{N}])/iu,
    )
    let morph: Morph | undefined,
      alternatives: Morph[] | undefined,
      token: string | undefined,
      consumed = 0
    if (ambiguous) {
      token = ambiguous[1].toUpperCase()
      consumed = ambiguous[0].length
      alternatives =
        token === 'HT'
          ? [
              {
                name: 'Hypo Tangerine',
                aliases: [],
                lineage: ['Hypo', 'Tangerine'],
                note: 'Explicit interpretation of HT as Hypo Tangerine.',
              },
              {
                name: 'Het Tremper Albino',
                aliases: [],
                loci: { tremper: 1 },
                note: 'Explicit interpretation of HT as a Tremper carrier.',
              },
            ]
          : token === 'T'
            ? [find('Tremper Albino'), find('Tangerine')]
            : token === 'R'
              ? [find('Rainwater Albino'), find('RAPTOR')]
              : [
                  snowChoice(
                    token.startsWith('SS') ? 2 : 1,
                    true,
                    token.endsWith('BN'),
                  ),
                  snowChoice(
                    token.startsWith('SS') ? 2 : 1,
                    false,
                    token.endsWith('BN'),
                  ),
                ]
      unresolved.push(token)
    } else {
      const candidate = aliases().find((c) => c.rx.test(remaining))
      if (candidate) {
        morph = candidate.morph
        consumed = remaining.match(candidate.rx)![0].length
      }
    }
    if (!consumed) {
      const word =
        remaining.match(/^\S+?(?=[\s,;+&/()]|$)/)?.[0] ?? remaining[0]
      unresolved.push(word)
      remaining = remaining.slice(word.length)
      continue
    }
    const after = remaining.slice(consumed)
    const referenceOnly =
      line || Boolean(morph?.loci && /^\s+(?:line|bloodline)\b/i.test(after))
    let het = referenceOnly ? undefined : mode
    if (morph && het && !allRecessive(morph) && !explicit) {
      het = undefined
      mode = undefined
    }
    const possible = het === 'possible'
    const needsChoice = Boolean(
      alternatives ||
        uncertain ||
        morph?.dosage ||
        (possible &&
          (chance === undefined ||
            !validChance(chance) ||
            Object.keys(morph?.loci ?? {}).length > 1)),
    )
    proposals.push({
      label: `${referenceOnly ? 'Lineage only: ' : uncertain ? 'Possible visual: ' : possible ? `${chance ?? '?'}% possible het ` : het ? 'Het ' : ''}${morph?.name ?? token}`,
      morph,
      alternatives,
      token,
      het,
      chance,
      uncertain,
      referenceOnly,
      needsChoice,
    })
    remaining = after
    uncertain = false
    line = false
    explicit = false
  }
  return { proposals, unresolved: [...new Set(unresolved)], warnings }
}

export function chosenMorph(
  p: Proposal,
  i: number,
  choices: LabelChoices,
): Morph | undefined {
  return (
    p.alternatives?.find((m) => m.name === choices[`${i}:morph`]) ?? p.morph
  )
}
export function reviewLoci(p: Proposal, m: Morph): string[] {
  return [
    ...new Set([
      ...(p.uncertain || p.het === 'possible' ? Object.keys(m.loci ?? {}) : []),
      ...(m.dosage ? [m.dosage] : []),
    ]),
  ]
}
export function confirmedLoci(
  proposals: Proposal[],
  choices: LabelChoices,
): Set<string> {
  return new Set(
    proposals.flatMap((p, i) =>
      !p.uncertain && !p.referenceOnly && p.het !== 'possible'
        ? Object.keys(chosenMorph(p, i, choices)?.loci ?? {})
        : [],
    ),
  )
}
function probability(value: string | undefined, p: Proposal): GeneticState {
  if (value === 'unknown') return { kind: 'unknown' }
  if (value === 'het') return known(1)
  if (value === 'none') return known(0)
  if (value?.includes('/')) {
    const [n, d] = value.split('/').map(Number)
    if (
      Number.isSafeInteger(n) &&
      Number.isSafeInteger(d) &&
      d > 0 &&
      n >= 0 &&
      n <= d
    )
      return { kind: 'possible', n, d }
    throw new Error('Invalid possible-het probability.')
  }
  if (p.chance !== undefined && validChance(p.chance))
    return { kind: 'possible', n: Math.round(p.chance * 10000), d: 1000000 }
  return { kind: 'unknown' }
}

/** A single resolver powers both the UI and the marketplace compatibility audit. */
export function parentFromLabel(
  parent: Parent,
  input: string,
  choices: LabelChoices = {},
  adding = false,
): Parent {
  const parsed = parseShorthand(input)
  if (parsed.warnings.length) throw new Error(parsed.warnings.join(' '))
  const preserve = adding || parsed.proposals.length === 0
  const next: Parent = {
    ...parent,
    loci: preserve ? { ...parent.loci } : {},
    lineage: preserve ? [...parent.lineage] : [],
    labels: preserve ? [...parent.labels] : [],
  }
  const names: string[] = adding ? [parent.morph] : []
  const resolved = parsed.proposals.map((p, i) => {
    const morph = chosenMorph(p, i, choices)
    if (!morph)
      throw new Error(`Choose what ${p.token} means before confirming.`)
    return { p, i, morph }
  })
  const explicitVisual = new Set(
    resolved
      .filter(({ p }) => !p.het && !p.uncertain && !p.referenceOnly)
      .flatMap(({ morph }) =>
        Object.entries(morph.loci ?? {})
          .filter(([, copies]) => copies === 2)
          .map(([id]) => id),
      ),
  )
  const assignments = new Map<string, string>()
  const established = confirmedLoci(parsed.proposals, choices)
  function assign(id: string, state: GeneticState) {
    const value = JSON.stringify(state)
    if (assignments.has(id) && assignments.get(id) !== value)
      throw new Error(
        `Conflicting entries for ${traitById[id].name}. Review the visible and carrier selections.`,
      )
    assignments.set(id, value)
    next.loci[id] = state
  }
  for (const { p, i, morph } of resolved) {
    const ids = Object.keys(morph.loci ?? {})
    if (p.het && !allRecessive(morph)) {
      if (!morph.loci && !morph.lineage && !morph.dosage && !morph.risk) {
        next.labels.push(`${p.label}: full trait meaning unconfirmed`)
        if (morph.ambiguous)
          for (const id of ['tremper', 'bell', 'rainwater'])
            if (!explicitVisual.has(id)) next.loci[id] = { kind: 'unknown' }
        continue
      }
      throw new Error(
        `${morph.name} cannot be treated as a recessive het. Record its line or visual trait instead.`,
      )
    }
    if (p.referenceOnly) {
      next.labels.push(`${morph.name} lineage; genotype unknown`)
      for (const id of ids)
        if (!explicitVisual.has(id) && !next.loci[id])
          next.loci[id] = { kind: 'unknown' }
      continue
    }
    if (p.het === 'possible' && ids.length > 1)
      next.labels.push(
        `Compound possible het ${morph.name}: component probabilities and their relationship require breeder records`,
      )
    for (const [id, copies] of Object.entries(morph.loci ?? {})) {
      if ((p.het || p.uncertain) && ids.length > 1 && explicitVisual.has(id))
        continue
      if (p.het === 'possible' && ids.length > 1 && established.has(id))
        continue
      let state: GeneticState
      if (p.uncertain) {
        const value = choices[`${i}:${id}`] ?? 'unknown'
        state = ['0', '1', '2'].includes(value)
          ? known(Number(value) as Genotype)
          : { kind: 'unknown' }
      } else if (p.het === 'known') state = known(1)
      else if (p.het === 'possible') {
        state = probability(
          choices[`${i}:${id}`],
          ids.length > 1 ? { ...p, chance: undefined } : p,
        )
        if (
          ids.filter((component) => !established.has(component)).length > 1 &&
          state.kind === 'possible' &&
          choices[`${i}:independent`] !== 'yes'
        )
          throw new Error(
            'Confirm the independent component-het scenario, or keep compound possible hets unknown.',
          )
      } else state = known(copies)
      assign(id, state)
      if (state.kind === 'unknown')
        next.labels.push(
          `${p.het ? 'Possible het' : 'Possible visual'} ${traitById[id].name}: unresolved`,
        )
    }
    if (morph.dosage) {
      const value = choices[`${i}:${morph.dosage}`] ?? 'unknown'
      assign(
        morph.dosage,
        ['0', '1', '2'].includes(value)
          ? known(Number(value) as Genotype)
          : { kind: 'unknown' },
      )
    }
    if (
      !p.het &&
      (!p.uncertain ||
        [...ids, ...(morph.dosage ? [morph.dosage] : [])].some((id) => {
          const state = next.loci[id]
          return state?.kind === 'known' && state.copies > 0
        }))
    )
      names.push(morph.name)
    if (!p.het)
      next.lineage = [...new Set([...next.lineage, ...(morph.lineage ?? [])])]
    if (morph.risk || morph.ambiguous || (!morph.loci && !morph.lineage))
      next.labels.push(morph.name)
  }
  const ambiguousTokens = new Set(
    parsed.proposals.flatMap((p) => (p.token ? [p.token] : [])),
  )
  next.labels = [
    ...new Set([
      ...next.labels,
      ...parsed.unresolved.filter((s) => !ambiguousTokens.has(s)),
    ]),
  ]
    .map((s) => s.slice(0, 150))
    .slice(0, 30)
  next.morph =
    [...new Set(names)].join(' + ').slice(0, 200) ||
    (parsed.proposals.length ? 'Normal / Wild Type' : input.slice(0, 200))
  return next
}
