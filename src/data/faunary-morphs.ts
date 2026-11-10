import type { Morph } from './morphs'
import type { Genotype, LineTrait } from '../genetics/traits'

const combination = (
  name: string,
  aliases: string[],
  loci: Record<string, Genotype>,
  lineage: LineTrait[] = [],
): Morph => ({
  name,
  aliases,
  ...(Object.keys(loci).length ? { loci } : {}),
  lineage,
  category: 'combination',
  refs: ['faunary'],
  status: 'Breeder label; components conditional on the stated records',
  note: 'A combination of the named traits and family lines, not an extra gene. Confirm the animal’s records. Family shade and markings can vary.',
})
export const faunaryMorphs: Morph[] = [
  combination(
    'Black Night Tangerine Stripe',
    ['BN Tangerine Stripe', 'BN Tang Stripe', 'BN TG Stripe'],
    {},
    ['Black Night', 'Tangerine', 'Stripe'],
  ),
  combination(
    'Black Night Tangerine',
    ['BN Tangerine', 'BN Tang', 'BN TG'],
    {},
    ['Black Night', 'Tangerine'],
  ),
  combination(
    'Black Night Murphy Patternless',
    ['BNMP', 'BN MP'],
    { patternless: 2 },
    ['Black Night'],
  ),
  combination('Mack Snow Black Night', ['MSBN', 'MSBNC'], { snow: 1 }, [
    'Black Night',
  ]),
  combination('Super Snow Black Night', ['SSBN', 'SSBNC'], { snow: 2 }, [
    'Black Night',
  ]),
  combination('Super Snow Tremper', ['SST'], { snow: 2, tremper: 2 }),
  combination(
    'Super Snow Tremper Black Night',
    ['SSTBN'],
    { snow: 2, tremper: 2 },
    ['Black Night'],
  ),
  combination('Mack Snow Diablo Blanco', ['MSDB'], {
    snow: 1,
    tremper: 2,
    eclipse: 2,
    blizzard: 2,
  }),
  combination('Super Snow Diablo Blanco', ['SSDB'], {
    snow: 2,
    tremper: 2,
    eclipse: 2,
    blizzard: 2,
  }),
  combination('Mack Snow Bold Stripe', ['MSBS'], { snow: 1 }, ['Bold Stripe']),
  combination('Tremper Bold Stripe', ['TBS'], { tremper: 2 }, ['Bold Stripe']),
  combination('Tremper Lavender', [], { tremper: 2 }, ['Lavender']),
  combination('Emerine Red Stripe', ['ERS'], {}, ['Emerine', 'Red Stripe']),
  combination('Black Night Eclipse', ['BN Eclipse', 'BN E'], { eclipse: 2 }, [
    'Black Night',
  ]),
  combination(
    'Black Night Eclipse Tangerine',
    ['BN Eclipse Tangerine', 'BN E TG'],
    { eclipse: 2 },
    ['Black Night', 'Tangerine'],
  ),
  combination('Bell Black Night Tangerine', ['Bell BN TG'], { bell: 2 }, [
    'Black Night',
    'Tangerine',
  ]),
  combination(
    'Tremper Black Night Tangerine',
    ['Tremper BN TG'],
    { tremper: 2 },
    ['Black Night', 'Tangerine'],
  ),
  combination('Tangerine Stripe', ['Tang Stripe', 'TG Stripe'], {}, [
    'Tangerine',
    'Stripe',
  ]),
  combination(
    'Mack Snow Tremper Bold Stripe',
    ['MST BS'],
    { snow: 1, tremper: 2 },
    ['Bold Stripe'],
  ),
  combination('Super Snow Blizzard Eclipse', ['SSBE'], {
    snow: 2,
    blizzard: 2,
    eclipse: 2,
  }),
  {
    ...combination('Mack Snow Lemon Frost', ['MSLF'], { snow: 1 }),
    risk: 'frost',
    note: 'Includes Lemon Frost. Welfare concerns apply and predictions are withheld.',
  },
  ...(
    ['Pandora', 'Tiger', 'KYT', 'Ogre', 'Puma', 'Ablo', 'Melanistic'] as const
  ).map(
    (name): Morph => ({
      name,
      aliases:
        name === 'Pandora'
          ? ['Pandhora']
          : name === 'Melanistic'
            ? ['Melanistics']
            : [],
      lineage: [name],
      category: 'line',
      refs: ['faunary'],
      status:
        'Seller-reported family/project label; no independent gene established',
      note: 'Recorded from Faunary descriptions as a family or project name. No albino strain, hidden gene, exact shade or inheritance percentage is inferred from this name.',
    }),
  ),
  ...['TL', 'FT', 'BB'].map(
    (name): Morph => ({
      name,
      aliases: [],
      category: 'unverified',
      refs: ['faunary'],
      status: 'Breeder shorthand; full meaning needs confirmation',
      note: 'This short code appears in listing descriptions without a sufficiently clear universal definition. Keep it as a reference or select the full trait name from breeder records; no alleles are assigned automatically.',
    }),
  ),
]
