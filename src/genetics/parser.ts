import { morphs } from '../data/morphs'
import type { Morph } from '../data/morphs'
export interface Proposal {
  label: string
  morph?: Morph
  het?: 'known' | 'possible'
  chance?: number
  needsChoice?: boolean
}
export interface ParseResult {
  proposals: Proposal[]
  unresolved: string[]
}
/** Recognized expansions are proposals only. The user confirms before anything is applied. */
export function parseShorthand(input: string): ParseResult {
  let remaining = input.trim()
  const proposals: Proposal[] = []
  const candidates = morphs
    .flatMap((m) =>
      [m.name, ...m.aliases].map((alias) => ({ alias, morph: m })),
    )
    .sort((a, b) => b.alias.length - a.alias.length)
  for (const { alias, morph } of candidates) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const rx = new RegExp(
      `(^|[\\s,;+])(?:(\\d+(?:\\.\\d+)?)%?\\s+)?(?:(PH|H|het|possible het)\\s+)?${escaped}(?=$|[\\s,;+])`,
      'ig',
    )
    remaining = remaining.replace(
      rx,
      (_match, prefix: string, chance?: string, het?: string) => {
        const isPossible = het && /ph|possible/i.test(het)
        const isHet = Boolean(het)
        if (
          isHet &&
          (!morph.loci ||
            Object.keys(morph.loci).length !== 1 ||
            ![
              'tremper',
              'bell',
              'rainwater',
              'eclipse',
              'blizzard',
              'patternless',
            ].includes(Object.keys(morph.loci)[0]))
        )
          return _match
        proposals.push({
          label: `${isPossible ? `${chance ?? '?'}% possible het ` : isHet ? 'Het ' : ''}${morph.name}`,
          morph,
          het: isPossible ? 'possible' : isHet ? 'known' : undefined,
          chance: chance ? Number(chance) : undefined,
          needsChoice: Boolean(
            isPossible &&
              (!chance ||
                Number(chance) > 100 ||
                (chance.split('.')[1]?.length ?? 0) > 4),
          ),
        })
        return prefix
      },
    )
  }
  const unresolved = remaining.split(/[\s,;+]+/).filter(Boolean)
  return { proposals, unresolved }
}
