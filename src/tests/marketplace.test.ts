import { describe, it, expect } from 'vitest'
import audit from './fixtures/marketplace-listings.json'
import {
  parseShorthand,
  parentFromLabel,
  type LabelChoices,
} from '../genetics/parser'
import { blankParent, known, type Pairing } from '../genetics/traits'
import { calculate } from '../genetics/inference'
import { sum } from '../genetics/probability'

const animalRecords = audit.records.filter((r) => r.kind === 'leopard-gecko')
function scenario(label: string) {
  const parsed = parseShorthand(label),
    choices: LabelChoices = {}
  parsed.proposals.forEach((p, i) => {
    if (p.alternatives) choices[`${i}:morph`] = p.alternatives[0].name // Explicit test scenario, never a parser default.
    const m = p.alternatives?.[0] ?? p.morph
    if (m?.dosage && !p.uncertain) choices[`${i}:${m.dosage}`] = '1'
  })
  return parentFromLabel(blankParent(), label, choices)
}
describe('Actual marketplace listing coverage', () => {
  it('accounts for every opened product and every genetics card', () => {
    expect(audit.records).toHaveLength(223)
    expect(animalRecords).toHaveLength(186)
    expect(
      audit.records.filter((r) => r.kind === 'other-species'),
    ).toHaveLength(2)
    expect(audit.records.filter((r) => r.kind === 'non-animal')).toHaveLength(
      35,
    )
  })
  it('represents all 186 animal labels without inventing missing possible-het probabilities', () => {
    for (const r of animalRecords) {
      const parsed = parseShorthand(r.label!)
      if (parsed.proposals.some((p) => p.alternatives))
        expect(() => parentFromLabel(blankParent(), r.label!)).toThrow(/Choose/)
      const p = scenario(r.label!)
      expect(p.morph.length, r.id).toBeGreaterThan(0)
      expect(
        Object.values(p.loci).every((s) => s.kind !== 'possible' || s.n <= s.d),
        r.id,
      ).toBe(true)
    }
  })
  for (const record of animalRecords.filter((r) => 'sire' in r && r.sire))
    it(`recorded sire × dam: ${record.site} ${record.id}`, () => {
      const p: Pairing = {
        version: 1,
        assumeUnlisted: true,
        sire: scenario(record.sire!),
        dam: scenario(record.dam!),
        observed: '',
      }
      const result = calculate(p)
      if (result.blocked) expect(result.outcomes).toEqual([])
      else if (result.outcomes.length)
        expect(sum(result.outcomes.map((o) => o.probability)).exact).toBe('1/1')
      else
        expect(
          result.unknown.length +
            p.sire.lineage.length +
            p.dam.lineage.length +
            p.sire.labels.length +
            p.dam.labels.length,
        ).toBeGreaterThan(0)
    })
  it('rejects the two African fat-tailed records as leopard-gecko inputs', () => {
    for (const r of audit.records.filter((r) => r.kind === 'other-species'))
      expect(() => parentFromLabel(blankParent(), r.label!)).toThrow(
        /another species/,
      )
  })
  it('conserves probabilities for every advertised male × female listing scenario across both shops', () => {
    const males = animalRecords
      .filter((r) => r.sex === 'male')
      .map((r) => ({ record: r, parent: scenario(r.label!) }))
    const females = animalRecords
      .filter((r) => r.sex === 'female')
      .map((r) => ({ record: r, parent: scenario(r.label!) }))
    expect(males).toHaveLength(60)
    expect(females).toHaveLength(96)
    for (const sire of males)
      for (const dam of females) {
        const result = calculate({
          version: 1,
          assumeUnlisted: true,
          sire: sire.parent,
          dam: dam.parent,
          observed: '',
        })
        if (result.outcomes.length) {
          expect(
            sum(result.outcomes.map((o) => o.probability)).exact,
            `${sire.record.id} × ${dam.record.id}`,
          ).toBe('1/1')
          expect(
            result.outcomes.every(
              (o) =>
                o.probability.n >= 0n && o.probability.n <= o.probability.d,
            ),
          ).toBe(true)
        } else expect(result.blocked || result.loci.length === 0).toBe(true)
      }
  }, 30000)
})
describe('Breeder notation and uncertainty', () => {
  it('supports both Snow-code interpretations without adding unmentioned Black Night ancestry', () => {
    for (const token of ['MSR', 'SSR', 'MSRBN', 'SSRBN']) {
      const p = parseShorthand(token).proposals[0]
      for (const m of p.alternatives!) {
        const parent = parentFromLabel(blankParent(), token, {
          '0:morph': m.name,
        })
        expect(parent.loci.snow).toEqual(known(token.startsWith('SS') ? 2 : 1))
        expect(parent.lineage.includes('Black Night')).toBe(
          token.endsWith('BN'),
        )
        expect(
          parent.loci[m.name.includes('RAPTOR') ? 'tremper' : 'rainwater'],
        ).toEqual(known(2))
      }
    }
  })
  it('reads dotted hets, compact Snow names, and multiple confirmed hets', () => {
    const p = parentFromLabel(
      blankParent(),
      'SuperSnow Tremper BN h. MP h. Eclipse',
    )
    expect(p.loci).toMatchObject({
      snow: known(2),
      tremper: known(2),
      patternless: known(1),
      eclipse: known(1),
    })
    expect(p.lineage).toContain('Black Night')
    expect(parentFromLabel(blankParent(), 'SSE RW ph. MP').loci).toMatchObject({
      snow: known(2),
      eclipse: known(2),
      rainwater: known(2),
      patternless: { kind: 'unknown' },
    })
  })
  it('keeps h/ph scoped across a list, never promoting a carrier to visual', () => {
    const p = parentFromLabel(blankParent(), 'Choco ph. Ecl & MP')
    expect(p.loci).toMatchObject({
      eclipse: { kind: 'unknown' },
      patternless: { kind: 'unknown' },
    })
    expect(
      parentFromLabel(blankParent(), 'Black Night het Tremper Eclipse').loci,
    ).toMatchObject({ tremper: known(1), eclipse: known(1) })
  })
  it('requires an explicit single-letter interpretation and supports exact possible-het choices', () => {
    expect(() => parentFromLabel(blankParent(), 'BS ph. T')).toThrow(
      /Choose what T/,
    )
    expect(
      parentFromLabel(blankParent(), 'BS ph. T', {
        '1:morph': 'Tremper Albino',
        '1:tremper': '2/3',
      }).loci.tremper,
    ).toEqual({ kind: 'possible', n: 2, d: 3 })
  })
  it('does not turn line Tremper or possible WY into confirmed visual alleles', () => {
    expect(
      parentFromLabel(blankParent(), 'BlackNight (line Tremper)').loci.tremper,
    ).toEqual({ kind: 'unknown' })
    const p = parentFromLabel(blankParent(), 'Poss WY Tremper Stripe')
    expect(p.loci).toMatchObject({ wy: { kind: 'unknown' }, tremper: known(2) })
    expect(
      parentFromLabel(blankParent(), 'Poss WY Tremper', { '0:wy': '1' }).loci
        .wy,
    ).toEqual(known(1))
  })
  it('ends lineage wording before a following carrier qualifier', () => {
    for (const label of [
      'BN cross (Emerine line) ph. T',
      'Boldstripe (Tang line) ph. T',
      'Boldstripe Tang line ph. T',
    ]) {
      const parsed = parseShorthand(label)
      const index = parsed.proposals.findIndex((p) => p.token === 'T')
      expect(parsed.proposals[index]).toMatchObject({
        het: 'possible',
        referenceOnly: false,
      })
      const p = parentFromLabel(blankParent(), label, {
        [`${index}:morph`]: 'Tremper Albino',
      })
      expect(p.loci.tremper).toEqual({ kind: 'unknown' })
    }
  })
  it('supports confirmed combination hets without pretending a possible combo is independent', () => {
    expect(
      parentFromLabel(blankParent(), 'Macksnow BN het RAPTOR').loci,
    ).toMatchObject({ snow: known(1), tremper: known(1), eclipse: known(1) })
    expect(parentFromLabel(blankParent(), 'Tremper ph. DB').loci).toMatchObject(
      {
        tremper: known(2),
        eclipse: { kind: 'unknown' },
        blizzard: { kind: 'unknown' },
      },
    )
    expect(() =>
      parentFromLabel(blankParent(), 'ph RAPTOR', {
        '0:tremper': '1/2',
        '0:eclipse': '1/2',
      }),
    ).toThrow(/independent/)
    expect(
      parentFromLabel(blankParent(), 'ph RAPTOR', {
        '0:tremper': '1/2',
        '0:eclipse': '1/2',
        '0:independent': 'yes',
      }).loci.eclipse,
    ).toEqual({ kind: 'possible', n: 1, d: 2 })
  })
  it('does not assume an unresolved Sunglow strain is non-carrier', () => {
    const p: Pairing = {
      version: 1,
      assumeUnlisted: true,
      sire: scenario('Sunglow'),
      dam: scenario('Tremper'),
      observed: '',
    }
    expect(calculate(p).unknown.map((t) => t.id)).toContain('tremper')
    expect(calculate(p).assumed).toEqual([])
  })
  it('calculates the Wachi WB7440 recorded parents as 50% Mack and 50% Super Snow, all Eclipse', () => {
    const p: Pairing = {
      version: 1,
      assumeUnlisted: true,
      sire: scenario('Macksnow Eclipse BN'),
      dam: scenario('Supersnow Eclipse BN'),
      observed: '',
    }
    const r = calculate(p)
    expect(r.outcomes).toHaveLength(2)
    expect(r.outcomes.map((o) => o.probability.exact)).toEqual(['1/2', '1/2'])
    expect(r.outcomes.every((o) => o.genotypes.eclipse === 2)).toBe(true)
    expect(r.loci.some((l) => l.trait.id === 'tremper')).toBe(false)
  })
  it('calculates a Hype multi-het pair across Snow, Tremper, Eclipse and MP', () => {
    const p: Pairing = {
      version: 1,
      assumeUnlisted: true,
      sire: scenario('MST BN h. Eclipse'),
      dam: scenario('SuperSnow Tremper BN h. MP h. Eclipse'),
      observed: '',
    }
    const r = calculate(p)
    expect(r.outcomes).toHaveLength(12)
    expect(
      r.loci
        .find((l) => l.trait.id === 'eclipse')
        ?.distribution.map((v) => v.exact),
    ).toEqual(['1/4', '1/2', '1/4'])
    expect(r.outcomes.every((o) => o.genotypes.tremper === 2)).toBe(true)
    expect(sum(r.outcomes.map((o) => o.probability)).exact).toBe('1/1')
  })
  it('supports a conditional TUG model without inventing a joint Mack/TUG relationship', () => {
    const p: Pairing = {
      version: 1,
      sire: scenario('TUG Snow'),
      dam: scenario('TUG Snow'),
      observed: '',
    }
    expect(calculate(p).loci[0].distribution.map((v) => v.exact)).toEqual([
      '1/4',
      '1/2',
      '1/4',
    ])
    p.sire.loci.snow = known(1)
    expect(calculate(p).limitations).toHaveLength(1)
    expect(calculate(p).outcomes).toEqual([])
  })
})
