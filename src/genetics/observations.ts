import { parseShorthand } from './parser'
import { calculate } from './inference'
import type { Pairing } from './traits'
export function compareObservation(pair: Pairing, input: string): string {
  const parsed = parseShorthand(input),
    result = calculate(pair)
  if (result.blocked)
    return 'Comparison withheld because this pairing includes a welfare concern. No parental alleles have been inferred.'
  const requirements = parsed.proposals
    .filter((p) => !p.het)
    .flatMap((p) => Object.entries(p.morph?.loci ?? {}))
    .filter(([id]) => result.loci.some((l) => l.trait.id === id))
  const untested =
    parsed.unresolved.length > 0 ||
    parsed.proposals.some(
      (p) =>
        p.het ||
        !p.morph?.loci ||
        Object.keys(p.morph.loci).some(
          (id) => !result.loci.some((l) => l.trait.id === id),
        ),
    )
  if (!requirements.length || !result.outcomes.length)
    return 'Comparison is inconclusive: there are no recognized, modeled visual traits to compare. Resolve shorthand and document both parents’ genotypes. No parental alleles have been inferred.'
  const possible = result.outcomes.some((o) =>
    requirements.every(([id, copies]) => o.genotypes[id] === copies),
  )
  return `${possible ? 'The recognized visual traits are compatible with at least one predicted genotype.' : 'The recognized visual traits are inconsistent with the entered genetic model. Check identifications, records, and model assumptions.'}${untested ? ' Some labels, carrier claims, or unmodeled traits cannot be compared.' : ''} Appearance alone does not verify the hatchling’s genotype or parentage. No parental alleles have been inferred.`
}
