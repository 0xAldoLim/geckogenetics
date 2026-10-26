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
            ? m.lineage
            : filter === 'reference'
              ? !m.loci && !m.lineage && !m.risk
              : m.risk),
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search morphs, aliases, or characteristics…"
          />
        </label>
        <select
          aria-label="Filter morph category"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          <option value="genetic">Modeled genetics</option>
          <option value="line">Line-bred traits</option>
          <option value="welfare">Welfare concerns</option>
          <option value="reference">Reference / disputed</option>
        </select>
      </div>
      <p className="small muted">
        {entries.length} of {morphs.length} catalog entries · Reviewed 26
        October 2026 · Catalog coverage is broader than the calculation model.
      </p>
      <div className="library-grid">
        {entries.map((m) => {
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
            }}
          >
            Show all morphs
          </button>
        </div>
      )}
    </section>
  )
}
