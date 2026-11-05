import { describe, expect, it } from 'vitest'
import { calculate, groupOutcomes } from '../genetics/inference'
import { blankParent, type Pairing } from '../genetics/traits'
import { parentFromLabel } from '../genetics/parser'
import {
  familyLines,
  outcomeName,
  visibleTraitNames,
} from '../genetics/result-presentation'
import { offspringAppearanceExamples } from '../genetics/appearance'
import { resultSummary } from '../components/Results'

describe('Family lines stay visible without becoming percentage predictions', () => {
  it('keeps Black Night on both results from the reported Snow/Eclipse pairing', () => {
    const pair: Pairing = {
      version: 1,
      assumeUnlisted: true,
      observed: '',
      sire: parentFromLabel(blankParent(), 'Black Night'),
      dam: parentFromLabel(blankParent(), 'Mack Snow Eclipse Black Night'),
    }
    const before = JSON.stringify(pair)
    const result = calculate(pair)
    expect(
      groupOutcomes(result.outcomes, 'phenotype').map((g) =>
        outcomeName(g.title, familyLines(pair), visibleTraitNames(result.loci)),
      ),
    ).toEqual([
      'Black Night line · without Mack Snow',
      'Mack Snow · Black Night line',
    ])
    expect(result.outcomes.map((o) => o.probability.exact)).toEqual([
      '1/2',
      '1/2',
    ])
    expect(result.outcomes.every((o) => o.genotypes.eclipse === 1)).toBe(true)
    expect(resultSummary(pair)).toContain(
      'Black Night line · without Mack Snow',
    )
    for (const o of result.outcomes) {
      const examples = offspringAppearanceExamples(
        o.genotypes,
        familyLines(pair),
      )
      expect(examples.map((p) => p.body)).toEqual([
        o.genotypes.snow ? 'snow' : 'normal',
        'melanistic',
      ])
      expect(examples.every((p) => p.eyes === 'slit')).toBe(true)
    }
    expect(JSON.stringify(pair)).toBe(before)
    const withoutLines = {
      ...pair,
      sire: { ...pair.sire, lineage: [] },
      dam: { ...pair.dam, lineage: [] },
    }
    expect(calculate(withoutLines).outcomes).toEqual(result.outcomes)
  })
  it('keeps calculated albino pigment, Eclipse eyes and patternless bodies intact', () => {
    const examples = offspringAppearanceExamples(
      { tremper: 2, eclipse: 2, patternless: 2 },
      ['Black Night', 'Bold Stripe', 'Carrot Tail'],
    )
    expect(examples).toHaveLength(1)
    expect(examples[0]).toMatchObject({
      body: 'albino',
      eyes: 'solid-red',
      pattern: 'patternless',
      tail: 'white',
    })
    const snow = offspringAppearanceExamples({ snow: 2, eclipse: 2 }, [
      'Black Night',
      'Bold Stripe',
    ])
    expect(
      snow.every((p) => p.pattern === 'fine-spots' && p.eyes === 'solid-black'),
    ).toBe(true)
  })
  it('shows other color/pattern lines without inventing a known appearance for project labels', () => {
    expect(
      offspringAppearanceExamples({ eclipse: 1 }, ['Tangerine']).map(
        (p) => p.body,
      ),
    ).toEqual(['normal', 'tangerine'])
    const stripe = offspringAppearanceExamples({ eclipse: 2 }, ['Bold Stripe'])
    expect(stripe.map((p) => p.pattern)).toEqual(['spotted', 'stripe'])
    expect(stripe.every((p) => p.eyes === 'solid-black')).toBe(true)
    expect(offspringAppearanceExamples({}, ['Cotton'])).toHaveLength(1)
    expect(outcomeName('Mack Snow', ['Tangerine'])).toBe(
      'Mack Snow · Tangerine line',
    )
  })
})
