import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Replays a dated public-description snapshot; does not claim to refresh inventory.
const audit = JSON.parse(
  await readFile('src/tests/fixtures/faunary-listings.json', 'utf8'),
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
  const { morphs, preset } = await server.ssrLoadModule('/src/data/morphs.ts')
  const { faunaryLabels, canApplyLabel } = await server.ssrLoadModule(
    '/src/genetics/morph-search.ts',
  )
  const cell = (value) =>
    String(value || '—')
      .replaceAll('|', '\\|')
      .replaceAll('\n', ' ')
      .replaceAll('<', '&lt;')
  const field = (r, pattern) =>
    r.fields
      .filter((f) => pattern.test(f.key))
      .map((f) => f.value)
      .join('; ')
  const counts = {
    pairs: 0,
    calculated: 0,
    partial: 0,
    referenceOnly: 0,
    withheld: 0,
    clarification: 0,
  }
  function scenario(label) {
    const choices = {}
    parseShorthand(label).proposals.forEach((p, i) => {
      if (p.alternatives) choices[`${i}:morph`] = p.alternatives[0].name
      const m = p.alternatives?.[0] ?? p.morph
      if (m?.dosage && !p.uncertain) choices[`${i}:${m.dosage}`] = '1'
    })
    return parentFromLabel(blankParent(), label, choices)
  }
  function parentStatus(r) {
    if (r.kind !== 'leopard-gecko')
      return r.kind === 'bundle'
        ? 'Bundle: choose each animal separately'
        : 'Other-species genetics: excluded'
    const sire = field(r, /^(sire|father)$/),
      dam = field(r, /^(dam|mother)$/)
    if (!sire || !dam) return 'No complete stated parent pair'
    counts.pairs++
    try {
      const result = calculate({
        version: 1,
        assumeUnlisted: true,
        sire: scenario(sire),
        dam: scenario(dam),
        observed: '',
      })
      for (const l of result.loci)
        assert.equal(sum(l.distribution).exact, '1/1')
      if (result.outcomes.length)
        assert.equal(
          sum(result.outcomes.map((o) => o.probability)).exact,
          '1/1',
        )
      if (result.blocked) {
        counts.withheld++
        return 'Withheld: welfare label'
      }
      if (!result.outcomes.length) {
        counts.referenceOnly++
        return 'Family/reference/unknown information only'
      }
      if (result.unknown.length || result.limitations.length) {
        counts.partial++
        return `${result.loci.length} calculated traits; unknown: ${result.unknown.map((t) => t.name).join(', ')}`
      }
      counts.calculated++
      return `${result.loci.length} supported traits calculated`
    } catch (error) {
      if (error.code === 'ERR_ASSERTION') throw error
      counts.clarification++
      return `Review needed: ${error.message}`
    }
  }
  const rows = audit.records.map((r) => ({
    record: r,
    status: parentStatus(r),
  }))
  const direct = faunaryLabels.filter(canApplyLabel).length
  const example = calculate(preset('black-night-stripe-mp'))
  assert.deepEqual(
    example.loci[0].distribution.map((v) => v.exact),
    ['1/2', '1/2', '0/1'],
  )
  const report = `# Faunary leopard-gecko description and selection audit

Reviewed **9 November 2026** from [the requested Faunary catalog](https://faunary.id/catalog?category=leopard-gecko).

## Every description was retrieved

Read the **complete public descriptions of all ${audit.records.length} captured listings**, not only the titles: **${audit.publicCounts.sell} sale listings and ${audit.publicCounts.auction} auction listings**. The page's own public catalog API supplied the full description fields. Overlapping pages of 100 records, stepping by 75, and a first-page recheck avoided gaps while the catalog changed. The final snapshot contained ${audit.records.length} unique IDs, matching the final public totals. All descriptions were nonempty; the fixture records their original SHA-256 hashes and redacted-text lengths. The reviewed description text totaled ${audit.records.reduce((n, r) => n + r.descriptionCharacters, 0).toLocaleString('en-US')} characters after contact redaction.

Inspected morph, sire/dam, albino-line/class and other genetics notes throughout the descriptions, including parent fields marked with male/female symbols. A title is not substituted for a more specific description claim. The table below links every captured listing and records the genetic fields. Contact details, prices, seller profiles, delivery terms and photographs are not copied into the app or this report. This is a dated snapshot, not a claim to include future or unlinked historical listings.

## Added to the selections

- **${morphs.length} core indexed names**, including Black Night Tangerine Stripe, Black Night Tangerine, BNMP, MSBN, SSBN, SST/SSTBN, MSDB/SSDB, SSBE, Tremper Bold Stripe, Tremper Lavender and Emerine Red Stripe.
- **${faunaryLabels.length} searchable source-label variants**, drawn from listing titles and description morph/parent fields. These are wording variants and combinations, not ${faunaryLabels.length} independent genes. Search supports multiple words in any order. The most specific description names are retained alongside title variants.
- Pandora, Tiger, KYT, Ogre, Puma, Ablo and Melanistic remain family/project annotations without invented single-gene probabilities. TL, FT and BB remain unresolved breeder codes unless their full meaning is supplied. HT requires an explicit interpretation; T/R shorthand still requires review.
- MP continues to mean **Murphy Patternless**. BN h MP is a confirmed carrier; BNMP is the stated visual combination; BN ph MP or Bn pht mp remains an unspecified possible het. Missing probabilities are never filled with an invented 50% or 66%.
- Confirmed combination hets retain components already explicitly entered as visual: MST het DB keeps visual Tremper while recording Eclipse/Blizzard carrier states. A contradictory single-gene visual/het claim is still rejected.
- Recognized combinations can be selected directly from the search. ${direct} of the source-label variants take this direct route; ${faunaryLabels.length - direct} require review for missing probabilities, dominant dosage, unresolved text/strain, shorthand or conflicting claims. Review preserves unknowns and does not require breeder evidence notes.

## Requested pairing

The examples menu now includes **Black Night Tangerine Stripe × Black Night het MP**. Under the displayed assumption that the first parent does not carry MP, the offspring are **0% visual Murphy Patternless, 50% carriers and 50% non-carriers**. Black Night, Tangerine and Stripe stay in the family context; their shade/pattern expression receives no fabricated percentage. The common input typo Black Ngiht is normalized to Black Night rather than becoming a separate morph.

## Parent-pair replay

${counts.pairs} in-scope records supplied both parent descriptions. For a computational replay only, ambiguous shorthand uses the first explicitly offered interpretation and confirmed dominant traits use one-copy scenarios. These choices are **test scenarios, not source facts and not automatic UI defaults**. Unspecified possible-het probabilities remain unknown; the visible unlisted-gene assumption applies to omitted supported genes. No child genotype is inferred merely from its parents or its albino-line field.

| Replay status | Records |
| --- | --- |
| Supported entered traits calculated | ${counts.calculated} |
| Partial calculation with unknown traits | ${counts.partial} |
| Family/reference/unknown information only | ${counts.referenceOnly} |
| Existing welfare policy withheld predictions | ${counts.withheld} |
| Literal parent descriptions require clarification | ${counts.clarification} |
| Total parent records | ${counts.pairs} |

Every calculated distribution conserved an exact probability sum of 1. Review-required rows are preserved with the reason, not coerced into valid genotypes. Reproduce this report with **node scripts/audit-faunary.mjs**; that command replays the committed fixture rather than fetching a new live catalog.

## Exclusions

${audit.records.filter((r) => r.kind === 'other-species').length} records in the selected category explicitly contain African fat-tailed/Oreo/Zulu/Whiteout genetics. They are excluded from leopard-gecko selections. ${audit.records.filter((r) => r.kind === 'bundle').length} bundle listings are recorded but are not merged into a single parent genotype. Generic Amel/Patty wording does not establish a leopard-gecko albino strain or Murphy Patternless genotype; verify species and records where nomenclature is incomplete. Seller labels, pedigree and species classification are claims, not independent verification.

## All captured listings and description fields

Line/class fields below are context, not hidden-allele assertions. A replay status concerns the supplied parents, not proof that the advertised child has the claimed genotype.

| Listing / original title | Morph in description | Sire in description | Dam in description | Line / class | Parent-description replay |
| --- | --- | --- | --- | --- | --- |
${rows.map(({ record: r, status }) => `| [${cell(r.title)}](${r.url}) | ${cell(field(r, /^(morph|morp|morhp|genetic|genetika)$/))} | ${cell(field(r, /^(sire|father)$/))} | ${cell(field(r, /^(dam|mother)$/))} | ${cell(field(r, /line|class|strain/))} | ${cell(status)} |`).join('\n')}

## Source interpretation limits

Full descriptions were read, but logistics and health/quality sales claims are not genetics evidence. Free-text mentions and parent fields do not automatically turn into offspring alleles. Unresolved projects and codes remain recorded; possible visuals, unspecified albino strain, disputed snow relationships and possible compound hets require the same explicit review as manually entered labels. Names in the source-label selection index are naming examples, not verified pedigrees for the user's animal. No seller photograph is used to infer a hidden gene.
`
  await writeFile('docs/FAUNARY_AUDIT.md', report)
  console.log(
    JSON.stringify(
      {
        descriptions: audit.records.length,
        selections: faunaryLabels.length,
        direct,
        coreNames: morphs.length,
        parentReplay: counts,
      },
      null,
      2,
    ),
  )
} finally {
  await server.close()
}
