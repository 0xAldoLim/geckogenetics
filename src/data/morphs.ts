import { blankParent, known } from '../genetics/traits'
import type { Genotype, LineTrait, Pairing, Parent } from '../genetics/traits'
import type { ReferenceId } from './references'
export interface Morph {
  name: string
  aliases: string[]
  loci?: Record<string, Genotype>
  lineage?: LineTrait[]
  note: string
  risk?: 'frost' | 'enigma'
  ambiguous?: boolean
  refs?: ReferenceId[]
  status?: string
}
const line = (
  name: LineTrait,
  note: string,
  refs: ReferenceId[] = ['reptimate', 'verse'],
): Morph => ({
  name,
  aliases: [],
  lineage: [name],
  note,
  refs,
  status: 'Breeder-supported selection; no quantitative model',
})
const combo = (
  name: string,
  loci: Record<string, Genotype>,
  note: string,
  lineage: LineTrait[] = [],
): Morph => ({
  name,
  aliases: [],
  loci,
  lineage,
  note,
  refs: ['masterlist', 'etc'],
  status: 'Breeder nomenclature; conditional component model',
})
export const morphs: Morph[] = [
  {
    name: 'Normal / Wild Type',
    aliases: ['Normal', 'Wild Type'],
    note: 'A normal appearance cannot rule out hidden recessive alleles. Set documented genotypes in Advanced.',
  },
  {
    name: 'Mack Snow',
    aliases: ['MS'],
    loci: { snow: 1 },
    note: 'One Mack Snow allele; unrelated hidden recessives remain unknown.',
  },
  {
    name: 'Super Snow',
    aliases: ['SS'],
    loci: { snow: 2 },
    note: 'Two copies at the Mack Snow locus.',
  },
  {
    name: 'Tremper Albino',
    aliases: ['TA'],
    loci: { tremper: 2 },
    note: 'Visual Tremper, based on your identification and records.',
  },
  {
    name: 'Bell Albino',
    aliases: ['BA', 'Florida Albino'],
    loci: { bell: 2 },
    refs: ['bell', 'strains'],
    note: 'Visual Bell. Albino strains must be identified from records, not color alone. Light sensitivity is reported in albino lines.',
  },
  {
    name: 'Rainwater Albino',
    aliases: ['RW', 'Las Vegas Albino'],
    loci: { rainwater: 2 },
    note: 'Visual Rainwater; not interchangeable with Bell or Tremper.',
  },
  {
    name: 'Eclipse',
    aliases: ['E'],
    loci: { eclipse: 2 },
    note: 'Variable eye expression; genotype is conditional on your identification.',
  },
  {
    name: 'Blizzard',
    aliases: ['BZ'],
    loci: { blizzard: 2 },
    note: 'Pattern can mask other expressed traits.',
  },
  {
    name: 'Murphy Patternless',
    aliases: ['MP', 'Murphy’s Patternless'],
    loci: { patternless: 2 },
    note: 'Distinct from patternless stripe.',
  },
  {
    name: 'Tangerine',
    aliases: ['Tang'],
    lineage: ['Tangerine'],
    note: 'Selected orange coloration; no reliable Mendelian percentage.',
  },
  {
    name: 'Super Hypo',
    aliases: ['SH'],
    lineage: ['Super Hypo'],
    note: 'Selected reduction of body spotting; no single-locus prediction.',
  },
  {
    name: 'SHTCT',
    aliases: ['Super Hypo Tangerine Carrot Tail'],
    lineage: ['Super Hypo', 'Tangerine', 'Carrot Tail'],
    note: 'Super Hypo Tangerine Carrot Tail ancestry; not three Mendelian genes.',
  },
  {
    name: 'Sunglow',
    aliases: [],
    lineage: ['Super Hypo', 'Tangerine'],
    ambiguous: true,
    note: 'Albino + Super Hypo Tangerine. Choose the albino strain explicitly; the name does not establish it.',
  },
  {
    name: 'RAPTOR',
    aliases: [],
    loci: { tremper: 2, eclipse: 2 },
    lineage: ['Tangerine'],
    note: 'Tremper Albino + Eclipse; orange and patternless-stripe selection is not Murphy Patternless.',
  },
  {
    name: 'Black Night',
    aliases: ['BN'],
    lineage: ['Black Night'],
    note: 'Melanistic breeding line; exact expression and genetic architecture are not modeled.',
  },
  {
    name: 'Black Pearl',
    aliases: ['BP'],
    lineage: ['Black Pearl'],
    note: 'Melanistic breeding line. No single-locus inheritance claim.',
  },
  {
    name: 'Carrot Tail',
    aliases: ['CT'],
    lineage: ['Carrot Tail'],
    note: 'Selected orange tail coloration; variable expression.',
  },
  {
    name: 'White & Yellow',
    aliases: ['W&Y'],
    note: 'Dominant breeder model. Set one or two copies only with supporting records in Advanced.',
  },
  {
    name: 'Lemon Frost',
    aliases: ['LF'],
    risk: 'frost',
    note: 'Peer-reviewed association with iridophoroma. Breeding this morph is discouraged. Retained as a welfare label; not included in breeding predictions.',
  },
  {
    name: 'Enigma',
    aliases: ['EN'],
    risk: 'enigma',
    note: 'Reported neurological concerns. Breeding is discouraged. No neurological, survival, or fertility probabilities are calculated.',
  },
  line('Hypo', 'Selected reduction in spotting; not a proven recessive locus.'),
  line(
    'Baldy',
    'Reduced head spotting; a selected appearance, not a guaranteed inherited proportion.',
  ),
  line(
    'Carrot Head',
    'Selected orange head coloration; intensity and placement vary.',
  ),
  line(
    'High Yellow',
    'Selection for stronger yellow coloration; hidden recessive status remains separate.',
  ),
  line(
    'Jungle',
    'Irregular patterning. Single-gene claims conflict; tracked only as ancestry.',
  ),
  line(
    'Stripe',
    'Selected dorsal pattern; no validated expression percentage.',
  ),
  line(
    'Reverse Stripe',
    'Selected pattern description; not treated as an independent recessive gene.',
  ),
  line(
    'Bold Stripe',
    'Selection for bold longitudinal patterning; recessive claims are not assumed.',
  ),
  line('Bandit', 'A selected bold pattern line, often with a nose band.', [
    'verse',
  ]),
  line(
    'Halloween Mask',
    'Selected bold head patterning; not a distinct modeled locus.',
    ['verse'],
  ),
  line(
    'Lavender',
    'A color descriptor; age and conditions influence expression.',
    ['verse'],
  ),
  line(
    'Emerine',
    'Selected greenish and orange coloration; lineage is not a single gene.',
    ['etc'],
  ),
  line(
    'Blood',
    'A Tangerine breeding line; record ancestry without invented color probabilities.',
    ['etc'],
  ),
  line('Mandarin', 'A named Tangerine line, retained as ancestry.', ['etc']),
  line(
    'Electric',
    'A named color breeding line. No validated quantitative prediction.',
    ['masterlist'],
  ),
  line('Inferno', 'A named Tangerine selection line.', ['masterlist']),
  line('Tangerine Tornado', 'A named Tangerine line; expression varies.', [
    'masterlist',
  ]),
  line('Red Stripe', 'Selected stripe and color characteristics.', ['etc']),
  line(
    'Hyper Xanthic',
    'Selection for yellow coloration; single-locus claims are unverified.',
    ['verse'],
  ),
  line('G Project', 'Named breeding project; ancestry is not a single gene.', [
    'verse',
  ]),
  line('Firebold', 'Selected bold and orange breeding line.', ['verse']),
  line(
    'Bengal',
    'A breeding project combining selected bold and orange lines.',
    ['verse'],
  ),
  line(
    'Red Diamond',
    'A selected color line; document albino strain separately.',
    ['verse'],
  ),
  line(
    'Patternless Stripe',
    'Selected pattern descriptor, distinct from Murphy Patternless.',
  ),
  line('Aberrant', 'Irregular pattern descriptor, not a calculable gene.'),
  {
    name: 'Giant',
    aliases: [],
    note: 'Disputed inheritance: the historical originator model is incomplete dominant, while other breeder references differ. Size alone cannot establish genotype. Not modeled.',
    refs: ['giant', 'verse'],
    status: 'Disputed inheritance',
  },
  {
    name: 'Super Giant',
    aliases: ['SG'],
    note: 'Large-size designation; conflicting inheritance claims prevent reliable genotype inference. Not modeled.',
    refs: ['giant', 'verse'],
    status: 'Disputed inheritance',
  },
  {
    name: 'Godzilla Giant',
    aliases: [],
    note: 'Large-size lineage; no validated size prediction.',
    refs: ['etc'],
    status: 'Breeding lineage; unmodeled',
  },
  {
    name: 'Gem Snow',
    aliases: ['GEM'],
    note: 'Separate snow line. Not assumed allelic to or independent of Mack Snow; interactions unmodeled.',
    refs: ['verse', 'etc'],
    status: 'Breeder-reported dominant; relationships unverified',
  },
  {
    name: 'TUG Snow',
    aliases: [],
    note: 'Distinct snow line; allele relationships and quantitative expression unmodeled.',
    refs: ['etc'],
    status: 'Breeder-reported snow line; unmodeled',
  },
  {
    name: 'Ghost',
    aliases: [],
    note: 'Faded coloration; naming and inheritance claims conflict. No genotype assigned.',
    refs: ['verse', 'masterlist'],
    status: 'Disputed / insufficient evidence',
  },
  {
    name: 'Pastel',
    aliases: ['Bluebelly Pastel'],
    note: 'Breeders report heritable color modification. Usage varies; no cross-line allele relationship assumed.',
    refs: ['pastel'],
    status: 'Breeder-reported; unmodeled',
  },
  {
    name: 'Marble Eye',
    aliases: ['ME'],
    note: 'Breeder-supported recessive eye trait. Eye-locus interactions are insufficiently established for joint predictions here.',
    refs: ['reptimate', 'bae'],
    status: 'Breeder-supported recessive; unmodeled',
  },
  {
    name: 'Noir Desir Black Eye',
    aliases: ['NDBE'],
    note: 'Reported recessive eye trait. Ocular and reproductive concerns occur in breeder accounts; no incidence assigned.',
    refs: ['bae'],
    status: 'Breeder-reported recessive; welfare uncertainty',
  },
  {
    name: 'Blue Amber Eye',
    aliases: ['BAE', 'B.A.E.'],
    note: 'Originator reports recessive transmission and complementation with other eye traits. Molecular identity and all interactions unverified; not modeled.',
    refs: ['bae'],
    status: 'Originator-supported recessive; unmodeled',
  },
  {
    name: 'Cipher',
    aliases: [],
    note: 'Originator-supported recessive with eye and pattern changes. Not interchangeable with Eclipse or Marble Eye; unmodeled.',
    refs: ['verse'],
    status: 'Breeder-supported recessive; unmodeled',
  },
  {
    name: 'Abyssinian',
    aliases: [],
    note: 'Inconsistently defined appearance label. No unique mechanism assigned.',
    refs: ['masterlist'],
    status: 'Disputed definition',
  },
  {
    name: 'Paradox',
    aliases: [],
    note: 'Unexpected local color variation; no predictable inheritance assigned.',
    refs: ['masterlist'],
    status: 'Descriptive; inheritance unknown',
  },
  combo('RADAR', { bell: 2, eclipse: 2 }, 'Bell Albino + Eclipse.'),
  combo('Typhoon', { rainwater: 2, eclipse: 2 }, 'Rainwater Albino + Eclipse.'),
  combo(
    'Diablo Blanco',
    { tremper: 2, blizzard: 2, eclipse: 2 },
    'Tremper Albino + Blizzard + Eclipse.',
  ),
  combo(
    'White Knight',
    { bell: 2, blizzard: 2, eclipse: 2 },
    'Bell Albino + Blizzard + Eclipse.',
  ),
  combo('Total Eclipse', { snow: 2, eclipse: 2 }, 'Super Snow + Eclipse.'),
  combo(
    'Galaxy',
    { snow: 2, eclipse: 2 },
    'Commonly Super Snow + Eclipse; confirm the breeder’s definition.',
  ),
  combo(
    'Platinum',
    { snow: 1, patternless: 2 },
    'Mack Snow + Murphy Patternless.',
  ),
  combo(
    'Super Platinum',
    { snow: 2, patternless: 2 },
    'Super Snow + Murphy Patternless.',
  ),
  combo(
    'Ember',
    { tremper: 2, eclipse: 2, patternless: 2 },
    'Tremper Albino + Eclipse + Murphy Patternless.',
  ),
  combo(
    'Cyclone',
    { rainwater: 2, eclipse: 2, patternless: 2 },
    'Rainwater Albino + Eclipse + Murphy Patternless.',
  ),
  combo(
    'Creamsicle',
    { snow: 1 },
    'Mack Snow with selected Super Hypo Tangerine ancestry.',
    ['Super Hypo', 'Tangerine'],
  ),
  {
    name: 'Blazing Blizzard',
    aliases: [],
    loci: { blizzard: 2 },
    ambiguous: true,
    note: 'Albino + Blizzard. Select the albino strain explicitly.',
    refs: ['etc'],
  },
  {
    name: 'Hybino',
    aliases: [],
    lineage: ['Hypo', 'Tangerine'],
    ambiguous: true,
    note: 'Albino with selected color; requires an explicit albino strain.',
    refs: ['masterlist'],
  },
  combo('Tangelo', { tremper: 2 }, 'Tremper Albino with Tangerine selection.', [
    'Tangerine',
  ]),
  combo(
    'Firewater',
    { rainwater: 2 },
    'Rainwater Albino with selected color ancestry.',
    ['Tangerine', 'Super Hypo'],
  ),
  {
    name: 'Banana Blizzard',
    aliases: [],
    note: 'Conflicting definitions; do not assume Murphy Patternless.',
    refs: ['masterlist'],
    status: 'Ambiguous combination; unmodeled',
  },
  {
    name: 'Snowglow',
    aliases: [],
    lineage: ['Tangerine'],
    ambiguous: true,
    note: 'Snow/albino/color label; identify snow line and albino strain explicitly.',
    refs: ['masterlist'],
  },
  {
    name: 'Black Hole',
    aliases: [],
    risk: 'enigma',
    note: 'Contains Enigma in common usage. Welfare caution; predictions withheld.',
    refs: ['masterlist', 'enigma'],
  },
  {
    name: 'Nova',
    aliases: [],
    risk: 'enigma',
    note: 'Contains Enigma in common usage. Welfare caution; predictions withheld.',
    refs: ['masterlist', 'enigma'],
  },
  {
    name: 'Dreamsicle',
    aliases: [],
    risk: 'enigma',
    note: 'Contains Enigma in common usage. Welfare caution; predictions withheld.',
    refs: ['masterlist', 'enigma'],
  },
]
export function applyMorph(parent: Parent, morph: Morph): Parent {
  return {
    ...parent,
    morph: morph.name,
    loci: Object.fromEntries(
      Object.entries(morph.loci ?? {}).map(([id, copies]) => [
        id,
        known(copies),
      ]),
    ),
    lineage: [...(morph.lineage ?? [])],
    labels: [
      ...(morph.risk
        ? [morph.risk === 'frost' ? 'Lemon Frost' : 'Enigma']
        : []),
      ...(!morph.loci || morph.ambiguous ? [morph.name] : []),
    ],
  }
}
export function preset(
  id: 'snow' | 'sunglow-a' | 'sunglow-b' | 'labs',
): Pairing {
  const sire = blankParent(),
    dam = blankParent()
  const evidence =
    'Educational preset: stated genotypes are assumptions, not evidence about a real animal.'
  sire.evidence = dam.evidence = evidence
  if (id === 'snow') {
    sire.morph = dam.morph = 'Mack Snow'
    sire.loci.snow = known(1)
    dam.loci.snow = known(1)
  } else if (id === 'labs') {
    sire.morph = 'Tremper Albino het Eclipse'
    sire.loci = { tremper: known(2), eclipse: known(1) }
    dam.morph = 'Normal het Tremper & Eclipse'
    dam.loci = { tremper: known(1), eclipse: known(1) }
  } else {
    sire.morph = 'Sunglow · Tremper'
    sire.loci.tremper = known(2)
    sire.lineage = ['Tangerine', 'Super Hypo']
    dam.morph = 'SHTCT'
    dam.loci.tremper = known(id === 'sunglow-a' ? 0 : 1)
    dam.lineage = ['Super Hypo', 'Tangerine', 'Carrot Tail']
  }
  return { version: 1, sire, dam, observed: '' }
}
