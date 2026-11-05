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
import MorphIllustration from './MorphIllustration'
import { offspringAppearanceExamples } from '../genetics/appearance'
import {
  familyLines,
  outcomeName,
  visibleTraitNames,
} from '../genetics/result-presentation'
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
      (g) =>
        `${percent(g.probability)} ${outcomeName(g.title, familyLines(pair), visibleTraitNames(result.loci))}`,
    ),
    `Modeled loci: ${result.loci.map((l) => l.trait.name).join(', ') || 'none'}. Unknown active loci: ${result.unknown.map((t) => t.name).join(', ') || 'none'}.`,
    `Possible-het assumptions: ${result.possible.join(', ') || 'none'}.`,
    ...result.limitations,
    pair.assumeUnlisted
      ? 'Unlisted active genes assumed not carried for this estimate. Explicitly unknown records stay unknown.'
      : 'Record-only mode: unspecified loci remain unknown.',
    ...result.assumed.map(
      ({ parent, trait }) => `Assumed non-carrier: ${parent} · ${trait.name}.`,
    ),
    'Conditional on entered genotypes, independent assortment, and complete Mendelian expression. Per-egg expectations, not clutch guarantees. Appearance may be masked by other traits.',
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
  const lineage = familyLines(pair)
  const unmodeledLabels = [
    ...new Set([...pair.sire.labels, ...pair.dam.labels]),
  ].filter(
    (label) =>
      !lineage.some((line) => line.toLowerCase() === label.toLowerCase()) &&
      !result.loci.some(
        ({ trait }) => trait.name.toLowerCase() === label.toLowerCase(),
      ),
  )
  const displayTitle = (title: string) =>
    outcomeName(title, lineage, visibleTraitNames(result.loci))
  const chartGroups =
    groups.length > 8
      ? [
          ...groups.slice(0, 7),
          {
            key: 'overflow',
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
            Also recorded: <strong>{unmodeledLabels.join(', ')}</strong>. We
            don’t have a reliable percentage for these labels. They stay with
            your pairing, but the final look can vary.
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
              We need to know whether each parent shows or carries these traits.
              Update the parent’s selection or optional settings. The results
              below cover the traits we can calculate.
            </p>
          </div>
        </div>
      )}
      {result.limitations.map((text) => (
        <p className="notice" key={text}>
          {text}
        </p>
      ))}
      {!result.outcomes.length && !result.blocked && !lineage.length && (
        <div className="empty-state">
          <DnaIcon />
          <h3>Start with what you know.</h3>
          <p>
            Choose each parent’s morph and add any het traits. You can combine
            traits freely or start with an example pairing.
          </p>
        </div>
      )}
      {lineage.length > 0 && !result.blocked && (
        <div className="family-summary">
          <Leaf size={23} aria-hidden="true" />
          <div>
            <strong>{lineage.join(' + ')} stays in the family.</strong>
            <p>
              {lineage.every(
                (line) =>
                  pair.sire.lineage.includes(line) &&
                  pair.dam.lineage.includes(line),
              )
                ? 'Both parents have this family background.'
                : 'The young share their parents’ color and pattern backgrounds.'}{' '}
              Shade and markings can vary.{' '}
              {groups.length > 0
                ? 'The percentages below apply to the named traits and carriers—not to how dark or colorful a baby will be.'
                : 'There is no reliable percentage for exactly how the young will look.'}
            </p>
          </div>
        </div>
      )}
      {!groups.length && lineage.length > 0 && !result.blocked && (
        <article className="family-only-result">
          <h3>{displayTitle('Normal at modeled loci')}</h3>
          <OffspringExamples genotypes={{}} lineage={lineage} />
          <p>
            Color and pattern examples only. A baby may look different from
            either example.
          </p>
        </article>
      )}
      {groups.length > 0 && (
        <>
          {result.assumed.length > 0 && (
            <div className="notice calculation-assumptions">
              <Info size={18} />
              <p>
                <strong>For this estimate:</strong>{' '}
                {result.assumed
                  .map(
                    ({ parent, trait }) =>
                      `${parent === 'Sire' ? 'Male parent' : 'Female parent'} ${trait.inheritance === 'recessive' ? 'does not carry' : 'does not have'} ${trait.name}`,
                  )
                  .join('; ')}
                . Change the parent’s traits if your records differ.
              </p>
            </div>
          )}
          <div className="gene-probabilities">
            {result.loci.map(({ trait, distribution: d }) => {
              const entries =
                trait.inheritance === 'recessive'
                  ? [
                      { label: `Shows ${trait.name}`, chance: d[2] },
                      { label: 'Carries it (het)', chance: d[1] },
                      { label: 'Not carrying', chance: d[0] },
                    ]
                  : trait.inheritance === 'dominant'
                    ? [
                        { label: trait.name, chance: d[1].add(d[2]) },
                        { label: 'Without this trait', chance: d[0] },
                      ]
                    : d.map((chance, i) => ({
                        label:
                          trait.id === 'snow' && i === 0
                            ? 'Without Mack Snow'
                            : trait.visual[i],
                        chance,
                      }))
              return (
                <article
                  key={trait.id}
                  aria-label={`${trait.name} probabilities`}
                >
                  <h3>{trait.name}</h3>
                  <dl>
                    {entries.map(({ label, chance }) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{percent(chance)}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              )
            })}
          </div>
          <div className="results-toolbar">
            <span className="model-status">
              <CheckCheck size={15} /> {result.loci.length}{' '}
              {result.loci.length === 1 ? 'trait' : 'traits'} calculated{' '}
              <span>·</span> {groups.length} possible results
            </span>
            <div className="segmented" aria-label="Outcome view">
              <button
                className={view === 'phenotype' ? 'active' : ''}
                aria-pressed={view === 'phenotype'}
                onClick={() => setView('phenotype')}
              >
                Simple results
              </button>
              <button
                className={view === 'genotype' ? 'active' : ''}
                aria-pressed={view === 'genotype'}
                onClick={() => setView('genotype')}
              >
                Genetics details
              </button>
            </div>
          </div>
          <div className="probability-overview">
            <div
              className="probability-bar"
              role="img"
              aria-label={chartGroups
                .map(
                  (g) => `${displayTitle(g.title)} ${percent(g.probability)}`,
                )
                .join(', ')}
            >
              {chartGroups.map((g, i) => (
                <div
                  key={g.key}
                  style={{
                    width: `${g.probability.value * 100}%`,
                    background: colors[i % colors.length],
                  }}
                  title={`${displayTitle(g.title)}: ${percent(g.probability)}`}
                >
                  {g.probability.value >= 0.12 && percent(g.probability)}
                </div>
              ))}
            </div>
            <div className="chart-legend">
              {chartGroups.map((g, i) => (
                <span key={g.key}>
                  <i style={{ background: colors[i % colors.length] }} />
                  {displayTitle(g.title)} <b>{percent(g.probability)}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="offspring-grid">
            {groups.slice(0, limit).map((g, i) => (
              <article key={`${view}-${g.key}`} className="offspring-card">
                <div className={`offspring-art art-${i % 3}`}>
                  <span className="outcome-number">
                    POSSIBILITY {String(i + 1).padStart(2, '0')}
                  </span>
                  <OffspringExamples
                    genotypes={g.outcomes[0].genotypes}
                    lineage={lineage}
                  />
                  <span
                    className="probability-badge"
                    style={{ borderColor: colors[i % colors.length] }}
                  >
                    {rounded[i]}
                  </span>
                </div>
                <div className="offspring-body">
                  <h3>{displayTitle(g.title)}</h3>
                  <span className="outcome-category">
                    {lineage.length
                      ? 'Family shade and markings can vary'
                      : 'Chance for each egg'}
                  </span>
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
                            {carrier.value === 1
                              ? `All carry ${t.name} (het)`
                              : `${percent(carrier)} may carry ${t.name} (possible het)`}
                            {carrier.value !== 1 && (
                              <small>among these offspring</small>
                            )}
                          </span>
                        ) : null
                      })}
                  </div>
                  {lineage.length > 0 && (
                    <div
                      className="offspring-family-tags"
                      aria-label="Family lines"
                    >
                      {lineage.map((line) => (
                        <span key={line}>
                          <Leaf size={12} aria-hidden="true" />
                          {line} line
                        </span>
                      ))}
                    </div>
                  )}
                  <details className="outcome-detail">
                    <summary>
                      Why this result? <span>+</span>
                    </summary>
                    <p>
                      {g.outcomes.length > 1
                        ? `${g.outcomes.length} genetic combinations are included in this result.`
                        : genotypeText(g.outcomes[0])}
                    </p>
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
            <Info size={13} /> Pictures are examples, not exact predictions.
            Each egg has its own chance; a clutch may have different results.
          </p>
          <div className="assumptions-strip">
            <span>
              <CheckCheck size={15} /> Based on the parent details you entered
            </span>
            <span>
              <DnaIcon small /> Trait chances calculated separately
            </span>
            <span>
              <Info size={15} />{' '}
              {pair.assumeUnlisted
                ? 'Unlisted hidden traits assumed absent'
                : 'Unlisted traits stay unknown'}
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
          <span className="eyebrow">THE FAMILY BACKGROUND</span>
          <h3>
            {lineage.length
              ? `${lineage.join(' + ')} family lines`
              : 'Color & pattern lines'}
          </h3>
          <p>
            {lineage.length
              ? 'These names stay in your results because they describe the parents’ family background. Young from the same parents can have different shades and markings.'
              : 'Add a color or pattern line to either parent to keep it visible in the results.'}
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
                      ? 'Male parent'
                      : 'Female parent'}
                </small>
              </div>
            ))}
          </div>
          <p className="small muted">
            {lineage.length && !result.loci.length && !result.unknown.length
              ? 'This pairing is ready. Add any known hets if you also want to calculate hidden-trait chances.'
              : 'The percentages describe specific traits, not a guaranteed shade or quality.'}
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
function OffspringExamples({
  genotypes,
  lineage,
}: {
  genotypes: Parameters<typeof offspringAppearanceExamples>[0]
  lineage: ReturnType<typeof familyLines>
}) {
  const examples = offspringAppearanceExamples(genotypes, lineage)
  return (
    <div
      className={`offspring-examples ${examples.length > 1 ? 'multiple-examples' : ''}`}
    >
      {examples.map((appearance, i) => (
        <figure key={i}>
          <MorphIllustration appearance={appearance} />
          {examples.length > 1 && (
            <figcaption>
              {examples[1].body === 'melanistic'
                ? i === 0
                  ? 'Lighter example'
                  : 'Darker example'
                : i === 0
                  ? 'Trait example'
                  : 'Family line example'}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
function DnaIcon({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? 'dna-mini' : 'dna-large'} aria-hidden="true">
      ⌘
    </span>
  )
}
