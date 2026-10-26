import { useState } from 'react'
import { Grid2X2 } from 'lucide-react'
import type { Pairing, Genotype } from '../genetics/traits'
import { genotypeLabel } from '../genetics/traits'
import type { LocusResult } from '../genetics/inference'
import {
  distribution,
  gametes,
  nonVisualCarrier,
  stateForCalculation,
} from '../genetics/inference'
import { percent } from '../genetics/probability'
export default function PunnettSquare({
  pair,
  loci,
}: {
  pair: Pairing
  loci: LocusResult[]
}) {
  const [selected, setSelected] = useState('')
  const result = loci.find((l) => l.trait.id === selected) ?? loci[0]
  if (!result) return null
  const { trait, distribution: offspring } = result
  const a = distribution(stateForCalculation(pair, 'sire', trait.id))!,
    b = distribution(stateForCalculation(pair, 'dam', trait.id))!
  const paternal = gametes(a),
    maternal = gametes(b)
  const carrier =
    trait.inheritance === 'recessive' ? nonVisualCarrier(offspring) : null
  const allele = (i: number) =>
    i
      ? trait.inheritance === 'recessive'
        ? trait.symbol.toLowerCase()
        : trait.symbol
      : trait.inheritance === 'recessive'
        ? trait.symbol
        : '+'
  return (
    <details className="punnett-panel">
      <summary>
        <span>
          <Grid2X2 size={19} />
          <span>
            The science behind the pairing
            <small>Explore the Punnett square, one trait at a time.</small>
          </span>
        </span>
        <span className="details-plus">+</span>
      </summary>
      <div className="punnett-body">
        <div>
          <label className="field-label" htmlFor="punnett-trait">
            EXPLORE A TRAIT
          </label>
          <select
            id="punnett-trait"
            value={trait.id}
            onChange={(e) => setSelected(e.target.value)}
          >
            {loci.map((l) => (
              <option value={l.trait.id} key={l.trait.id}>
                {l.trait.name}
              </option>
            ))}
          </select>
          <p>
            Each parent passes on one allele. The chance of a cell is the
            father’s allele probability multiplied by the mother’s.
          </p>
          <p className="small muted">
            For possible hets, allele probabilities are weighted across the
            possible parental genotypes. Rows or columns with a zero chance
            remain visible for explanation.
          </p>
          {carrier && (
            <div className="carrier-callout">
              <strong>{percent(carrier)} possible het</strong>
              <p>
                Carrier probability <em>conditional on being non-visual</em> for{' '}
                {trait.name}. This differs from the unconditional percentage of
                all offspring.
              </p>
            </div>
          )}
          <p className="small">
            {trait.evidence}. {trait.caveat}
          </p>
        </div>
        <table className="punnett-table">
          <caption>
            {trait.name} · sire alleles across, dam alleles down
          </caption>
          <thead>
            <tr>
              <th scope="col">♀ / ♂</th>
              {paternal.map((p, i) => (
                <th key={i} scope="col">
                  {allele(i)}
                  <small>{percent(p)}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {maternal.map((m, i) => (
              <tr key={i}>
                <th scope="row">
                  {allele(i)}
                  <small>{percent(m)}</small>
                </th>
                {paternal.map((p, j) => (
                  <td key={j} className={p.mul(m).n === 0n ? 'zero-cell' : ''}>
                    <strong>{genotypeLabel(trait, (i + j) as Genotype)}</strong>
                    <span>{percent(p.mul(m))}</span>
                    <small>
                      {trait.visual[(i + j) as Genotype]}
                      {trait.inheritance === 'recessive' && i + j === 1
                        ? ' · carrier'
                        : ''}
                    </small>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
