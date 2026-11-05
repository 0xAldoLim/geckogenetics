import { useState } from 'react'
import { ChevronDown, Dna, Info, Search, X, Check } from 'lucide-react'
import type { GeneticState, Parent } from '../genetics/traits'
import { traits, lineTraits, known } from '../genetics/traits'
import { applyMorph, addMorph, morphs } from '../data/morphs'
import {
  parseShorthand,
  chosenMorph,
  reviewLoci,
  parentFromLabel,
  type LabelChoices,
} from '../genetics/parser'
import MorphIllustration from './MorphIllustration'
import { appearanceForParent } from '../genetics/appearance'

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
  const [adding, setAdding] = useState(false)
  const [choices, setChoices] = useState<LabelChoices>({})
  const parsed = parseShorthand(search)
  const alreadyVisual = new Set(
    parsed.proposals.flatMap((p, i) => {
      const m = chosenMorph(p, i, choices)
      return !p.het && !p.uncertain && !p.referenceOnly
        ? Object.entries(m?.loci ?? {})
            .filter(([, g]) => g === 2)
            .map(([id]) => id)
        : []
    }),
  )
  const active = traits.filter(
    (t) => parent.loci[t.id] && parent.loci[t.id].kind !== 'unknown',
  )
  const selectedMorph = morphs.find((m) => m.name === parent.morph)
  const needsAlbinoStrain = morphs.some(
    (m) =>
      m.ambiguous && parent.morph.toLowerCase().includes(m.name.toLowerCase()),
  )
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
    try {
      onChange(parentFromLabel(parent, search, choices, adding))
      setSearch('')
      setReview(false)
      setAdding(false)
      setChoices({})
      setError('')
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Review the trait choices.',
      )
    }
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
          appearance={appearanceForParent(parent)}
          flip={role === 'Dam'}
        />
        <span className="specimen-caption">ILLUSTRATIVE APPEARANCE</span>
      </div>
      <div className="parent-body">
        <div className="morph-current">
          <div>
            <span className="field-label">MORPH & VISIBLE TRAITS</span>
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
            placeholder={
              adding
                ? 'Search a trait to add…'
                : 'Choose a morph or enter a combination…'
            }
            value={search}
            maxLength={200}
            onChange={(e) => {
              setSearch(e.target.value)
              setChoices({})
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
                  onChange(adding ? addMorph(parent, m) : applyMorph(parent, m))
                  setSearch('')
                  setAdding(false)
                }}
              >
                <span>{m.name}</span>
                <span>
                  {m.loci ? 'Genetic' : m.lineage ? 'Line-bred' : 'Reference'}
                </span>
              </button>
            ))}
            <button className="parse-button" onClick={() => setReview(true)}>
              <Dna size={15} /> Review combination / custom label
            </button>
          </div>
        )}
        {review && (
          <div className="parse-review">
            <strong>Confirm the expanded meaning</strong>
            {parsed.warnings.map((message) => (
              <p role="alert" key={message}>
                {message}
              </p>
            ))}
            {parsed.proposals.map((p, i) => {
              const m = chosenMorph(p, i, choices)
              const setChoice = (key: string, value: string) =>
                setChoices((current) => ({ ...current, [key]: value }))
              return (
                <div className="review-trait" key={i}>
                  <strong>{p.label}</strong>
                  {p.alternatives && (
                    <label>
                      Interpret {p.token}
                      <select
                        aria-label={`${role} meaning for ${p.token} ${i + 1}`}
                        value={choices[`${i}:morph`] ?? ''}
                        onChange={(e) =>
                          setChoice(`${i}:morph`, e.target.value)
                        }
                      >
                        <option value="">Choose the breeder's meaning</option>
                        {p.alternatives.map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {p.referenceOnly && (
                    <p className="small muted">
                      Lineage wording is retained without assigning visual or
                      carrier alleles.
                    </p>
                  )}
                  {m &&
                    !p.referenceOnly &&
                    reviewLoci(p, m).map((id) => {
                      const key = `${i}:${id}`
                      const carrier =
                        p.het === 'possible' && !p.uncertain && m.dosage !== id
                      if (
                        carrier &&
                        Object.keys(m.loci ?? {}).length > 1 &&
                        alreadyVisual.has(id)
                      )
                        return (
                          <p className="small muted" key={id}>
                            {traits.find((t) => t.id === id)?.name} is already
                            entered as visual; this possible-combination claim
                            applies only to its unresolved components.
                          </p>
                        )
                      const supplied =
                        carrier &&
                        Object.keys(m.loci ?? {}).length === 1 &&
                        p.chance !== undefined &&
                        !p.needsChoice
                      return (
                        <label key={id}>
                          {traits.find((t) => t.id === id)?.name}{' '}
                          {carrier ? 'carrier status' : 'copy-count scenario'}
                          <select
                            aria-label={`${role} review ${id} ${i + 1}`}
                            value={
                              choices[key] ?? (supplied ? 'source' : 'unknown')
                            }
                            onChange={(e) => setChoice(key, e.target.value)}
                          >
                            <option value="unknown">
                              Unknown / probability not supplied
                            </option>
                            {supplied && (
                              <option value="source">
                                {p.chance}% possible het (entered)
                              </option>
                            )}
                            {carrier ? (
                              <>
                                <option value="het">Confirmed het</option>
                                <option value="1/2">50% possible het</option>
                                <option value="33/50">
                                  66% possible het (literal)
                                </option>
                                <option value="2/3">
                                  66.67% possible het (exact 2/3)
                                </option>
                                <option value="none">Not carrying</option>
                              </>
                            ) : (
                              <>
                                <option value="0">
                                  0 copies / trait absent
                                </option>
                                <option value="1">1 copy</option>
                                <option value="2">2 copies</option>
                              </>
                            )}
                          </select>
                        </label>
                      )
                    })}
                  {p.het === 'possible' &&
                    m &&
                    Object.keys(m.loci ?? {}).length > 1 && (
                      <>
                        <p className="small muted">
                          A possible combination het does not establish separate
                          carrier probabilities. Keep components unknown, or
                          enter an explicit scenario from breeder records.
                        </p>
                        <label className="review-checkbox">
                          <input
                            type="checkbox"
                            checked={choices[`${i}:independent`] === 'yes'}
                            onChange={(e) =>
                              setChoice(
                                `${i}:independent`,
                                e.target.checked ? 'yes' : 'no',
                              )
                            }
                          />{' '}
                          Use independent component-het probabilities for this
                          scenario
                        </label>
                      </>
                    )}
                  {m?.ambiguous && (
                    <p className="small muted">
                      Choose the albino strain in the main controls after
                      confirming.
                    </p>
                  )}
                </div>
              )
            })}
            {parsed.unresolved.length > 0 && (
              <p>
                Unresolved: <b>{parsed.unresolved.join(', ')}</b>. Selected
                abbreviation meanings are applied above; other wording stays as
                a reference label.
              </p>
            )}
            <p className="muted">
              For example: Black Night het Tremper, or Mack Snow + Eclipse.
              {!parsed.proposals.length
                ? ' No recognized genetics will be changed.'
                : adding
                  ? ' These traits will be added to the current selection.'
                  : ' These traits will replace the current selection.'}
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
                    ? state.copies === 0
                      ? 'not carrying'
                      : state.copies === 1 && t.inheritance === 'recessive'
                        ? 'het (carrier)'
                        : t.inheritance === 'recessive'
                          ? 'visual'
                          : `${state.copies} ${state.copies === 1 ? 'copy' : 'copies'}`
                    : state.kind === 'possible'
                      ? `${Number(((state.n / state.d) * 100).toFixed(2))}% possible het`
                      : '?'}
                </b>
                <button
                  onClick={() => {
                    const loci = { ...parent.loci }
                    delete loci[t.id]
                    const visible = traits.flatMap((trait) => {
                      const s = loci[trait.id]
                      return s?.kind === 'known' &&
                        (trait.inheritance === 'recessive'
                          ? s.copies === 2
                          : s.copies > 0)
                        ? [trait.visual[s.copies]]
                        : []
                    })
                    const morph =
                      [
                        ...new Set([
                          ...parent.lineage,
                          ...visible,
                          ...parent.labels,
                        ]),
                      ]
                        .join(' + ')
                        .slice(0, 200) || 'Normal / Wild Type'
                    onChange({ ...parent, morph, loci })
                  }}
                  aria-label={`Remove ${role} ${t.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
          {!active.length && (
            <span className="muted small">
              {parent.lineage.length
                ? 'Breeding line selected. Add any known hets below.'
                : 'Add any known carrier traits below.'}
            </span>
          )}
        </div>
        <button
          className="text-button add-trait-button"
          onClick={() => {
            setAdding(!adding)
            setSearch('')
            setReview(false)
          }}
          aria-pressed={adding}
        >
          {adding ? 'Cancel adding a trait' : '+ Add another visible trait'}
        </button>
        <div className="het-picker">
          <label className="field-label" htmlFor={`${role}-het`}>
            HIDDEN TRAITS (HETS)
          </label>
          <select
            id={`${role}-het`}
            value=""
            onChange={(e) => {
              if (e.target.value) updateLocus(e.target.value, known(1))
            }}
          >
            <option value="">+ Add a het / carrier trait</option>
            {traits
              .filter((t) => {
                const state = parent.loci[t.id]
                return (
                  t.inheritance === 'recessive' &&
                  !(state?.kind === 'known' && state.copies > 0)
                )
              })
              .map((t) => (
                <option value={t.id} key={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <p className="small muted">
            A het carries a recessive gene without showing it.
          </p>
        </div>
        {needsAlbinoStrain && (
          <div className="het-picker">
            <label className="field-label" htmlFor={`${role}-albino-strain`}>
              ALBINO STRAIN
            </label>
            <select
              id={`${role}-albino-strain`}
              value={
                ['tremper', 'bell', 'rainwater'].find((id) => {
                  const state = parent.loci[id]
                  return state?.kind === 'known' && state.copies === 2
                }) ?? ''
              }
              onChange={(e) => {
                const loci = { ...parent.loci }
                for (const id of ['tremper', 'bell', 'rainwater']) {
                  const state = loci[id]
                  if (state?.kind === 'known' && state.copies === 2)
                    delete loci[id]
                }
                if (e.target.value) loci[e.target.value] = known(2)
                onChange({ ...parent, loci })
              }}
            >
              <option value="">Choose a strain if known</option>
              <option value="tremper">Tremper Albino</option>
              <option value="bell">Bell Albino</option>
              <option value="rainwater">Rainwater Albino</option>
            </select>
          </div>
        )}
        {traits
          .filter(
            (t) =>
              ['wy', 'tug'].includes(t.id) &&
              (parent.loci[t.id] || selectedMorph?.dosage === t.id),
          )
          .map((t) => {
            const state = parent.loci[t.id]
            return (
              <div className="het-picker" key={t.id}>
                <label
                  className="field-label"
                  htmlFor={`${role}-${t.id}-scenario`}
                >
                  {t.name.toUpperCase()} SCENARIO
                </label>
                <select
                  id={`${role}-${t.id}-scenario`}
                  value={
                    state?.kind === 'known' ? String(state.copies) : 'unknown'
                  }
                  onChange={(e) =>
                    updateLocus(
                      t.id,
                      e.target.value === 'unknown'
                        ? { kind: 'unknown' }
                        : known(Number(e.target.value) as 0 | 1 | 2),
                    )
                  }
                >
                  <option value="unknown">Choose copies if known</option>
                  <option value="1">One copy (scenario)</option>
                  <option value="2">Two copies</option>
                  <option value="0">Without {t.name}</option>
                </select>
                {t.id === 'tug' && (
                  <p className="small muted">
                    Originator-reported dominant model. A separate Super TUG
                    appearance is not assumed.
                  </p>
                )}
              </div>
            )
          })}
        <button
          className="advanced-toggle"
          onClick={() => setAdvanced(!advanced)}
          aria-expanded={advanced}
        >
          <span>
            <Dna size={15} /> More options & notes (optional)
          </span>
          <ChevronDown className={advanced ? 'rotated' : ''} size={16} />
        </button>
        {advanced && (
          <div className="advanced-fields">
            <p className="small muted">
              Set possible hets, mark a trait as unknown, or add breeder notes.
              These options are optional. A normal appearance cannot rule out
              hidden carrier genes.
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
            COLOR & PATTERN LINES{' '}
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
              More breeding lines in optional settings.
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
