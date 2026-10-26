import type { Genotype, Parent } from './traits'
import { morphs } from '../data/morphs'

export type BodyColor =
  | 'normal'
  | 'snow'
  | 'albino'
  | 'tangerine'
  | 'dark-tangerine'
  | 'melanistic'
export type BodyPattern =
  | 'spotted'
  | 'fine-spots'
  | 'hypo'
  | 'reduced-spots'
  | 'patternless'
  | 'pied'
  | 'high-white-pied'
  | 'stripe'
  | 'reverse-stripe'
  | 'broken-stripe'
  | 'banded'
  | 'circle-back'
  | 'jungle'
export type EyeAppearance =
  | 'slit'
  | 'albino-slit'
  | 'solid-black'
  | 'solid-red'
  | 'snake-eye'
  | 'marbled'
  | 'dark-marbled'
  | 'blue-amber'
export interface VisualProfile {
  body: BodyColor
  pattern: BodyPattern
  eyes: EyeAppearance
  head: 'spotted' | 'bald' | 'white' | 'carrot' | 'bandit'
  tail: 'banded' | 'carrot' | 'white'
  whiteSides: boolean
  whiteFeet: boolean
  whiteNeck: boolean
  verifiedAppearance: boolean
}
export const normalAppearance = (): VisualProfile => ({
  body: 'normal',
  pattern: 'spotted',
  eyes: 'slit',
  head: 'spotted',
  tail: 'banded',
  verifiedAppearance: true,
  whiteSides: false,
  whiteFeet: false,
  whiteNeck: false,
})

/** Expressed alleles only. A carrier or possible het never changes the drawing. */
export function appearanceFromGenotypes(
  genotypes: Record<string, Genotype>,
): VisualProfile {
  const result = normalAppearance()
  if (genotypes.wy > 0) result.whiteSides = true
  const albino = ['tremper', 'bell', 'rainwater'].some(
    (id) => genotypes[id] === 2,
  )
  if (genotypes.snow === 1) result.body = 'snow'
  if (genotypes.snow === 2) {
    result.body = 'snow'
    result.pattern = 'fine-spots'
    result.eyes = 'solid-black'
  }
  if (albino) {
    result.body = 'albino'
    result.eyes = result.eyes === 'solid-black' ? 'solid-red' : 'albino-slit'
  }
  if (genotypes.blizzard === 2 || genotypes.patternless === 2) {
    result.pattern = 'patternless'
    result.head = 'bald'
    result.tail = 'white'
  }
  if (genotypes.eclipse === 2)
    result.eyes = albino ? 'solid-red' : 'solid-black'
  return result
}

/** Names describe illustrations, never hidden allele evidence or inheritance probabilities. */
export function appearanceForMorph(title: string): VisualProfile {
  const visible = title.split(/\b(?:het|possible het|ph)\b/i)[0].trim()
  const entry = morphs.find(
    (m) =>
      m.name.toLowerCase() === visible.toLowerCase() ||
      m.aliases.some((a) => a.toLowerCase() === visible.toLowerCase()),
  )
  const result = appearanceFromGenotypes(entry?.loci ?? {})
  if (entry?.category === 'unverified') result.verifiedAppearance = false
  const name = (entry?.name ?? visible).toLowerCase()
  if (name === 'midnight blizzard') result.body = 'melanistic'
  if (
    /black night|black pearl|black velvet|charcoal|carbon|akoya|melanistic|panda/.test(
      name,
    )
  )
    result.body = 'melanistic'
  if (
    /tangerine|shtct|sunglow|tangelo|firewater|hybino|hyglo|mandarin|blood|inferno|electric/.test(
      name,
    )
  )
    result.body = 'tangerine'
  if (/dark tangerine|chocolate orange/.test(name))
    result.body = 'dark-tangerine'
  if (/snow|galaxy|total eclipse|universe/.test(name)) result.body = 'snow'
  if (/super snow|super mack snow|galaxy|total eclipse/.test(name)) {
    result.pattern = 'fine-spots'
    result.eyes = 'solid-black'
  }
  if (
    /sunglow|hybino|hyglo|albino/.test(name) ||
    ['tremper', 'bell', 'rainwater'].some((id) => entry?.loci?.[id] === 2)
  ) {
    result.body = 'albino'
    result.eyes = result.eyes === 'solid-black' ? 'solid-red' : 'albino-slit'
  }
  if (
    /super hypo|shtct|sht$|sunglow|hybino|hyglo/.test(name) ||
    entry?.lineage?.includes('Super Hypo')
  )
    result.pattern = 'hypo'
  if (name === 'hypo' || name === 'hybino') result.pattern = 'reduced-spots'
  if (name === 'patternless stripe') result.pattern = 'hypo'
  if (
    /bold stripe|reverse stripe|white stripe|^stripe$|pinto$|red stripe|rainbow stripe/.test(
      name,
    )
  )
    result.pattern = 'stripe'
  if (/reverse stripe/.test(name)) result.pattern = 'reverse-stripe'
  if (name === 'banded') result.pattern = 'banded'
  if (name === 'circle back') result.pattern = 'circle-back'
  if (/jungle|aberrant|bandit|halloween mask/.test(name))
    result.pattern = 'jungle'
  if (
    /blizzard|murphy|diablo blanco|white knight/.test(name) ||
    entry?.loci?.blizzard === 2 ||
    entry?.loci?.patternless === 2
  ) {
    result.pattern = 'patternless'
    result.head = 'bald'
    result.tail = 'white'
  }
  if (/pied|piebald/.test(name))
    result.pattern = /super pied|s\. pied|high white|extreme pied/.test(name)
      ? 'high-white-pied'
      : 'pied'
  if (/white face|white nose/.test(name)) result.head = 'white'
  if (/baldy|shtctb/.test(name)) result.head = 'bald'
  if (name === 'carrot head') result.head = 'carrot'
  if (name === 'bandit') result.head = 'bandit'
  if (name === 'white & yellow') result.whiteSides = true
  if (/carrot tail|shtct/.test(name)) result.tail = 'carrot'
  if (/white tail/.test(name)) result.tail = 'white'
  result.whiteFeet = /white socks|white legs|white feet/.test(name)
  result.whiteNeck = /white neck/.test(name)
  if (/diorite|granite/.test(name)) {
    result.body = 'snow'
    result.pattern = 'fine-spots'
  }
  if (name === 'cipher') {
    result.eyes = 'solid-black'
    result.pattern = 'broken-stripe'
  }
  if (
    entry?.loci?.eclipse === 2 ||
    /eclipse|raptor|radar|typhoon|diablo blanco|white knight/.test(name)
  )
    result.eyes = result.body === 'albino' ? 'solid-red' : 'solid-black'
  if (/snake eye|partial eclipse/.test(name)) result.eyes = 'snake-eye'
  if (/marble eye|pinto eye/.test(name)) result.eyes = 'marbled'
  if (/noir desir|ndbe/.test(name)) result.eyes = 'dark-marbled'
  if (/blue amber|^bae$/.test(name)) result.eyes = 'blue-amber'
  if (/ruby eye|^red eye$/.test(name)) result.eyes = 'solid-red'
  return result
}

export function appearanceForParent(parent: Parent): VisualProfile {
  const result = appearanceForMorph(parent.morph)
  // Selected line traits inform the parent guide, never predicted hatchling ratios.
  for (const line of parent.lineage) {
    const modifier = appearanceForMorph(line)
    if (result.body === 'normal' && modifier.body !== 'normal')
      result.body = modifier.body
    if (result.pattern === 'spotted' && modifier.pattern !== 'spotted')
      result.pattern = modifier.pattern
    if (modifier.head !== 'spotted') result.head = modifier.head
    if (modifier.tail !== 'banded') result.tail = modifier.tail
  }
  const genotypes = Object.fromEntries(
    Object.entries(parent.loci).flatMap(([id, s]) =>
      s.kind === 'known' ? [[id, s.copies]] : [],
    ),
  ) as Record<string, Genotype>
  const genetic = appearanceFromGenotypes(genotypes)
  const albinoStates = ['tremper', 'bell', 'rainwater'].filter(
    (id) => id in parent.loci,
  )
  if (albinoStates.length) {
    if (albinoStates.some((id) => genotypes[id] === 2)) {
      result.body = 'albino'
      if (result.eyes === 'slit') result.eyes = 'albino-slit'
      else if (result.eyes === 'solid-black') result.eyes = 'solid-red'
    } else {
      if (result.body === 'albino') result.body = 'normal'
      if (result.eyes === 'albino-slit' || result.eyes === 'solid-red')
        result.eyes = genetic.eyes
    }
  }
  if ('snow' in genotypes) {
    if (genotypes.snow > 0) {
      result.body = genetic.body
      if (result.pattern === 'spotted' || result.pattern === 'fine-spots')
        result.pattern = genetic.pattern
      if (genotypes.snow === 2) result.eyes = genetic.eyes
    } else if (result.body === 'snow') result.body = 'normal'
  }
  if (
    'eclipse' in genotypes &&
    genotypes.eclipse !== 2 &&
    /eclipse|raptor|radar|typhoon|diablo blanco|white knight/i.test(
      parent.morph,
    )
  )
    result.eyes = genetic.eyes
  if (genotypes.eclipse === 2)
    result.eyes = ['tremper', 'bell', 'rainwater'].some(
      (id) => genotypes[id] === 2,
    )
      ? 'solid-red'
      : 'solid-black'
  if (genotypes.blizzard === 2 || genotypes.patternless === 2) {
    result.pattern = 'patternless'
    result.head = 'bald'
    result.tail = 'white'
  }
  if ('wy' in genotypes) result.whiteSides = genotypes.wy > 0
  return result
}

export type IllustrationAsset =
  | 'normal'
  | 'snow'
  | 'super'
  | 'albino'
  | 'tangerine'
  | 'hypo'
  | 'melanistic'
  | 'blizzard'
  | 'pied'
  | 'super-pied'
  | 'stripe'
  | 'jungle'
export function assetForAppearance(profile: VisualProfile): IllustrationAsset {
  const patterns: Partial<Record<BodyPattern, IllustrationAsset>> = {
    'fine-spots': 'super',
    hypo: 'hypo',
    'reduced-spots': 'hypo',
    patternless: 'blizzard',
    pied: 'pied',
    'high-white-pied': 'super-pied',
    stripe: 'stripe',
    'reverse-stripe': 'hypo',
    'broken-stripe': 'hypo',
    banded: 'hypo',
    'circle-back': 'hypo',
    jungle: 'jungle',
  }
  return (
    patterns[profile.pattern] ??
    (profile.body === 'dark-tangerine' ? 'tangerine' : profile.body)
  )
}
export function appearanceDescription(profile: VisualProfile): string {
  return `${profile.body.replaceAll('-', ' ')} cartoon leopard gecko; ${profile.pattern.replaceAll('-', ' ')} pattern; ${profile.eyes.replaceAll('-', ' ')} eyes${profile.verifiedAppearance ? '' : '; general species guide, this trade appearance is unverified'}`
}
