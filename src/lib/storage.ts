import { z } from 'zod'
import { traits, lineTraits } from '../genetics/traits'
import type { Pairing } from '../genetics/traits'
const state = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('unknown') }).strict(),
  z
    .object({
      kind: z.literal('known'),
      copies: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    })
    .strict(),
  z
    .object({
      kind: z.literal('possible'),
      n: z.number().int().min(0).max(1000000),
      d: z.number().int().min(1).max(1000000),
    })
    .strict()
    .refine((s) => s.n <= s.d),
])
const parent = z
  .object({
    name: z.string().max(100),
    morph: z.string().max(200),
    loci: z.record(
      z.string().refine((id) => traits.some((t) => t.id === id)),
      state,
    ),
    lineage: z
      .array(z.enum(lineTraits))
      .max(lineTraits.length)
      .refine((a) => new Set(a).size === a.length),
    evidence: z.string().max(2000),
    labels: z.array(z.string().max(150)).max(30),
  })
  .strict()
  .refine(
    (p) =>
      Object.entries(p.loci).every(
        ([id, s]) =>
          s.kind !== 'possible' ||
          traits.find((t) => t.id === id)?.inheritance === 'recessive',
      ),
    'Possible het requires a supported recessive locus',
  )
export const pairingSchema = z
  .object({
    version: z.literal(1),
    assumeUnlisted: z.boolean().optional(),
    sire: parent,
    dam: parent,
    observed: z.string().max(500),
  })
  .strict()
export function encodePairing(pair: Pairing): string {
  const valid = pairingSchema.parse(pair)
  const encoded = btoa(
    Array.from(new TextEncoder().encode(JSON.stringify(valid)), (b) =>
      String.fromCharCode(b),
    ).join(''),
  )
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
  if (encoded.length > 20000) throw new Error('Pairing is too large to share')
  return encoded
}
export function decodePairing(encoded: string): Pairing {
  if (encoded.length > 20000 || !/^[A-Za-z0-9_-]+$/.test(encoded))
    throw new Error('Invalid pairing link')
  const text = new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(
      atob(encoded.replaceAll('-', '+').replaceAll('_', '/')),
      (c) => c.charCodeAt(0),
    ),
  )
  return pairingSchema.parse(JSON.parse(text))
}
export const SAVED_KEY = 'geckogenetics.pairings.v1'
export const savedSchema = z
  .array(
    z
      .object({
        id: z.string().max(100),
        title: z.string().max(220),
        pair: pairingSchema,
      })
      .strict(),
  )
  .max(20)
export type SavedPair = z.infer<typeof savedSchema>[number]
export function readSaved(): SavedPair[] {
  const value = localStorage.getItem(SAVED_KEY)
  if (!value) return []
  return savedSchema.parse(JSON.parse(value))
}
