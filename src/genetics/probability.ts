const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b))
/** Reduced, exact fractions. Only presentation converts to floating point. */
export class Rational {
  readonly n: bigint
  readonly d: bigint
  constructor(n: bigint | number, d: bigint | number = 1) {
    let a = BigInt(n),
      b = BigInt(d)
    if (b === 0n) throw new Error('Zero denominator')
    if (b < 0n) {
      a = -a
      b = -b
    }
    const g = gcd(a < 0n ? -a : a, b)
    this.n = a / g
    this.d = b / g
  }
  add(b: Rational) {
    return new Rational(this.n * b.d + b.n * this.d, this.d * b.d)
  }
  mul(b: Rational) {
    return new Rational(this.n * b.n, this.d * b.d)
  }
  div(b: Rational) {
    return new Rational(this.n * b.d, this.d * b.n)
  }
  get value() {
    return Number(this.n) / Number(this.d)
  }
  get exact() {
    return `${this.n}/${this.d}`
  }
}
export const zero = new Rational(0)
export const one = new Rational(1)
export const sum = (values: Rational[]) =>
  values.reduce((a, b) => a.add(b), zero)
export const percent = (p: Rational) =>
  `${(p.value * 100).toLocaleString('en', { maximumFractionDigits: 2 })}%`
/** Largest-remainder allocation for an exhaustive chart: labels sum to exactly 100%. */
export function roundedPercentages(values: Rational[]): string[] {
  if (!values.length) return []
  const raw = values.map((p) => p.value * 10000),
    units = raw.map(Math.floor)
  const indices = raw
    .map((v, i) => ({ i, remainder: v - units[i] }))
    .sort((a, b) => b.remainder - a.remainder)
  const remaining = 10000 - units.reduce((a, b) => a + b, 0)
  for (let i = 0; i < remaining; i++) units[indices[i % indices.length].i]++
  return units.map((v) => `${Number((v / 100).toFixed(2))}%`)
}
