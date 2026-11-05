import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Replays the dated source fixture; this script does not scrape live inventories.
const audit = JSON.parse(
  await readFile('src/tests/fixtures/marketplace-listings.json', 'utf8'),
)
const server = await createServer({
  configFile: false,
  cacheDir: '../catalog-vite-cache',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
})
try {
  const { parseShorthand, parentFromLabel } = await server.ssrLoadModule(
    '/src/genetics/parser.ts',
  )
  const { blankParent } = await server.ssrLoadModule('/src/genetics/traits.ts')
  const { calculate } = await server.ssrLoadModule('/src/genetics/inference.ts')
  const { sum } = await server.ssrLoadModule('/src/genetics/probability.ts')
  const { marketplaceExamples, marketplacePairing } =
    await server.ssrLoadModule('/src/data/marketplace-examples.ts')
  const records = audit.records
  const animals = records.filter((r) => r.kind === 'leopard-gecko')
  const pairs = animals.filter((r) => r.sire && r.dam)
  const males = animals.filter((r) => r.sex === 'male')
  const females = animals.filter((r) => r.sex === 'female')
  const text = (s) =>
    String(s ?? '—')
      .replaceAll('|', '\\|')
      .replaceAll('\n', ' ')
  const link = (r) => `[${text(r.id)}](${r.url})`

  function scenario(label) {
    const parsed = parseShorthand(label)
    const choices = {}
    const notes = []
    parsed.proposals.forEach((p, i) => {
      if (p.alternatives) {
        choices[`${i}:morph`] = p.alternatives[0].name
        notes.push(
          `Scenario chooses ${p.token} = ${p.alternatives[0].name}; UI requires review`,
        )
      }
      const m = p.alternatives?.[0] ?? p.morph
      if (m?.dosage && !p.uncertain) {
        choices[`${i}:${m.dosage}`] = '1'
        notes.push(
          `Scenario chooses one ${m.dosage} copy; source dosage unknown`,
        )
      }
      if (
        p.het === 'possible' &&
        (p.chance === undefined || Object.keys(m?.loci ?? {}).length > 1)
      )
        notes.push('Possible-het probability/joint state remains unknown')
      if (p.uncertain) notes.push('Possible visual remains unknown')
      if (m?.ambiguous) notes.push('Albino strain needs explicit confirmation')
      if (p.referenceOnly) notes.push('Lineage field is not an allele claim')
    })
    const interpreted = new Set(
      parsed.proposals.map((p) => p.token).filter(Boolean),
    )
    const unresolved = parsed.unresolved.filter(
      (word) => !interpreted.has(word),
    )
    if (unresolved.length)
      notes.push(`Reference text retained: ${unresolved.join(', ')}`)
    return {
      parent: parentFromLabel(blankParent(), label, choices),
      notes: [...new Set(notes)],
    }
  }
  const parentScenarios = new Map(animals.map((r) => [r, scenario(r.label)]))
  function check(sire, dam) {
    const r = calculate({
      version: 1,
      assumeUnlisted: true,
      sire,
      dam,
      observed: '',
    })
    for (const l of r.loci) assert.equal(sum(l.distribution).exact, '1/1')
    if (r.outcomes.length) {
      assert.equal(sum(r.outcomes.map((o) => o.probability)).exact, '1/1')
      assert(
        r.outcomes.every(
          (o) => o.probability.n >= 0n && o.probability.n <= o.probability.d,
        ),
      )
    } else assert(r.blocked || r.loci.length === 0)
    return r
  }
  const status = (r) =>
    r.blocked
      ? 'Withheld: welfare flag'
      : r.outcomes.length
        ? `${r.loci.length} calculated loci; ${r.outcomes.length} genotypes${r.unknown.length ? `; unknown: ${r.unknown.map((t) => t.name).join(', ')}` : ''}${r.limitations.length ? '; Mack/TUG excluded' : ''}`
        : `Reference/unknown only${r.unknown.length ? `: ${r.unknown.map((t) => t.name).join(', ')}` : ''}`
  const totals = {
    numericalCompleteAtEnteredLoci: 0,
    numericalPartial: 0,
    referenceOrUnknownOnly: 0,
    withheld: 0,
  }
  for (const sire of males)
    for (const dam of females) {
      const r = check(
        parentScenarios.get(sire).parent,
        parentScenarios.get(dam).parent,
      )
      if (r.blocked) totals.withheld++
      else if (!r.outcomes.length) totals.referenceOrUnknownOnly++
      else if (r.unknown.length || r.limitations.length)
        totals.numericalPartial++
      else totals.numericalCompleteAtEnteredLoci++
    }
  const sourcePairs = pairs.map((r) => ({
    record: r,
    result: check(scenario(r.sire).parent, scenario(r.dam).parent),
  }))
  const counts = ['HypeGecko', 'Wachi'].map((site) => {
    const all = records.filter((r) => r.site === site)
    const count = (kind) => all.filter((r) => r.kind === kind).length
    return `| ${site} | ${all.length} | ${count('leopard-gecko')} | ${count('other-species')} | ${count('non-animal')} |`
  })
  const report = `# HypeGecko and Wachi marketplace compatibility audit

Reviewed **5 November 2026**. This is a dated inventory and notation audit, not a live availability feed or verification of individual animals' genotypes.

## Pages actually inspected

Followed every catalog-linked product URL from [HypeGecko's shop](https://www.hypegecko.com/shop) (including page 2) and [Wachi](https://wachigecko.com/) (shop pages 1–16). All **${records.length} individual product pages** returned successfully. Wachi's genetics are in the last gallery image: all **112 animal genetics cards** were read using OCR, with representative and conflicting cards visually checked. The tables below preserve the transcribed morph and parent fields. No sire/dam record is invented where a Hype listing did not supply one.

| Shop | Product pages opened | Leopard geckos | Other species | Non-animal products |
| --- | --- | --- | --- | --- |
${counts.join('\n')}
| Total | 223 | 186 | 2 | 35 |

The two other-species records are African fat-tailed geckos with Oreo/Zulu genetics. They are excluded from the leopard-gecko calculation model. Accessories, medicine and probiotics are also excluded. Product images, prices and seller contact details are not republished.

## What the calculator now accepts

- Compact names such as Macksnow, SuperSnow, MST, MSE, SSE, MSTBN, MSEBN and SSEBN, with Black Night ancestry kept separate from exact single-gene probabilities.
- Dotted h. / ph., multiple hets, Eclipse/Ecl/EC, Boldstripe/BS, MP, Blizz, Tang, EM, RVS, RS and reviewed Pied/Super Pied labels.
- Confirmed combination hets such as het RAPTOR: Tremper and Eclipse carrier states, without treating the animal as visual for either gene.
- T, R, MSR/SSR and related ambiguous shorthand through an explicit interpretation. Choosing a meaning is required; context does not silently decide.
- Possible visuals, unspecified possible-het probabilities and compound possible-het relationships remain unknown. Numeric independent component probabilities require an explicit scenario confirmation.
- TUG Snow and Phantom through the [originator-reported dominant TUG model](https://theurbanreptile.com/collection/leopard-geckos/tug-snow/). One/two copies cannot be distinguished by appearance. The [originator's Phantom definition](https://theurbanreptile.com/collection/leopard-geckos/phantom/) includes TUG Snow and Tremper Sunglow components. No Super TUG appearance is invented. Mack/TUG relationships are unresolved, so those snow loci are excluded together when both are active; other supported genes still calculate.
- Cotton, Sunspot, Tomato, Tomato Emerine, TOE, Choco, HG, Afghan and Patty as project/line labels. Patty alone does not prove Murphy Patternless. Goblin remains a reference label without a verified complete component definition. Selected color/pattern lines do not receive fabricated Mendelian percentages.
- Line: Tremper or Line: Bell is ancestry context, not a visual/het genotype claim. Sunglow/Hybino strain uncertainty remains unresolved until a strain is selected. APTOR includes Tremper and selected patternless-stripe ancestry; it does not imply Murphy Patternless or Eclipse.

## Compatibility checks and their meaning

Replayed **${pairs.length} recorded leopard-gecko sire × dam descriptions** from Wachi and all **${males.length * females.length} advertised male × female listing scenarios** across the two shops (${males.length} male labels × ${females.length} female labels; ${animals.length - males.length - females.length} unsexed listings excluded from this cross-product). Sex here follows the listing title, not an independent sex determination; card identity conflicts are flagged below. Hype cross-shop scenarios are hypothetical, not recorded seller pairings.

For this computational audit only, ambiguous codes choose the first offered interpretation and confirmed dominant traits choose one variant copy. These choices are **explicit test scenarios, not facts inferred from the listings or defaults applied by the UI**. Missing possible-het probabilities stay unknown. Omitted active loci use the visible non-carrier estimate option. All calculated locus distributions and every joint outcome distribution sum to exactly 1 using rational arithmetic; no parser/calculation exceptions occurred.

| Cross-product result | Scenarios |
| --- | --- |
| Numerical result at all entered supported loci | ${totals.numericalCompleteAtEnteredLoci} |
| Numerical result for some loci; unknown/excluded loci remain | ${totals.numericalPartial} |
| Reference/unknown information only; no numerical distribution | ${totals.referenceOrUnknownOnly} |
| Predictions withheld by existing welfare policy | ${totals.withheld} |
| Total | ${males.length * females.length} |

“Numerical” does not mean that every trade-line characteristic, appearance, carrier status or project architecture is known. Line-bred colors and unverified names remain unquantified. The fixture and shared resolver are exercised by automated tests; this report is reproducible with **node scripts/audit-marketplace.mjs**. The script replays the dated fixture rather than claiming to refresh live listings.

## Four examples available in the app

${marketplaceExamples
  .map((e) => {
    const r = calculate(marketplacePairing(e.id))
    assert.equal(sum(r.outcomes.map((o) => o.probability)).exact, '1/1')
    return `- **${e.title}:** ${e.sire} × ${e.dam}. ${e.note} ${e.sources.map((s) => `[${s.label}](${s.url})`).join('; ')}.`
  })
  .join('\n')}

## Listing/card identity conflicts

These conflicts were visually checked. They are preserved rather than silently assigning one card to a different animal. Verify identity and sex with the breeder before relying on the associated parentage.

| Listing | Last-card identifier | Problem |
| --- | --- | --- |
${records
  .filter((r) => r.cardCodeMismatch)
  .map(
    (r) =>
      `| ${link(r)} | ${r.cardCode} | Identifier differs${['WB7322', 'WB7424', 'WB7425'].includes(r.id) ? '; card sex also differs from listing title' : ''} |`,
  )
  .join('\n')}

WB599 / WB0599 is only leading-zero formatting and is not counted as an identity mismatch. The WB7424 and WB7425 pages carry different numbered cards; their morph/parent fields below are literal card transcriptions, not corrected animal assignments.

## All HypeGecko leopard-gecko listings

Sire/dam fields were not supplied as structured parent records on these inspected product pages. Each listed animal can be used as a hypothetical parent through the reviewed label; its own ancestry is not fabricated.

| Listing | Advertised sex | Literal morph label | Review notes |
| --- | --- | --- | --- |
${animals
  .filter((r) => r.site === 'HypeGecko')
  .map(
    (r) =>
      `| ${link(r)} | ${r.sex} | ${text(r.label)} | ${text(parentScenarios.get(r).notes.join('; ') || 'Supported components plus reference ancestry as entered')} |`,
  )
  .join('\n')}

## All Wachi leopard-gecko genetics cards

The separate line column records context only. A calculation status describes the reviewed **parent pair**, not a validation that its advertised child matches those parents. Unknown genotypes, selected lines, masking and source errors can prevent such validation.

| Listing | Morph on card | Sire on card | Dam on card | Line field | Parent-pair scenario |
| --- | --- | --- | --- | --- | --- |
${sourcePairs.map(({ record: r, result }) => `| ${link(r)}${r.cardCodeMismatch ? ` (card ${r.cardCode}; verify identity)` : ''} | ${text(r.label)} | ${text(r.sire)} | ${text(r.dam)} | ${text(r.albinoLine)} | ${text(status(result))} |`).join('\n')}

## Other-species and non-animal exclusions

| Shop / listing | Category | Label / reason |
| --- | --- | --- |
${records
  .filter((r) => r.kind !== 'leopard-gecko')
  .map(
    (r) =>
      `| ${r.site} ${link(r)} | ${r.kind} | ${text(r.label ?? 'Accessory, probiotic or medicine; not an animal pairing input')} |`,
  )
  .join('\n')}

## Scope and source limitations

This covers the catalog-linked pages visible during review, including sold-out listings still exposed in those catalogs. It does not claim that every historical, unlinked, social-media or future product was found. OCR can misread image text; representative cards, all apparent code mismatches and the in-app examples were visually checked. Source labels are preserved for review, not presented as independently verified pedigrees. No exact gene is inferred from a photo, marketing name, albino-line field or undocumented possible-het claim.
`
  await writeFile('docs/MARKETPLACE_AUDIT.md', report)
  console.log(
    JSON.stringify(
      {
        productPages: records.length,
        animals: animals.length,
        recordedParentPairs: pairs.length,
        maleFemaleScenarios: males.length * females.length,
        totals,
      },
      null,
      2,
    ),
  )
} finally {
  await server.close()
}
