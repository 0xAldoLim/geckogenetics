import { traits, genotypeLabel } from './traits'
import type { GeneticState, Genotype, Pairing, Trait } from './traits'
import { Rational, one, zero, sum } from './probability'
import { morphs } from '../data/morphs'
export type Distribution = [Rational, Rational, Rational]
export function distribution(state: GeneticState): Distribution | null {
  if (state.kind === 'unknown') return null
  if (state.kind === 'known')
    return [0, 1, 2].map((i) =>
      i === state.copies ? one : zero,
    ) as Distribution
  if (
    !Number.isSafeInteger(state.n) ||
    !Number.isSafeInteger(state.d) ||
    state.d <= 0 ||
    state.n < 0 ||
    state.n > state.d
  )
    throw new Error('Invalid carrier probability')
  return [
    new Rational(state.d - state.n, state.d),
    new Rational(state.n, state.d),
    zero,
  ]
}
export function gametes(d: Distribution): [Rational, Rational] {
  const halfHet = d[1].mul(new Rational(1, 2))
  return [d[0].add(halfHet), d[2].add(halfHet)]
}
export function cross(a: GeneticState, b: GeneticState): Distribution | null {
  const ad = distribution(a),
    bd = distribution(b)
  if (!ad || !bd) return null
  const [a0, a1] = gametes(ad),
    [b0, b1] = gametes(bd)
  return [a0.mul(b0), a0.mul(b1).add(a1.mul(b0)), a1.mul(b1)]
}
export function nonVisualCarrier(d: Distribution): Rational | null {
  const nonVisual = d[0].add(d[1])
  return nonVisual.n === 0n ? null : d[1].div(nonVisual)
}
export interface Outcome {
  genotypes: Record<string, Genotype>
  probability: Rational
}
export interface LocusResult {
  trait: Trait
  distribution: Distribution
}
export interface Prediction {
  outcomes: Outcome[]
  loci: LocusResult[]
  unknown: Trait[]
  possible: string[]
  blocked: boolean
}
export function calculate(pair: Pairing): Prediction {
  const loci: LocusResult[] = [],
    unknown: Trait[] = [],
    possible: string[] = []
  const blocked = [
    ...pair.sire.labels,
    ...pair.dam.labels,
    pair.sire.morph,
    pair.dam.morph,
  ].some(
    (s) =>
      morphs.some(
        (m) => m.risk && s.toLowerCase().includes(m.name.toLowerCase()),
      ) || /lemon frost|enigma/i.test(s),
  )
  for (const trait of traits) {
    const a = pair.sire.loci[trait.id] ?? { kind: 'unknown' },
      b = pair.dam.loci[trait.id] ?? { kind: 'unknown' }
    if (a.kind === 'unknown' && b.kind === 'unknown') continue
    const d = cross(a, b)
    if (!d) unknown.push(trait)
    else loci.push({ trait, distribution: d })
    if (a.kind === 'possible' || b.kind === 'possible')
      possible.push(trait.name)
  }
  let outcomes: Outcome[] =
    loci.length && !blocked ? [{ genotypes: {}, probability: one }] : []
  for (const { trait, distribution: d } of loci)
    outcomes = outcomes.flatMap((o) =>
      d.flatMap((p, g) =>
        p.n
          ? [
              {
                genotypes: { ...o.genotypes, [trait.id]: g as Genotype },
                probability: o.probability.mul(p),
              },
            ]
          : [],
      ),
    )
  return { outcomes, loci, unknown, possible, blocked }
}
export function phenotype(outcome: Outcome): string {
  const expressed = traits
    .filter(
      (t) =>
        outcome.genotypes[t.id] !== undefined &&
        (t.inheritance === 'recessive'
          ? outcome.genotypes[t.id] === 2
          : outcome.genotypes[t.id] > 0),
    )
    .map((t) => t.visual[outcome.genotypes[t.id]])
  return expressed.join(' + ') || 'Normal at modeled loci'
}
export function genotypeTitle(o: Outcome): string {
  const expressed = phenotype(o)
  const hets = traits
    .filter((t) => t.inheritance === 'recessive' && o.genotypes[t.id] === 1)
    .map((t) => t.name)
  return hets.length ? `${expressed} · het ${hets.join(' & ')}` : expressed
}
export interface Group {
  title: string
  probability: Rational
  outcomes: Outcome[]
}
export function groupOutcomes(
  outcomes: Outcome[],
  view: 'phenotype' | 'genotype',
): Group[] {
  const groups = new Map<string, Group>()
  for (const o of outcomes) {
    const key =
      view === 'phenotype'
        ? phenotype(o)
        : traits
            .filter((t) => t.id in o.genotypes)
            .map((t) => `${t.id}:${o.genotypes[t.id]}`)
            .join('|')
    const existing = groups.get(key)
    if (existing) {
      existing.probability = existing.probability.add(o.probability)
      existing.outcomes.push(o)
    } else
      groups.set(key, {
        title: view === 'phenotype' ? phenotype(o) : genotypeTitle(o),
        probability: o.probability,
        outcomes: [o],
      })
  }
  return [...groups.values()]
}
export function carrierInGroup(group: Group, traitId: string): Rational {
  return sum(
    group.outcomes
      .filter((o) => o.genotypes[traitId] === 1)
      .map((o) => o.probability),
  ).div(group.probability)
}
export function genotypeText(o: Outcome) {
  return traits
    .filter((t) => t.id in o.genotypes)
    .map((t) => `${t.name}: ${genotypeLabel(t, o.genotypes[t.id])}`)
    .join(' · ')
}
