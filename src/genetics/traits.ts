import type { ReferenceId } from '../data/references'

export type Inheritance = 'recessive' | 'incomplete-dominant' | 'dominant'
export interface Trait {
  id: string
  name: string
  alias: string
  inheritance: Inheritance
  symbol: string
  visual: [string, string, string]
  description: string
  evidence: string
  caveat: string
  refs: ReferenceId[]
}
const recessive = (
  id: string,
  name: string,
  alias: string,
  symbol: string,
  description: string,
): Trait => ({
  id,
  name,
  alias,
  symbol,
  inheritance: 'recessive',
  visual: ['Non-visual', 'Non-visual', name],
  description,
  evidence: 'Breeder-supported Mendelian model',
  caveat:
    'Two variant copies express the trait. Appearance alone does not establish carrier status; pigment and eye traits can mask one another.',
  refs: ['reptimate', 'labs'],
})
export const traits: Trait[] = [
  {
    id: 'snow',
    name: 'Mack Snow',
    alias: 'MS / SS (Super Snow)',
    inheritance: 'incomplete-dominant',
    symbol: 'S',
    visual: ['Normal at Snow locus', 'Mack Snow', 'Super Snow'],
    description:
      'One copy gives Mack Snow; two copies give Super Snow. Adult color varies.',
    evidence:
      'Breeder-supported segregation; PAX7-associated molecular research',
    caveat:
      'Mack Snow is modeled here. Other snow lines are not assumed to be the same allele.',
    refs: ['labs', 'snow'],
  },
  recessive(
    'tremper',
    'Tremper Albino',
    'TA',
    'T',
    'Reduced dark pigmentation. Tremper, Bell, and Rainwater are distinct albino strains.',
  ),
  recessive(
    'bell',
    'Bell Albino',
    'BA',
    'B',
    'An albino strain modeled separately from Tremper and Rainwater.',
  ),
  recessive(
    'rainwater',
    'Rainwater Albino',
    'RW / Las Vegas Albino',
    'R',
    'Also called Las Vegas Albino; a distinct recessive albino strain.',
  ),
  recessive(
    'eclipse',
    'Eclipse',
    'E / EC',
    'E',
    'Associated with solid or partly solid eyes; visual expression can vary.',
  ),
  recessive(
    'blizzard',
    'Blizzard',
    'BZ',
    'Z',
    'Pattern reduction with variable background color. May mask other traits.',
  ),
  recessive(
    'patternless',
    'Murphy Patternless',
    'MP',
    'P',
    'Loss of adult pattern. Distinct from line-bred patternless stripe.',
  ),
  {
    id: 'wy',
    name: 'White & Yellow',
    alias: 'W&Y',
    symbol: 'W',
    inheritance: 'dominant',
    visual: ['Non-visual', 'White & Yellow', 'White & Yellow'],
    description: 'Breeder-reported dominant color and pattern modification.',
    evidence: 'Breeder-supported; molecular basis unverified',
    caveat:
      'A conditional dominant model, not a molecularly validated diagnosis. Appearance does not resolve one versus two copies. Neurological concerns have been reported in some lines; incidence and causation are not established here.',
    refs: ['verse', 'reptimate'],
  },
]
export const traitById = Object.fromEntries(
  traits.map((t) => [t.id, t]),
) as Record<string, Trait>
export const lineTraits = [
  'Tangerine',
  'Super Hypo',
  'Carrot Tail',
  'Black Night',
  'Black Pearl',
  'Hypo',
  'Baldy',
  'Carrot Head',
  'High Yellow',
  'Jungle',
  'Stripe',
  'Reverse Stripe',
  'Bold Stripe',
  'Bandit',
  'Halloween Mask',
  'Lavender',
  'Emerine',
  'Blood',
  'Mandarin',
  'Electric',
  'Inferno',
  'Tangerine Tornado',
  'Red Stripe',
  'Hyper Xanthic',
  'G Project',
  'Firebold',
  'Bengal',
  'Red Diamond',
  'Patternless Stripe',
  'Aberrant',
] as const
export type LineTrait = (typeof lineTraits)[number]
export type Genotype = 0 | 1 | 2
export type GeneticState =
  | { kind: 'unknown' }
  | { kind: 'known'; copies: Genotype }
  | { kind: 'possible'; n: number; d: number }
export interface Parent {
  name: string
  morph: string
  loci: Record<string, GeneticState>
  lineage: LineTrait[]
  evidence: string
  labels: string[]
}
export interface Pairing {
  version: 1
  assumeUnlisted?: boolean
  sire: Parent
  dam: Parent
  observed: string
}
export const blankParent = (): Parent => ({
  name: '',
  morph: 'Normal / Wild Type',
  loci: {},
  lineage: [],
  evidence: '',
  labels: [],
})
export const known = (copies: Genotype): GeneticState => ({
  kind: 'known',
  copies,
})
export function genotypeLabel(trait: Trait, copies: Genotype) {
  const s = trait.symbol
  if (trait.inheritance === 'recessive')
    return copies === 0
      ? s + s
      : copies === 1
        ? s + s.toLowerCase()
        : s.toLowerCase().repeat(2)
  return copies === 0 ? '++' : copies === 1 ? `${s}+` : s + s
}
