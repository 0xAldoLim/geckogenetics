import { blankParent, type Pairing } from '../genetics/traits'
import { parentFromLabel, type LabelChoices } from '../genetics/parser'

export const marketplaceExamples: {
  id: string
  title: string
  sire: string
  dam: string
  sireChoices?: LabelChoices
  damChoices?: LabelChoices
  sources: { label: string; url: string }[]
  note: string
}[] = [
  {
    id: 'market-wachi-7440',
    title: 'Wachi WB7440 · recorded Snow/Eclipse parents',
    sire: 'Macksnow Eclipse BN',
    dam: 'Supersnow Eclipse BN',
    sources: [
      {
        label: 'Wachi WB7440 genetics card',
        url: 'https://wachigecko.com/product/wb7440-f-senyum2-ireng-%f0%9f%a5%b9-mata-full-hitam-%e2%9a%ab%ef%b8%8f%f0%9f%91%85%e2%9a%ab%ef%b8%8f/',
      },
    ],
    note: 'Recorded sire and dam from the final listing image. Expect 50% Mack Snow and 50% Super Snow at the Snow locus, with Eclipse in both groups. The separate Line: Tremper field is not a Tremper carrier claim. Black Night darkness is not assigned a percentage.',
  },
  {
    id: 'market-wachi-7419',
    title: 'Wachi WB7419 · Bandit / Bold Stripe het Tremper',
    sire: 'Bandit het Tremper',
    dam: 'Macksnow Bandit Boldstripe het Tremper',
    sources: [
      {
        label: 'Wachi WB7419 genetics card',
        url: 'https://wachigecko.com/product/wb7419-f-jalan-tol-albino-%e2%9c%a8/',
      },
    ],
    note: 'Recorded parent descriptions. Tremper gives 25% visual, 50% carriers and 25% non-carriers. Snow gives 50% Mack Snow under the displayed non-carrier assumption for the sire. Bandit and Bold Stripe remain selected pattern ancestry.',
  },
  {
    id: 'market-hype-multi',
    title: 'Hype HYP95 × A43 · Snow / Tremper / Eclipse / MP',
    sire: 'MST BN h. Eclipse',
    dam: 'SuperSnow Tremper BN h. MP h. Eclipse',
    sources: [
      {
        label: 'Hype HYP95',
        url: 'https://www.hypegecko.com/product-page/mst-bn-h-eclipse-male-hyp95-pink-colorr-lucu-banget',
      },
      {
        label: 'Hype A43',
        url: 'https://www.hypegecko.com/product-page/supersnow-tremper-bn-h-mp-h-eclipse-female-a43-cakep-banget-collectors-item',
      },
    ],
    note: 'An illustrative pairing of two listed animals, not a claim that the seller bred this pair. Four modeled loci produce 12 genotype outcomes. The sire is assumed non-carrier for Murphy Patternless; add a het if records differ.',
  },
  {
    id: 'market-wachi-tug',
    title: 'Wachi WB7439 · TUG Snow, one-copy scenario',
    sire: 'TUG Snow',
    dam: 'TUG Snow',
    sireChoices: { '0:tug': '1' },
    damChoices: { '0:tug': '1' },
    sources: [
      {
        label: 'Wachi WB7439 genetics card',
        url: 'https://wachigecko.com/product/wb7439-f-snow-guenduttt-%f0%9f%a4%97%e2%9d%84%ef%b8%8f/',
      },
    ],
    note: 'Both parents are explicitly assumed to have one TUG variant copy for this example; the listing does not supply copy counts. The originator-reported dominant model gives 75% TUG Snow and 25% without TUG. No Super TUG appearance or joint Mack/TUG model is assumed.',
  },
]
export function marketplacePairing(id: string): Pairing {
  const example = marketplaceExamples.find((e) => e.id === id)
  if (!example) throw new Error('Unknown marketplace example')
  const sire = parentFromLabel(blankParent(), example.sire, example.sireChoices)
  const dam = parentFromLabel(blankParent(), example.dam, example.damChoices)
  const evidence = `Breeder-claimed educational example reviewed 5 November 2026. ${example.note} ${example.sources.map((s) => s.url).join(' ')}`
  sire.evidence = dam.evidence = evidence
  return { version: 1, assumeUnlisted: true, sire, dam, observed: '' }
}
