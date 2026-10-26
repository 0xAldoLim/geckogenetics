import { useState } from 'react'
import { ChevronDown, Dna, Info, Search, X, Check } from 'lucide-react'
import type { GeneticState, Parent } from '../genetics/traits'
import { traits, lineTraits, genotypeLabel, known } from '../genetics/traits'
import { applyMorph, morphs } from '../data/morphs'
import { parseShorthand } from '../genetics/parser'
import MorphIllustration, { appearanceFor } from './MorphIllustration'

export default function ParentSelector({
  parent,
  role,
  onChange,
  onReference,
}: {
  parent: Parent
  role: 'Sire' | 'Dam'
  onChange: (p: Parent) => void
  onReference: (q: string) => void
}) {
  const [advanced, setAdvanced] = useState(false)
  const [search, setSearch] = useState('')
  const [review, setReview] = useState(false)
  const [error, setError] = useState('')
  const parsed = parseShorthand(search)
  const active = traits.filter(
    (t) => parent.loci[t.id] && parent.loci[t.id].kind !== 'unknown',
  )
  const selectedMorph = morphs.find((m) => m.name === parent.morph)
  const options = morphs
    .filter((m) =>
      `${m.name} ${m.aliases.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .slice(0, 8)
  const updateLocus = (id: string, state: GeneticState) =>
    onChange({ ...parent, loci: { ...parent.loci, [id]: state } })
  function confirmParsed() {
    if (parsed.proposals.some((p) => p.needsChoice)) {
      setError(
        'Specify a possible-het probability, e.g. 50% PH TA, then review again.',
      )
      return
    }
    const next = {
      ...parent,
      morph: search.slice(0, 200),
      loci: { ...parent.loci },
      lineage: [...parent.lineage],
      labels: [
        ...new Set([
          ...parent.labels,
          ...parsed.unresolved.map((s) => s.slice(0, 150)),
        ]),
      ].slice(0, 30),
    }
    const assignments = new Map<string, string>()
    for (const p of parsed.proposals) {
      if (!p.morph) continue
      for (const [id, copies] of Object.entries(p.morph.loci ?? {})) {
        const state: GeneticState =
          p.het === 'known'
            ? known(1)
            : p.het === 'possible'
              ? {
                  kind: 'possible',
                  n: Math.round(p.chance! * 10000),
                  d: 1000000,
                }
              : known(copies)
        if (
          assignments.has(id) &&
          assignments.get(id) !== JSON.stringify(state)
        ) {
          setError(
            `Conflicting entries for ${id}. Edit the text before confirming.`,
          )
          return
        }
        assignments.set(id, JSON.stringify(state))
        next.loci[id] = state
      }
      next.lineage = [...new Set([...next.lineage, ...(p.morph.lineage ?? [])])]
      if (
        p.morph.risk ||
        p.morph.ambiguous ||
        (!p.morph.loci && !p.morph.lineage)
      )
        next.labels = [...new Set([...next.labels, p.morph.name])].slice(0, 30)
    }
    onChange(next)
    setSearch('')
    setReview(false)
    setError('')
  }
  return (
    <section
      className={`parent-card ${role.toLowerCase()}`}
      aria-label={`${role} parent`}
    >
      <div className="parent-top">
        <div className="parent-role">
          <span className="sex-symbol">{role === 'Sire' ? '♂' : '♀'}</span>
          <div>
            <h2>
              {role}{' '}
              <span>{role === 'Sire' ? 'Male parent' : 'Female parent'}</span>
            </h2>
            <p>Choose the traits you know.</p>
          </div>
        </div>
        <span className="eyebrow">PARENT {role === 'Sire' ? '01' : '02'}</span>
      </div>
      <div className="specimen-stage">
        <span className="specimen-label">E. macularius</span>
        <div className="specimen-orbit" />
        <MorphIllustration
          appearance={appearanceFor(parent.morph)}
          flip={role === 'Dam'}
        />
        <span className="specimen-caption">ILLUSTRATIVE APPEARANCE</span>
      </div>
      <div className="parent-body">
        <div className="morph-current">
          <div>
            <span className="field-label">SELECTED MORPH</span>
            <h3>{parent.morph}</h3>
          </div>
          <button
            className="icon-button"
            onClick={() => onReference(parent.morph)}
            title="Read about this morph"
            aria-label={`About ${role} morph`}
          >
            <Info size={18} />
          </button>
        </div>
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label={`${role} morph search`}
            placeholder="Search a morph or enter shorthand…"
            value={search}
            maxLength={200}
            onChange={(e) => {
              setSearch(e.target.value)
              setReview(false)
              setError('')
            }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch('')
                setReview(false)
              }}
              aria-label={`Clear ${role} search`}
            >
              <X size={15} />
            </button>
          )}
        </label>
        {search && !review && (
          <div className="morph-options">
            {options.map((m) => (
              <button
                key={m.name}
                onClick={() => {
                  onChange(applyMorph(parent, m))
                  setSearch('')
                }}
              >
                <span>{m.name}</span>
                <span>
                  {m.loci ? 'Genetic' : m.lineage ? 'Line-bred' : 'Reference'}
                </span>
              </button>
            ))}
            <button className="parse-button" onClick={() => setReview(true)}>
              <Dna size={15} /> Review shorthand / custom label
            </button>
          </div>
        )}
        {review && (
          <div className="parse-review">
            <strong>Confirm the expanded meaning</strong>
            {parsed.proposals.map((p, i) => (
              <p key={i}>
                ✓ {p.label}
                {p.morph?.ambiguous
                  ? ' — albino strain still needs selection'
                  : ''}
              </p>
            ))}
            {parsed.unresolved.length > 0 && (
              <p>
                Unresolved: <b>{parsed.unresolved.join(', ')}</b>. These stay as
                labels and do not enter the calculation. MSEBN and SP have no
                assumed meaning. T can mean Tremper or Tangerine; edit it to the
                full name. H / PH need an identified recessive trait.
              </p>
            )}
            <p className="muted">
              For example: MS H TA, or 50% PH TA. Confirming adds known entries
              to the current genetics.
            </p>
            {error && <p role="alert">{error}</p>}
            <button className="small-button" onClick={confirmParsed}>
              <Check size={14} /> Confirm recognized traits
            </button>
          </div>
        )}
        {selectedMorph && (
          <p
            className={
              selectedMorph.risk
                ? 'selection-note parent-risk'
                : 'selection-note'
            }
            role={selectedMorph.risk ? 'alert' : undefined}
          >
            {selectedMorph.risk && <strong>Welfare concern. </strong>}
            {selectedMorph.note}
          </p>
        )}
        <div className="trait-chips">
          {active.map((t) => {
            const state = parent.loci[t.id]
            return (
              <span key={t.id} className="trait-chip">
                <Dna size={12} />
                {t.name}{' '}
                <b>
                  {state.kind === 'known'
                    ? genotypeLabel(t, state.copies)
                    : state.kind === 'possible'
                      ? `${Number(((state.n / state.d) * 100).toFixed(2))}% possible het`
                      : '?'}
                </b>
                <button
                  onClick={() => updateLocus(t.id, { kind: 'unknown' })}
                  aria-label={`Remove ${role} ${t.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
          {!active.length && (
            <span className="muted small">
              No confirmed single-locus genetics selected.
            </span>
          )}
        </div>
        <button
          className="advanced-toggle"
          onClick={() => setAdvanced(!advanced)}
          aria-expanded={advanced}
        >
          <span>
            <Dna size={15} /> Advanced genetics & evidence
          </span>
          <ChevronDown className={advanced ? 'rotated' : ''} size={16} />
        </button>
        {advanced && (
          <div className="advanced-fields">
            <p className="small muted">
              Genotypes are based on your records. A normal-looking gecko can
              carry recessive alleles. “Possible het” is a chance of being a
              carrier, not a fraction of an allele.
            </p>
            {traits.map((t) => {
              const state = parent.loci[t.id] ?? { kind: 'unknown' }
              return (
                <div key={t.id} className="locus-field">
                  <label htmlFor={`${role}-${t.id}`}>
                    {t.name}{' '}
                    <button
                      onClick={() => onReference(t.name)}
                      aria-label={`Learn ${role} ${t.name}`}
                      title={t.caveat}
                      className="inline-info"
                    >
                      <Info size={12} />
                    </button>
                  </label>
                  <select
                    id={`${role}-${t.id}`}
                    value={
                      state.kind === 'known' ? String(state.copies) : state.kind
                    }
                    onChange={(e) =>
                      updateLocus(
                        t.id,
                        e.target.value === 'unknown'
                          ? { kind: 'unknown' }
                          : e.target.value === 'possible'
                            ? { kind: 'possible', n: 1, d: 2 }
                            : known(Number(e.target.value) as 0 | 1 | 2),
                      )
                    }
                  >
                    <option value="unknown">Unknown genotype</option>
                    <option value="0">0 copies · documented non-carrier</option>
                    <option value="1">
                      1 copy ·{' '}
                      {t.inheritance === 'recessive'
                        ? 'confirmed het'
                        : t.visual[1]}
                    </option>
                    <option value="2">2 copies · {t.visual[2]}</option>
                    {t.inheritance === 'recessive' && (
                      <option value="possible">
                        Possible het · probability
                      </option>
                    )}
                  </select>
                  {state.kind === 'possible' && (
                    <div className="possible-field">
                      <span>Carrier probability</span>
                      <select
                        aria-label={`${role} ${t.name} possible het probability`}
                        value={`${state.n}/${state.d}`}
                        onChange={(e) => {
                          const [n, d] = e.target.value.split('/').map(Number)
                          updateLocus(t.id, { kind: 'possible', n, d })
                        }}
                      >
                        <option value="1/2">50%</option>
                        <option value="33/50">66% (literal)</option>
                        <option value="2/3">66.67% (exact 2/3)</option>
                        {!['1/2', '33/50', '2/3'].includes(
                          `${state.n}/${state.d}`,
                        ) && (
                          <option value={`${state.n}/${state.d}`}>
                            {(state.n / state.d) * 100}% (imported)
                          </option>
                        )}
                      </select>
                      <label>
                        Custom %{' '}
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.0001"
                          aria-label={`${role} ${t.name} custom carrier probability`}
                          value={Number(((state.n / state.d) * 100).toFixed(4))}
                          onChange={(e) => {
                            if (
                              e.currentTarget.validity.valid &&
                              e.currentTarget.value !== ''
                            )
                              updateLocus(t.id, {
                                kind: 'possible',
                                n: Math.round(
                                  e.currentTarget.valueAsNumber * 10000,
                                ),
                                d: 1000000,
                              })
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
            <label className="field-label" htmlFor={`${role}-name`}>
              Animal name (optional)
            </label>
            <input
              id={`${role}-name`}
              maxLength={100}
              value={parent.name}
              placeholder="e.g. Juniper"
              onChange={(e) => onChange({ ...parent, name: e.target.value })}
            />
            <label className="field-label" htmlFor={`${role}-evidence`}>
              Genotype evidence & parentage
            </label>
            <textarea
              id={`${role}-evidence`}
              value={parent.evidence}
              maxLength={2000}
              placeholder="Record breeder documentation, known parents, and assumptions…"
              onChange={(e) =>
                onChange({ ...parent, evidence: e.target.value })
              }
            />
          </div>
        )}
        <div className="lineage-picker">
          <span className="field-label">
            LINE-BRED TRAITS{' '}
            <span title="Selected ancestry may influence appearance, but cannot be assigned a reliable Mendelian percentage.">
              ⓘ
            </span>
          </span>
          <div>
            {lineTraits
              .filter((l, i) => advanced || i < 5 || parent.lineage.includes(l))
              .map((l) => (
                <button
                  key={l}
                  aria-pressed={parent.lineage.includes(l)}
                  className={
                    parent.lineage.includes(l)
                      ? 'line-chip selected'
                      : 'line-chip'
                  }
                  onClick={() =>
                    onChange({
                      ...parent,
                      lineage: parent.lineage.includes(l)
                        ? parent.lineage.filter((v) => v !== l)
                        : [...parent.lineage, l],
                    })
                  }
                >
                  {parent.lineage.includes(l) && <Check size={11} />} {l}
                </button>
              ))}
          </div>
          {!advanced && (
            <small className="more-lineage-note">
              More breeding lines in Advanced genetics.
            </small>
          )}
        </div>
        {parent.labels.length > 0 && (
          <p className="small unresolved">
            Preserved labels: {parent.labels.join(', ')}
          </p>
        )}
      </div>
    </section>
  )
}
