import { useState } from 'react'
import { ArrowUpRight, BookOpen, Search } from 'lucide-react'
import { morphs } from '../data/morphs'
import { traits } from '../genetics/traits'
import { references } from '../data/references'
import MorphIllustration, {
  appearanceFor,
} from '../components/MorphIllustration'
export default function Encyclopedia({
  initialSearch = '',
  onUse,
}: {
  initialSearch?: string
  onUse: (name: string) => void
}) {
  const [query, setQuery] = useState(initialSearch)
  const [filter, setFilter] = useState('all')
  const [limit, setLimit] = useState(24)
  const [source, setSource] = useState('all')
  const entries = morphs
    .filter((m) =>
      `${m.name} ${m.aliases.join(' ')} ${m.note}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter(
      (m) =>
        filter === 'all' ||
        (filter === 'genetic'
          ? m.loci
          : filter === 'line'
            ? m.lineage || m.category === 'line'
            : filter === 'eyes'
              ? m.category === 'eye' ||
                [
                  'Eclipse',
                  'Marble Eye',
                  'Noir Desir Black Eye',
                  'Blue Amber Eye',
                  'Cipher',
                ].includes(m.name)
              : filter === 'patterns'
                ? m.category === 'pattern' ||
                  [
                    'Blizzard',
                    'Murphy Patternless',
                    'Super Hypo',
                    'Hypo',
                    'Baldy',
                    'Jungle',
                    'Stripe',
                    'Bold Stripe',
                    'Reverse Stripe',
                  ].includes(m.name)
                : filter === 'reference'
                  ? !m.loci && !m.lineage && !m.risk
                  : m.risk),
    )
    .filter(
      (m) =>
        source === 'all' ||
        (source === 'unverified'
          ? m.category === 'unverified'
          : source === 'marketplace'
            ? m.refs?.some((id) => /morphmarket\.com/.test(references[id].url))
            : m.refs?.includes('london')),
    )
  return (
    <section className="encyclopedia">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A FIELD GUIDE TO POSSIBILITY</span>
          <h1>The morph library.</h1>
          <p>
            Get to know the traits, the terminology, and the evidence behind
            them.
          </p>
        </div>
        <BookOpen size={32} />
      </div>
      <div className="library-controls">
        <label className="search-input">
          <Search size={17} />
          <input
            autoFocus={Boolean(initialSearch)}
            aria-label="Search morph library"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setLimit(24)
            }}
            placeholder="Search morphs, aliases, or characteristics…"
          />
        </label>
        <select
          aria-label="Filter morph category"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setLimit(24)
          }}
        >
          <option value="all">All categories</option>
          <option value="genetic">Modeled genetics</option>
          <option value="line">Line-bred traits</option>
          <option value="welfare">Welfare concerns</option>
          <option value="reference">Reference / disputed</option>
          <option value="eyes">Eye traits</option>
          <option value="patterns">Pattern traits</option>
        </select>
        <select
          aria-label="Filter catalog source"
          value={source}
          onChange={(e) => {
            setSource(e.target.value)
            setLimit(24)
          }}
        >
          <option value="all">All sources</option>
          <option value="london">London masterlist</option>
          <option value="marketplace">Marketplace records</option>
          <option value="unverified">Unverified names</option>
        </select>
      </div>
      <p className="small muted">
        Showing {Math.min(limit, entries.length)} of {entries.length} matches ·{' '}
        {morphs.length} total catalog entries · Reviewed 26 October 2026.
      </p>
      <p className="catalog-note">
        A growing index of genes, patterns, eye traits, breeding lines, and
        marketplace names. A sales label is evidence that a name is used; it
        does not prove a new gene or establish an animal’s hidden genetics.
      </p>
      <div className="library-grid">
        {entries.slice(0, limit).map((m) => {
          const loci = traits.filter((t) => t.id in (m.loci ?? {}))
          const sources = [...new Set(m.refs ?? loci.flatMap((t) => t.refs))]
          if (!sources.length)
            sources.push(
              m.risk === 'frost'
                ? 'frost'
                : m.risk === 'enigma'
                  ? 'enigma'
                  : 'verse',
            )
          return (
            <article key={m.name} className="library-card">
              <div className="library-art">
                <MorphIllustration appearance={appearanceFor(m.name)} />
              </div>
              <div className="library-content">
                <span className={`category-tag ${m.risk ? 'risk' : ''}`}>
                  {m.risk
                    ? 'Welfare concern'
                    : loci.length
                      ? loci.length > 1
                        ? 'Combination morph'
                        : loci[0].inheritance.replaceAll('-', ' ')
                      : m.category
                        ? m.category === 'unverified'
                          ? 'Unverified name'
                          : `${m.category} · not a modeled gene`
                        : m.lineage
                          ? 'Line-bred / polygenic'
                          : 'Reference · not modeled'}
                </span>
                <h2>{m.name}</h2>
                {m.status && (
                  <p className="small">
                    <strong>Evidence:</strong> {m.status}
                  </p>
                )}
                {m.aliases.length > 0 && (
                  <p className="small muted">
                    Also known as {m.aliases.join(' · ')}
                  </p>
                )}
                <p>{m.note}</p>
                {loci.map((t) => (
                  <details key={t.id}>
                    <summary>{t.name} · genotype & caveats</summary>
                    <p>
                      {t.description} {t.caveat}
                    </p>
                    <p className="small">
                      Required copies: {m.loci?.[t.id]}. Evidence: {t.evidence}.
                    </p>
                  </details>
                ))}
                <div className="reference-links">
                  {sources.map((id) => (
                    <a
                      key={id}
                      href={references[id].url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {references[id].title}
                      <ArrowUpRight size={12} />
                    </a>
                  ))}
                </div>
                <button className="text-button" onClick={() => onUse(m.name)}>
                  Use in calculator <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {entries.length > limit && (
        <button
          className="small-button more-results"
          onClick={() => setLimit(limit + 24)}
        >
          Show 24 more entries ({entries.length - limit} remaining)
        </button>
      )}
      {entries.length === 0 && (
        <div className="empty-state">
          <h2>No matching morphs</h2>
          <p>
            Try a full name or a different abbreviation. A custom label can
            still be preserved in the calculator.
          </p>
          <button
            className="small-button"
            onClick={() => {
              setQuery('')
              setFilter('all')
              setSource('all')
              setLimit(24)
            }}
          >
            Show all morphs
          </button>
        </div>
      )}
    </section>
  )
}
