import { describe, expect, it } from 'vitest'
import { blankParent, known, traits, type Pairing } from '../genetics/traits'
import { addMorph, applyMorph, morphs, preset } from '../data/morphs'
import { calculate } from '../genetics/inference'
import { parseShorthand } from '../genetics/parser'
import { encodePairing, decodePairing } from '../lib/storage'

describe('General combination estimates', () => {
  it('calculates the requested Black Night cross without an evidence requirement', () => {
    const p = preset('black-night')
    const r = calculate(p)
    expect(r.loci[0].trait.id).toBe('tremper')
    expect(r.loci[0].distribution.map((v) => v.exact)).toEqual([
      '1/2',
      '1/2',
      '0/1',
    ])
    expect(r.assumed.map((a) => [a.parent, a.trait.id])).toEqual([
      ['Sire', 'tremper'],
    ])
    expect(p.sire.loci.tremper).toBeUndefined()
    expect(p.sire.lineage).toEqual(['Black Night'])
  })
  it('supports carrier additions across every non-risk catalog entry and supported recessive', () => {
    for (const morph of morphs.filter((m) => !m.risk)) {
      for (const trait of traits.filter((t) => t.inheritance === 'recessive')) {
        const p: Pairing = {
          version: 1,
          assumeUnlisted: true,
          sire: applyMorph(blankParent(), morph),
          dam: applyMorph(blankParent(), morph),
          observed: '',
        }
        if (p.sire.loci[trait.id]) continue
        p.dam.loci[trait.id] = known(1)
        const r = calculate(p)
        expect(
          r.loci
            .find((l) => l.trait.id === trait.id)
            ?.distribution.map((v) => v.exact),
          `${morph.name} + het ${trait.name}`,
        ).toEqual(['1/2', '1/2', '0/1'])
      }
    }
  })
  it('can disable assumptions and never substitutes for an explicitly unknown record', () => {
    const p = preset('black-night')
    p.assumeUnlisted = false
    expect(calculate(p).unknown.map((t) => t.id)).toEqual(['tremper'])
    expect(calculate(p).outcomes).toEqual([])
    p.assumeUnlisted = true
    p.sire.loci.tremper = { kind: 'unknown' }
    expect(calculate(p).unknown.map((t) => t.id)).toEqual(['tremper'])
    expect(calculate(p).assumed).toEqual([])
  })
  it('composes arbitrary visible traits, breeding lines and hidden genes', () => {
    let parent = applyMorph(
      blankParent(),
      morphs.find((m) => m.name === 'Black Night')!,
    )
    for (const name of ['Mack Snow', 'Eclipse', 'Bold Stripe'])
      parent = addMorph(parent, morphs.find((m) => m.name === name)!)
    expect(parent.loci).toMatchObject({ snow: known(1), eclipse: known(2) })
    expect(parent.lineage).toEqual(['Black Night', 'Bold Stripe'])
    expect(parent.morph).toContain('Eclipse')
    expect(
      parseShorthand('Black Night het Tremper').proposals.map((p) => [
        p.morph?.name,
        p.het,
      ]),
    ).toEqual(
      expect.arrayContaining([
        ['Black Night', undefined],
        ['Tremper Albino', 'known'],
      ]),
    )
  })
  it('preserves estimate settings in shared links while old links remain record-only', () => {
    const p = preset('black-night')
    expect(decodePairing(encodePairing(p)).assumeUnlisted).toBe(true)
    delete p.assumeUnlisted
    expect(decodePairing(encodePairing(p)).assumeUnlisted).toBeUndefined()
    expect(calculate(decodePairing(encodePairing(p))).outcomes).toEqual([])
  })
})
