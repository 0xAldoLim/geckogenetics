import { useState } from 'react'
import {
  ArrowUpRight,
  CheckCheck,
  Copy,
  Info,
  Leaf,
  Sparkles,
} from 'lucide-react'
import type { Pairing } from '../genetics/traits'
import { traits, genotypeLabel } from '../genetics/traits'
import {
  calculate,
  groupOutcomes,
  carrierInGroup,
  genotypeText,
} from '../genetics/inference'
import { percent, roundedPercentages, sum } from '../genetics/probability'
import MorphIllustration, { appearanceFor } from './MorphIllustration'
import PunnettSquare from './PunnettSquare'
const colors = [
  '#d7b55b',
  '#789d86',
  '#a3a5bd',
  '#c38367',
  '#82a5a7',
  '#ba9a6b',
  '#9aaf65',
  '#bd8ca0',
]
export function resultSummary(pair: Pairing) {
  const result = calculate(pair)
  return [
    'GeckoGenetics pairing',
    `${pair.sire.name || pair.sire.morph} × ${pair.dam.name || pair.dam.morph}`,
    ...groupOutcomes(result.outcomes, 'genotype').map(
      (g) => `${percent(g.probability)} ${g.title}`,
    ),
    `Modeled loci: ${result.loci.map((l) => l.trait.name).join(', ') || 'none'}. Unknown active loci: ${result.unknown.map((t) => t.name).join(', ') || 'none'}.`,
    `Possible-het assumptions: ${result.possible.join(', ') || 'none'}.`,
    'Conditional on entered genotypes, independent assortment, and complete Mendelian expression. Unspecified loci remain unknown. Per-egg expectations, not clutch guarantees. Appearance may be masked by other traits.',
    `Line-bred ancestry (no expression percentages): ${[...new Set([...pair.sire.lineage, ...pair.dam.lineage])].join(', ') || 'none recorded'}.`,
    `Sire evidence: ${pair.sire.evidence || 'not recorded'}. Dam evidence: ${pair.dam.evidence || 'not recorded'}.`,
    `Unresolved/reference labels: ${[...pair.sire.labels, ...pair.dam.labels].join(', ') || 'none'}.`,
    result.blocked
      ? 'Welfare concern: predictions withheld for this pairing.'
      : '',
    pair.observed
      ? `Observed hatchling label (not proof of parental genotype): ${pair.observed}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}
export default function Results({
  pair,
  onReference,
  notify,
}: {
  pair: Pairing
  onReference: (q: string) => void
  notify: (s: string) => void
}) {
  const [view, setView] = useState<'phenotype' | 'genotype'>('phenotype')
  const [limit, setLimit] = useState(12)
  const result = calculate(pair),
    groups = groupOutcomes(result.outcomes, view),
    rounded = roundedPercentages(groups.map((g) => g.probability))
  const lineage = [...new Set([...pair.sire.lineage, ...pair.dam.lineage])]
  const unmodeledLabels = [
    ...new Set([...pair.sire.labels, ...pair.dam.labels]),
  ]
  const chartGroups =
    groups.length > 8
      ? [
          ...groups.slice(0, 7),
          {
            title: `${groups.length - 7} other outcomes`,
            probability: sum(groups.slice(7).map((g) => g.probability)),
            outcomes: [],
          },
        ]
      : groups
  async function copy() {
    try {
      await navigator.clipboard.writeText(resultSummary(pair))
      notify('Results copied with assumptions and unknowns.')
    } catch {
      notify(
        'Clipboard unavailable. Use the text summary below to copy manually.',
      )
    }
  }
  return (
    <section
      className="results-section"
      id="results"
      aria-labelledby="results-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE NEXT GENERATION</span>
          <h2 id="results-heading">A world of possibilities.</h2>
          <p>Explore what your pairing could produce.</p>
        </div>
        <button className="text-button" onClick={copy}>
          <Copy size={15} /> Copy results
        </button>
      </div>
      {unmodeledLabels.length > 0 && !result.blocked && (
        <div className="notice">
          <Info size={18} />
          <p>
            Recorded labels outside the genetic model:{' '}
            <strong>{unmodeledLabels.join(', ')}</strong>. They do not enter the
            percentages. Results cover only the modeled loci; interactions with
            these labels and the final appearance remain unpredicted.
          </p>
        </div>
      )}
      {result.blocked && (
        <div className="welfare-warning" role="alert">
          <strong>Animal welfare comes first.</strong>
          <p>
            This pairing includes Lemon Frost or Enigma. Lemon Frost has a
            peer-reviewed association with iridophoroma; Enigma has reported
            neurological concerns. Breeding these morphs is discouraged.
            Predictions are withheld.
          </p>
          <button
            onClick={() =>
              onReference(
                [
                  pair.sire.morph,
                  pair.dam.morph,
                  ...pair.sire.labels,
                  ...pair.dam.labels,
                ].some((s) => /lemon frost/i.test(s))
                  ? 'Lemon Frost'
                  : 'Enigma',
              )
            }
            className="text-button"
          >
            Read the evidence <ArrowUpRight size={14} />
          </button>
        </div>
      )}
      {result.unknown.length > 0 && (
        <div className="notice">
          <Info size={18} />
          <div>
            <strong>
              More information needed for{' '}
              {result.unknown.map((t) => t.name).join(', ')}.
            </strong>
            <p>
              One parent’s genotype is unknown. Use Advanced genetics to enter
              documented status. These loci are excluded; any results below
              cover only the other modeled loci.
            </p>
          </div>
        </div>
      )}
      {!result.outcomes.length && !result.blocked && (
        <div className="empty-state">
          <DnaIcon />
          <h3>Start with what you know.</h3>
          <p>
            Choose a genetic trait for both parents, or try an educational
            preset. Unknown genotypes cannot produce a unique probability.
          </p>
        </div>
      )}
      {groups.length > 0 && (
        <>
          <div className="results-toolbar">
            <span className="model-status">
              <CheckCheck size={15} /> {result.loci.length} modeled{' '}
              {result.loci.length === 1 ? 'locus' : 'loci'} <span>·</span>{' '}
              {groups.length} possible outcomes
            </span>
            <div className="segmented" aria-label="Outcome view">
              <button
                className={view === 'phenotype' ? 'active' : ''}
                aria-pressed={view === 'phenotype'}
                onClick={() => setView('phenotype')}
              >
                By appearance
              </button>
              <button
                className={view === 'genotype' ? 'active' : ''}
                aria-pressed={view === 'genotype'}
                onClick={() => setView('genotype')}
              >
                By genotype
              </button>
            </div>
          </div>
          <div className="probability-overview">
            <div
              className="probability-bar"
              role="img"
              aria-label={chartGroups
                .map((g) => `${g.title} ${percent(g.probability)}`)
                .join(', ')}
            >
              {chartGroups.map((g, i) => (
                <div
                  key={g.title}
                  style={{
                    width: `${g.probability.value * 100}%`,
                    background: colors[i % colors.length],
                  }}
                  title={`${g.title}: ${percent(g.probability)}`}
                >
                  {g.probability.value >= 0.12 && percent(g.probability)}
                </div>
              ))}
            </div>
            <div className="chart-legend">
              {chartGroups.map((g, i) => (
                <span key={g.title}>
                  <i style={{ background: colors[i % colors.length] }} />
                  {g.title} <b>{percent(g.probability)}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="offspring-grid">
            {groups.slice(0, limit).map((g, i) => (
              <article key={`${view}-${g.title}`} className="offspring-card">
                <div className={`offspring-art art-${i % 3}`}>
                  <span className="outcome-number">
                    POSSIBILITY {String(i + 1).padStart(2, '0')}
                  </span>
                  <MorphIllustration appearance={appearanceFor(g.title)} />
                  <span
                    className="probability-badge"
                    style={{ borderColor: colors[i % colors.length] }}
                  >
                    {rounded[i]}
                  </span>
                </div>
                <div className="offspring-body">
                  <h3>
                    {g.title === 'Normal at modeled loci' &&
                    result.loci.length === 1 &&
                    result.loci[0].trait.id === 'snow'
                      ? 'Normal / Wild Type'
                      : g.title}
                  </h3>
                  <span className="outcome-category">
                    {g.outcomes.length > 1
                      ? `${g.outcomes.length} underlying genotypes`
                      : 'Calculated genotype'}
                  </span>
                  <p>
                    {g.outcomes.length === 1
                      ? genotypeText(g.outcomes[0])
                      : 'Grouped by expected expression; hidden carrier status varies.'}
                  </p>
                  <div className="carrier-list">
                    {traits
                      .filter(
                        (t) =>
                          t.inheritance === 'recessive' &&
                          result.loci.some((l) => l.trait.id === t.id),
                      )
                      .map((t) => {
                        const carrier = carrierInGroup(g, t.id)
                        return carrier.n ? (
                          <span key={t.id}>
                            <DnaIcon small />
                            {percent(carrier)}{' '}
                            {carrier.value === 1
                              ? 'confirmed het'
                              : 'possible het'}{' '}
                            {t.name} <small>(within this group)</small>
                          </span>
                        ) : null
                      })}
                  </div>
                  {lineage.length > 0 && (
                    <p className="small muted">
                      Lineage: {lineage.join(', ')}. Expression varies.
                    </p>
                  )}
                  <details className="outcome-detail">
                    <summary>
                      Inheritance breakdown <span>+</span>
                    </summary>
                    {g.outcomes.map((o, j) => (
                      <div key={j}>
                        <b>{percent(o.probability)} of all offspring</b>
                        {result.loci.map(({ trait }) => (
                          <p key={trait.id}>
                            {trait.name}:{' '}
                            <strong>
                              {genotypeLabel(trait, o.genotypes[trait.id])}
                            </strong>{' '}
                            · {trait.visual[o.genotypes[trait.id]]}
                          </p>
                        ))}
                      </div>
                    ))}
                  </details>
                </div>
              </article>
            ))}
          </div>
          {groups.length > limit && (
            <button
              className="small-button more-results"
              onClick={() => setLimit(limit + 12)}
            >
              Show 12 more outcomes ({groups.length - limit} remaining)
            </button>
          )}
          <p className="illustration-note">
            <Info size={13} /> Illustrative appearance, not guaranteed
            phenotype. Percentages are per egg, not a promise for any clutch.
          </p>
          <div className="assumptions-strip">
            <span>
              <CheckCheck size={15} /> Conditional on entered genotypes
            </span>
            <span>
              <DnaIcon small /> Independent assortment assumed
            </span>
            <span>
              <Info size={15} /> Unspecified loci remain unknown
            </span>
          </div>
          {result.possible.length > 0 && (
            <p className="notice">
              Possible-het estimates are included for{' '}
              {result.possible.join(', ')}. The engine averages over carrier and
              non-carrier parental possibilities, assuming those possibilities
              are independent.
            </p>
          )}
          <PunnettSquare pair={pair} loci={result.loci} />
        </>
      )}
      <div className="lineage-panel">
        <div className="lineage-icon">
          <Leaf size={24} />
        </div>
        <div>
          <span className="eyebrow">BEYOND THE PUNNETT SQUARE</span>
          <h3>Line-bred trait influence</h3>
          <p>
            {lineage.length
              ? 'Ancestry can shape the story. It cannot tell us the exact shade, pattern, or spotting of a hatchling.'
              : 'Add line-bred traits to either parent to explore their influence on color and pattern.'}
          </p>
          <div className="lineage-results">
            {lineage.map((l) => (
              <div key={l}>
                <span>
                  <Leaf size={13} />
                  {l}
                </span>
                <small>
                  {pair.sire.lineage.includes(l) && pair.dam.lineage.includes(l)
                    ? 'Both parents'
                    : pair.sire.lineage.includes(l)
                      ? 'Sire ancestry'
                      : 'Dam ancestry'}
                </small>
              </div>
            ))}
          </div>
          <p className="small muted">
            Tangerine intensity, Super Hypo spotting, Carrot Tail coloration,
            and melanistic lines have no validated single-locus expression
            percentages.
          </p>
        </div>
        <Sparkles className="lineage-sparkle" size={30} />
      </div>
      <details className="summary-details">
        <summary>Plain-text results & assumptions</summary>
        <textarea
          readOnly
          aria-label="Plain-text results"
          value={resultSummary(pair)}
        />
      </details>
    </section>
  )
}
function DnaIcon({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? 'dna-mini' : 'dna-large'} aria-hidden="true">
      ⌘
    </span>
  )
}
