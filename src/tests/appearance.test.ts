import { describe, it, expect } from 'vitest'
import {
  appearanceFromGenotypes,
  appearanceForMorph,
  appearanceForParent,
  assetForAppearance,
} from '../genetics/appearance'
import { blankParent, known, type LineTrait } from '../genetics/traits'
import { morphs, applyMorph } from '../data/morphs'

describe('Visible features are separate from carrier genetics', () => {
  it('White & Yellow and local pattern descriptors change the appropriate regions', () => {
    expect(appearanceFromGenotypes({ wy: 1 }).whiteSides).toBe(true)
    expect(appearanceFromGenotypes({ wy: 0 }).whiteSides).toBe(false)
    expect(appearanceForMorph('Hypo').pattern).toBe('reduced-spots')
    expect(appearanceForMorph('Reverse Stripe').pattern).toBe('reverse-stripe')
    expect(appearanceForMorph('Baldy').head).toBe('bald')
    expect(appearanceForMorph('Carrot Tail').tail).toBe('carrot')
  })
  it('confirmed albino and Eclipse carriers keep normal appearance', () => {
    expect(appearanceFromGenotypes({ tremper: 1, eclipse: 1 })).toMatchObject({
      body: 'normal',
      pattern: 'spotted',
      eyes: 'slit',
    })
    expect(
      appearanceForMorph('Normal het Tremper Albino & Eclipse'),
    ).toMatchObject({ body: 'normal', eyes: 'slit' })
  })
  it('Eclipse changes eyes without recoloring or removing body spots', () => {
    expect(appearanceFromGenotypes({ eclipse: 2 })).toMatchObject({
      body: 'normal',
      pattern: 'spotted',
      eyes: 'solid-black',
    })
  })
  it('albino Eclipse has solid red eyes', () =>
    expect(appearanceFromGenotypes({ tremper: 2, eclipse: 2 })).toMatchObject({
      body: 'albino',
      eyes: 'solid-red',
    }))
  it('Super Snow has its own fine spot pattern and solid eyes', () =>
    expect(appearanceFromGenotypes({ snow: 2 })).toMatchObject({
      body: 'snow',
      pattern: 'fine-spots',
      eyes: 'solid-black',
    }))
  it('patternless alleles remove pattern independently of Eclipse eyes', () => {
    expect(appearanceFromGenotypes({ blizzard: 2 })).toMatchObject({
      pattern: 'patternless',
      eyes: 'slit',
    })
    expect(
      appearanceFromGenotypes({ patternless: 2, eclipse: 2 }),
    ).toMatchObject({ pattern: 'patternless', eyes: 'solid-black' })
    expect(
      appearanceFromGenotypes({ blizzard: 1, patternless: 1 }),
    ).toMatchObject({ pattern: 'spotted' })
  })
  it('Pied and Super Pied choose visibly different pattern assets, not colors', () => {
    expect(assetForAppearance(appearanceForMorph('Pied'))).toBe('pied')
    expect(assetForAppearance(appearanceForMorph('Super Pied'))).toBe(
      'super-pied',
    )
    expect(appearanceForMorph('Pied').eyes).toBe('slit')
  })
  it('stripe, jungle and Super Hypo use different pattern assets', () => {
    expect(assetForAppearance(appearanceForMorph('Bold Stripe'))).toBe('stripe')
    expect(assetForAppearance(appearanceForMorph('Jungle'))).toBe('jungle')
    expect(assetForAppearance(appearanceForMorph('Super Hypo'))).toBe('hypo')
  })
  it('eye descriptors change the eye layer without changing body color', () => {
    expect(appearanceForMorph('Cipher')).toMatchObject({
      eyes: 'solid-black',
      pattern: 'broken-stripe',
    })
    for (const [name, eyes] of [
      ['Marble Eye', 'marbled'],
      ['Noir Desir Black Eye', 'dark-marbled'],
      ['Blue Amber Eye', 'blue-amber'],
      ['Snake Eye', 'snake-eye'],
    ])
      expect(appearanceForMorph(name)).toMatchObject({ body: 'normal', eyes })
  })
  it('documented parent alleles override carrier/visual label conflicts', () => {
    const parent = {
      ...blankParent(),
      morph: 'Tremper Albino',
      loci: { tremper: known(1) },
    }
    expect(appearanceForParent(parent).body).toBe('normal')
    const eclipse = {
      ...blankParent(),
      morph: 'Eclipse',
      loci: { eclipse: known(1) },
    }
    expect(appearanceForParent(eclipse).eyes).toBe('slit')
  })
  it('Pied pattern survives adding a known Snow locus to a parent', () => {
    const p = applyMorph(blankParent(), morphs.find((m) => m.name === 'Pied')!)
    p.loci.snow = known(1)
    p.loci.eclipse = known(2)
    expect(appearanceForParent(p)).toMatchObject({
      pattern: 'pied',
      eyes: 'solid-black',
    })
  })
  it('a Snow or carrier record preserves a separately recorded eye pattern', () => {
    for (const name of ['Marble Eye', 'Blue Amber Eye', 'Snake Eye']) {
      const p = applyMorph(blankParent(), morphs.find((m) => m.name === name)!)
      const eyes = appearanceForParent(p).eyes
      p.loci.snow = known(1)
      p.loci.tremper = known(1)
      expect(appearanceForParent(p).eyes).toBe(eyes)
    }
  })
  it('an albino record changes eye pigment while preserving eye pattern', () => {
    const eclipse = applyMorph(
      blankParent(),
      morphs.find((m) => m.name === 'Eclipse')!,
    )
    eclipse.loci.tremper = known(2)
    expect(appearanceForParent(eclipse).eyes).toBe('solid-red')
    const marble = applyMorph(
      blankParent(),
      morphs.find((m) => m.name === 'Marble Eye')!,
    )
    marble.loci.tremper = known(2)
    expect(appearanceForParent(marble).eyes).toBe('marbled')
  })
  it('marketplace names do not invent genotypes', () => {
    for (const name of ['Pied', 'Super Pied', 'Bojoneroko', 'Dark Tangerine'])
      expect(
        applyMorph(blankParent(), morphs.find((m) => m.name === name)!).loci,
      ).toEqual({})
    expect(appearanceForMorph('Bojoneroko').verifiedAppearance).toBe(false)
  })
  it('selected pattern line traits change the parent guide independently of color', () => {
    for (const [line, pattern] of [
      ['Jungle', 'jungle'],
      ['Bold Stripe', 'stripe'],
      ['Reverse Stripe', 'reverse-stripe'],
      ['Patternless Stripe', 'hypo'],
      ['Hypo', 'reduced-spots'],
    ]) {
      const p = { ...blankParent(), lineage: [line as LineTrait] }
      expect(appearanceForParent(p)).toMatchObject({ body: 'normal', pattern })
      expect(p.loci).toEqual({})
    }
    const p = {
      ...blankParent(),
      lineage: ['Baldy', 'Carrot Tail'] as LineTrait[],
    }
    expect(appearanceForParent(p)).toMatchObject({
      head: 'bald',
      tail: 'carrot',
    })
  })
})
