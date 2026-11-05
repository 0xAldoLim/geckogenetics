import type { Pairing, LineTrait } from './traits'
import type { LocusResult } from './inference'

export const familyLines = (pair: Pairing): LineTrait[] => [
  ...new Set([...pair.sire.lineage, ...pair.dam.lineage]),
]

/** Family context describes ancestry; it never changes an outcome's probability. */
export const visibleTraitNames = (loci: readonly LocusResult[]): string[] =>
  loci
    .filter(({ trait, distribution: d }) =>
      trait.inheritance === 'recessive' ? d[2].n > 0n : d[1].n + d[2].n > 0n,
    )
    .map(({ trait }) => trait.name)

export function outcomeName(
  title: string,
  lines: readonly string[],
  visibleTraits: readonly string[] = [],
): string {
  if (!lines.length)
    return title.replace('Normal at modeled loci', 'Normal / Wild Type')
  const family = `${lines.join(' + ')} ${lines.length === 1 ? 'line' : 'lines'}`
  return title.includes('Normal at modeled loci')
    ? title.replace(
        'Normal at modeled loci',
        visibleTraits.length
          ? `${family} · without ${visibleTraits.join(' or ')}`
          : `${family} offspring`,
      )
    : `${title} · ${family}`
}
