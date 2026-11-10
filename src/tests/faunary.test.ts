import { describe, expect, it } from 'vitest'
import audit from './fixtures/faunary-listings.json'
import { morphs, preset } from '../data/morphs'
import { blankParent, known } from '../genetics/traits'
import { parentFromLabel, parseShorthand } from '../genetics/parser'
import { calculate } from '../genetics/inference'
import { sum } from '../genetics/probability'
import {
  faunaryLabels,
  quickCombination,
  searchFaunaryLabels,
  searchMorphs,
  canApplyLabel,
} from '../genetics/morph-search'

describe('Faunary descriptions and real combination inputs', () => {
  it('accounts for every full public description in the audited catalog', () => {
    expect(audit.fullDescriptionsReviewed).toBe(1398)
    expect(audit.records).toHaveLength(1398)
    expect(new Set(audit.records.map((r) => r.id)).size).toBe(1398)
    expect(audit.records.filter((r) => r.type === 'sell')).toHaveLength(1373)
    expect(audit.records.filter((r) => r.type === 'auction')).toHaveLength(25)
    expect(
      audit.records.every(
        (r) =>
          /^[a-f0-9]{64}$/.test(r.descriptionHash) &&
          r.descriptionCharacters > 0,
      ),
    ).toBe(true)
    expect(
      audit.records.filter((r) => r.kind === 'other-species'),
    ).toHaveLength(5)
    expect(faunaryLabels.length).toBeGreaterThan(1000)
    expect(
      faunaryLabels.some((label) => /\b(?:oreo|zulu|aft)\b/i.test(label)),
    ).toBe(false)
  })
  it('makes the requested three-line morph and the mistyped het MP input directly selectable', () => {
    expect(searchMorphs('black night tangerine stripe')[0].name).toBe(
      'Black Night Tangerine Stripe',
    )
    expect(quickCombination('black ngiht h MP')).toBe(
      'Black Night · Het Murphy Patternless',
    )
    const sire = parentFromLabel(blankParent(), 'Black Night Tangerine Stripe')
    const dam = parentFromLabel(blankParent(), 'black ngiht h MP')
    expect(sire.lineage).toEqual(['Black Night', 'Tangerine', 'Stripe'])
    expect(dam.lineage).toEqual(['Black Night'])
    expect(dam.loci.patternless).toEqual(known(1))
    const result = calculate({
      version: 1,
      assumeUnlisted: true,
      sire,
      dam,
      observed: '',
    })
    expect(result.loci[0].trait.name).toBe('Murphy Patternless')
    expect(result.loci[0].distribution.map((p) => p.exact)).toEqual([
      '1/2',
      '1/2',
      '0/1',
    ])
    expect(sum(result.outcomes.map((o) => o.probability)).exact).toBe('1/1')
    expect(calculate(preset('black-night-stripe-mp')).outcomes).toEqual(
      result.outcomes,
    )
  })
  it('keeps MP and confirmed vs possible het MP distinct in the descriptions', () => {
    expect(parentFromLabel(blankParent(), 'BNMP').loci.patternless).toEqual(
      known(2),
    )
    for (const label of ['BN h MP', 'Blacknight het. MP', 'BN HMP'])
      expect(parentFromLabel(blankParent(), label).loci.patternless).toEqual(
        known(1),
      )
    for (const label of ['Bn pht mp', 'BN ph MP', 'BN PHMP']) {
      expect(parentFromLabel(blankParent(), label).loci.patternless).toEqual({
        kind: 'unknown',
      })
      expect(canApplyLabel(label)).toBe(false)
    }
  })
  it('indexes description and parent-field wording in the search, without requiring exact word order', () => {
    expect(
      searchMorphs('stripe tangerine black night').some(
        (m) => m.name === 'Black Night Tangerine Stripe',
      ),
    ).toBe(true)
    expect(searchFaunaryLabels('Pandora CT')).toContain('Pandora CT')
    expect(searchFaunaryLabels('BN het MP').length).toBeGreaterThan(0)
    for (const name of ['Pandora', 'Tiger', 'KYT', 'Ogre', 'Puma', 'Ablo'])
      expect(morphs.find((m) => m.name === name)?.loci).toBeUndefined()
  })
  it('never changes an already-visual component into a carrier when reading compound het shorthand', () => {
    expect(parentFromLabel(blankParent(), 'MST het DB').loci).toMatchObject({
      snow: known(1),
      tremper: known(2),
      eclipse: known(1),
      blizzard: known(1),
    })
    expect(
      parentFromLabel(blankParent(), 'Eclipse het RAPTOR').loci,
    ).toMatchObject({ eclipse: known(2), tremper: known(1) })
    expect(() => parentFromLabel(blankParent(), 'Tremper het Tremper')).toThrow(
      /Conflicting/,
    )
    const label = 'Hypo Tangerine het Tremper ph RAPTOR'
    expect(parentFromLabel(blankParent(), label).loci).toMatchObject({
      tremper: known(1),
      eclipse: { kind: 'unknown' },
    })
    const index = parseShorthand(label).proposals.findIndex(
      (p) => p.morph?.name === 'RAPTOR',
    )
    expect(
      parentFromLabel(blankParent(), label, { [`${index}:eclipse`]: '2/3' })
        .loci,
    ).toMatchObject({
      tremper: known(1),
      eclipse: { kind: 'possible', n: 2, d: 3 },
    })
  })
  it('does not promote possible visuals, ambiguous HT or unidentified albino strain to known genes', () => {
    expect(parentFromLabel(blankParent(), 'Eclips POS MSE').loci).toMatchObject(
      { eclipse: known(2), snow: { kind: 'unknown' } },
    )
    expect(canApplyLabel('Macksnow HT PH E')).toBe(false)
    expect(
      parseShorthand('HT').proposals[0].alternatives?.map((m) => m.name),
    ).toEqual(['Hypo Tangerine', 'Het Tremper Albino'])
    expect(parentFromLabel(blankParent(), 'het albino').loci).toMatchObject({
      tremper: { kind: 'unknown' },
      bell: { kind: 'unknown' },
      rainwater: { kind: 'unknown' },
    })
  })
  it('does not send unresolved probabilities or unknown names down the direct-selection path', () => {
    for (const label of faunaryLabels.filter(canApplyLabel)) {
      const parsed = parseShorthand(label)
      expect(parsed.unresolved, label).toEqual([])
      expect(
        parsed.proposals.some(
          (p) => p.alternatives || p.needsChoice || p.uncertain,
        ),
        label,
      ).toBe(false)
    }
  })
})
