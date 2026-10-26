import { describe, expect, it } from 'vitest'
import { blankParent, known, lineTraits, traits } from '../genetics/traits'
import type { GeneticState, Pairing } from '../genetics/traits'
import {
  calculate,
  cross,
  groupOutcomes,
  carrierInGroup,
  nonVisualCarrier,
} from '../genetics/inference'
import { Rational, roundedPercentages, sum } from '../genetics/probability'
import { applyMorph, morphs, preset } from '../data/morphs'
import { parseShorthand } from '../genetics/parser'
import { compareObservation } from '../genetics/observations'
import {
  pairingSchema,
  encodePairing,
  decodePairing,
  savedSchema,
} from '../lib/storage'
const exact = (a: GeneticState, b: GeneticState) =>
  cross(a, b)?.map((p) => p.exact)
const pairing = (
  a: Record<string, GeneticState>,
  b: Record<string, GeneticState>,
): Pairing => ({
  version: 1,
  sire: { ...blankParent(), loci: a },
  dam: { ...blankParent(), loci: b },
  observed: '',
})
describe('Exact Mendelian inheritance', () => {
  it('visual × visual = all visual', () =>
    expect(exact(known(2), known(2))).toEqual(['0/1', '0/1', '1/1']))
  it('visual × het = half visual, half het', () =>
    expect(exact(known(2), known(1))).toEqual(['0/1', '1/2', '1/2']))
  it('het × het = 1:2:1', () =>
    expect(exact(known(1), known(1))).toEqual(['1/4', '1/2', '1/4']))
  it('non-visual het × het gives exact 2/3 possible het', () =>
    expect(nonVisualCarrier(cross(known(1), known(1))!)?.exact).toBe('2/3'))
  it('no non-visual individuals yields no conditional probability', () =>
    expect(nonVisualCarrier(cross(known(2), known(2))!)).toBeNull())
  it('Mack Snow × normal = half Mack Snow', () =>
    expect(exact(known(1), known(0))).toEqual(['1/2', '1/2', '0/1']))
  it('Mack Snow × Mack Snow = 25/50/25', () =>
    expect(
      calculate(preset('snow')).outcomes.map((o) => o.probability.exact),
    ).toEqual(['1/4', '1/2', '1/4']))
  it('Super Snow × normal = all Mack Snow', () =>
    expect(exact(known(2), known(0))).toEqual(['0/1', '1/1', '0/1']))
  it('independent two-locus cross produces nine correct genotype probabilities', () => {
    const r = calculate(
      pairing(
        { tremper: known(1), eclipse: known(1) },
        { tremper: known(1), eclipse: known(1) },
      ),
    )
    expect(r.outcomes).toHaveLength(9)
    expect(
      r.outcomes.find(
        (o) => o.genotypes.tremper === 2 && o.genotypes.eclipse === 2,
      )?.probability.exact,
    ).toBe('1/16')
    expect(sum(r.outcomes.map((o) => o.probability)).exact).toBe('1/1')
  })
  it('reproduces all six Gecko Labs ttEe × TtEe genotypes', () => {
    const probabilities = Object.fromEntries(
      calculate(preset('labs')).outcomes.map((o) => [
        `${o.genotypes.tremper},${o.genotypes.eclipse}`,
        o.probability.exact,
      ]),
    )
    expect(probabilities).toEqual({
      '1,0': '1/8',
      '1,1': '1/4',
      '1,2': '1/8',
      '2,0': '1/8',
      '2,1': '1/4',
      '2,2': '1/8',
    })
  })
  it('possible hets marginalize over parent genotypes', () =>
    expect(
      exact({ kind: 'possible', n: 1, d: 2 }, { kind: 'possible', n: 2, d: 3 }),
    ).toEqual(['1/2', '5/12', '1/12']))
  it('literal 66% differs from an exact 2/3', () =>
    expect(exact({ kind: 'possible', n: 66, d: 100 }, known(2))).not.toEqual(
      exact({ kind: 'possible', n: 2, d: 3 }, known(2)),
    ))
  it('unknown remains unknown even when the other parent is visual', () => {
    expect(cross({ kind: 'unknown' }, known(2))).toBeNull()
    const r = calculate(pairing({ tremper: known(2) }, {}))
    expect(r.outcomes).toEqual([])
    expect(r.unknown.map((t) => t.id)).toEqual(['tremper'])
  })
  it('partial predictions exclude unresolved loci explicitly', () => {
    const r = calculate(
      pairing({ snow: known(1), tremper: known(2) }, { snow: known(1) }),
    )
    expect(r.outcomes).toHaveLength(3)
    expect(r.loci.map((l) => l.trait.id)).toEqual(['snow'])
    expect(r.unknown[0].id).toBe('tremper')
  })
  it('Sunglow A gives 100% het; B gives 50% het and 50% visual', () => {
    expect(
      calculate(preset('sunglow-a')).outcomes.map((o) => [
        o.genotypes.tremper,
        o.probability.exact,
      ]),
    ).toEqual([[1, '1/1']])
    expect(
      calculate(preset('sunglow-b')).outcomes.map((o) => [
        o.genotypes.tremper,
        o.probability.exact,
      ]),
    ).toEqual([
      [1, '1/2'],
      [2, '1/2'],
    ])
  })
  it('different albino strains do not become the same recessive', () => {
    const r = calculate(
      pairing(
        { tremper: known(2), bell: known(0) },
        { tremper: known(0), bell: known(2) },
      ),
    )
    expect(r.outcomes).toHaveLength(1)
    expect(r.outcomes[0].genotypes).toEqual({ tremper: 1, bell: 1 })
    expect(groupOutcomes(r.outcomes, 'phenotype')[0].title).toBe(
      'Normal at modeled loci',
    )
  })
  it('dominant groups retain distinct genotypes', () => {
    const r = calculate(pairing({ wy: known(1) }, { wy: known(1) }))
    const groups = groupOutcomes(r.outcomes, 'phenotype')
    expect(groups.map((g) => g.probability.exact)).toEqual(['1/4', '3/4'])
    expect(groups[1].outcomes).toHaveLength(2)
  })
  it('phenotype groups retain exact conditional carrier information', () => {
    const r = calculate(pairing({ tremper: known(1) }, { tremper: known(1) }))
    const g = groupOutcomes(r.outcomes, 'phenotype')
    expect(g).toHaveLength(2)
    expect(carrierInGroup(g[0], 'tremper').exact).toBe('2/3')
    expect(sum(g.map((v) => v.probability)).exact).toBe('1/1')
  })
  it('polygenic traits never enter allele enumeration', () => {
    const p = pairing({ snow: known(1) }, { snow: known(1) })
    p.sire.lineage = [...lineTraits]
    expect(calculate(p).outcomes.map((o) => Object.keys(o.genotypes))).toEqual([
      ['snow'],
      ['snow'],
      ['snow'],
    ])
  })
  it('withholds predictions for welfare morphs and their combination aliases', () => {
    for (const m of morphs.filter((m) => m.risk)) {
      const p = preset('snow')
      p.sire = applyMorph(p.sire, m)
      expect(calculate(p).blocked).toBe(true)
      expect(calculate(p).outcomes).toEqual([])
    }
  })
  it('preserves exact fractions with large denominators', () =>
    expect(
      new Rational(2, 3).mul(new Rational(2, 3)).add(new Rational(5, 9)).exact,
    ).toBe('1/1'))
  it('rounding an exhaustive distribution totals exactly 100%', () =>
    expect(
      roundedPercentages([
        new Rational(1, 3),
        new Rational(1, 3),
        new Rational(1, 3),
      ]),
    ).toEqual(['33.34%', '33.33%', '33.33%']))
  it('rejects invalid carrier probabilities', () =>
    expect(() => cross({ kind: 'possible', n: 4, d: 3 }, known(1))).toThrow())
})
describe('Exhaustive probability conservation and symmetry', () => {
  const states: GeneticState[] = [
    known(0),
    known(1),
    known(2),
    { kind: 'possible', n: 1, d: 2 },
    { kind: 'possible', n: 2, d: 3 },
    { kind: 'possible', n: 0, d: 1 },
    { kind: 'possible', n: 1, d: 1 },
  ]
  for (const a of states)
    for (const b of states)
      it(`${JSON.stringify(a)} × ${JSON.stringify(b)}`, () => {
        const d = cross(a, b)!
        expect(sum(d).exact).toBe('1/1')
        expect(d.every((p) => p.n >= 0n && p.n <= p.d)).toBe(true)
        expect(d.map((p) => p.exact)).toEqual(cross(b, a)!.map((p) => p.exact))
        for (const t of traits) {
          const r = calculate(pairing({ [t.id]: a }, { [t.id]: b }))
          expect(sum(r.outcomes.map((o) => o.probability)).exact).toBe('1/1')
        }
      })
  it('conserves probability across all eight loci', () => {
    const loci = Object.fromEntries(traits.map((t) => [t.id, known(1)]))
    const r = calculate(pairing(loci, loci))
    expect(r.outcomes).toHaveLength(6561)
    expect(sum(r.outcomes.map((o) => o.probability)).exact).toBe('1/1')
  })
})
describe('Aliases, imports, and observations', () => {
  it('does not accept possible-het states on dominant loci', () => {
    const p = preset('snow')
    p.sire.loci.wy = { kind: 'possible', n: 1, d: 2 }
    expect(pairingSchema.safeParse(p).success).toBe(false)
  })
  it('requires clarification beyond four decimal places in a supplied percentage', () => {
    expect(parseShorthand('66.66667% PH TA').proposals[0].needsChoice).toBe(
      true,
    )
    expect(parseShorthand('66.6667% PH TA').proposals[0].needsChoice).toBe(
      false,
    )
  })
  it('preserves ambiguous breeder examples without guessing', () => {
    for (const text of ['MSEBN H T', 'SP PH T', 'MSEBN PH T']) {
      const p = parseShorthand(text)
      expect(p.proposals).toEqual([])
      expect(p.unresolved).toContain('T')
    }
  })
  it('recognizes known abbreviations and associated H / PH', () => {
    expect(
      parseShorthand('MS H TA').proposals.map((p) => [p.morph?.name, p.het]),
    ).toEqual(
      expect.arrayContaining([
        ['Mack Snow', undefined],
        ['Tremper Albino', 'known'],
      ]),
    )
    const p = parseShorthand('50% PH TA')
    expect(p.proposals[0]).toMatchObject({
      het: 'possible',
      chance: 50,
      needsChoice: false,
    })
  })
  it('does not silently fill a missing possible-het probability', () =>
    expect(parseShorthand('PH TA').proposals[0].needsChoice).toBe(true))
  it('Sunglow never invents its albino strain', () => {
    const p = applyMorph(
      blankParent(),
      morphs.find((m) => m.name === 'Sunglow')!,
    )
    expect(p.loci).toEqual({})
    expect(p.lineage).toContain('Tangerine')
  })
  it('a visual normal label never proves all non-carrier genotypes', () =>
    expect(applyMorph(blankParent(), morphs[0]).loci).toEqual({}))
  it('shared pairing round-trips unicode, possible hets, lineage and evidence', () => {
    const p = preset('sunglow-b')
    p.sire.name = '橘子 🦎'
    p.dam.loci.tremper = { kind: 'possible', n: 2, d: 3 }
    expect(decodePairing(encodePairing(p))).toEqual(p)
  })
  it('rejects malformed, oversized and unsupported sharing data', () => {
    expect(() => decodePairing('bad!!')).toThrow()
    expect(() => decodePairing('a'.repeat(20001))).toThrow()
    expect(
      pairingSchema.safeParse({ ...preset('snow'), version: 2 }).success,
    ).toBe(false)
    const p = preset('snow')
    p.sire.loci.notAGene = known(1)
    expect(pairingSchema.safeParse(p).success).toBe(false)
  })
  it('rejects extra fields, arbitrary lineage and impossible possible hets', () => {
    const p = preset('snow')
    expect(pairingSchema.safeParse({ ...p, html: '<script>' }).success).toBe(
      false,
    )
    p.sire.loci.tremper = { kind: 'possible', n: 3, d: 2 }
    expect(pairingSchema.safeParse(p).success).toBe(false)
  })
  it('saved records round-trip and limit the count', () => {
    const s = { id: 'sample', title: 'Snow pair', pair: preset('snow') }
    expect(savedSchema.parse(JSON.parse(JSON.stringify([s])))).toEqual([s])
    expect(savedSchema.safeParse(Array(21).fill(s)).success).toBe(false)
  })
  it('compares recognized observations without modifying parent genotypes', () => {
    const p = preset('snow'),
      before = JSON.stringify(p)
    expect(compareObservation(p, 'Super Snow')).toContain('compatible')
    expect(compareObservation(p, 'MSEBN PH T')).toContain('inconclusive')
    expect(JSON.stringify(p)).toBe(before)
    expect(compareObservation(preset('sunglow-a'), 'Tremper Albino')).toContain(
      'inconsistent',
    )
  })
  it('all catalog modeled components refer to supported loci', () => {
    for (const m of morphs)
      for (const id of Object.keys(m.loci ?? {}))
        expect(traits.some((t) => t.id === id)).toBe(true)
    expect(new Set(morphs.map((m) => m.name)).size).toBe(morphs.length)
  })
})
