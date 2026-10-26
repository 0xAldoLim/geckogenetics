import { createServer } from 'vite'
import { writeFile, mkdir } from 'node:fs/promises'

const server = await createServer({
  configFile: false,
  cacheDir: '../catalog-vite-cache',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
})
try {
  const { morphs } = await server.ssrLoadModule('/src/data/morphs.ts')
  const { traits } = await server.ssrLoadModule('/src/genetics/traits.ts')
  const { references } = await server.ssrLoadModule('/src/data/references.ts')
  const clean = (value) =>
    String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
  const header = `# Genetics references and morph catalog

Reviewed **26 October 2026**. This catalog has **${morphs.length} entries**, including named breeding lines, descriptive appearances, and combination morphs. It does not claim exhaustive coverage of every trade name on the web. The calculation model covers **eight loci**; catalog inclusion is not molecular confirmation or permission to assume independent inheritance.

## Research method and access limitations

Research compared the requested sources with breeder-originator documentation, a primary breeder catalog, community nomenclature records, and peer-reviewed research. Conflicting claims are preserved as uncertainty. A catalog name can be known while a particular animal’s genotype remains unknown.

- **Gecko Labs (2015):** inspected the Gecko Forums mirror. The original Facebook note was inaccessible. The published Tremper/Eclipse six-genotype example is a regression fixture. The engine uses exact 2/3 for the usual conditional possible-het calculation. The article’s final claim that non-visual Eclipse offspring of that example are 50% possible het conflicts with its own 1:2:1 Eclipse distribution; this application uses 2/3 for those non-visuals.
- **Geckoboa genetics page:** the requested URL and an alternative legacy URL returned no inspectable article or failed. Its contents are not claimed as inspected. The accessible Geckoverse reference was used for directly inspectable breeder information, including its Cipher account. This is a limitation, not independent verification of all Geckoboa claims.
- **ReptiMate:** inspected the genetics selector and line-bred-trait explanation. Used as a breeder-supported model reference, not proof of molecular identity, linkage, health, or every listed classification.
- **Guo et al. (2021):** inspected the PLOS full text after the DOI resolver failed. It reports semidominant Lemon Frost segregation, iridophoroma association, and a strong SPINT1 candidate region. The exact causal variant was not resolved. No colony-level tumor incidence is converted into an individual risk forecast.
- **Guo & Kruglyak (2023):** the publisher’s direct page returned 403, but an indexed abstract and Lemon Frost sections were available in search. Full-text inspection is not claimed. The 2021 primary paper anchors the app’s welfare behavior.
- **Mack Super Snow:** inspected the University of Geneva research summary identifying PAX7 and altered chromatophore development, linked to DOI 10.1073/pnas.2400486121. Exact molecular coordinates are not required by the inheritance model.
- **Albino strains:** inspected indexed excerpts of Gamble et al. (2006) documenting separate recessive strains and complementation. A newer Genetics paper, DOI 10.1093/genetics/iyaf236, appeared in search, but its publisher full text was inaccessible. Its candidate-gene assignments are not represented as independently inspected or functionally proven here.
- **Enigma:** inspected Bargen’s 2013 breeder account. It explicitly describes hypotheses and a need for further testing. No speculative neurological mechanism, homozygous lethality, incidence, or diagnosis is adopted.
- **Expanded names:** inspected Ron Tremper’s BAE, historical Giant, and Pastel pages, Geckos Etc.’s morph catalog, Geckoverse, and MorphMarket’s community masterlist. The Morphpedia index exposed only a shell; indexed entries and the inspectable Bell article supplemented it. The community list is evidence of naming conventions and disagreements, not controlled genetics proof.

## Expanded naming index and marketplace checks

The index was expanded using the requested [Leopard Geckos London masterlist](https://www.leopardgeckoslondon.com/post/leopard-gecko-morph-masterlist), current breeder inventories, and seller-authored MorphMarket records. The masterlist is a breeder visual reference, not molecular proof; its blanket health claims are not adopted as established incidence. MorphMarket, Geckos Etc., B&M Gecko, OnlineGeckos, GwenGecko and HypeGecko were examined for names and project usage. B&M's separate Genetic Library page was only a coming-soon page, so it was not treated as genetics evidence.

Pied is recorded as a pattern descriptor; a cited Pied Galaxy listing separately documents Super Snow and Eclipse. Super Pied is present in HypeGecko's public inventory, but the word Super does not establish an independent homozygous state. Dark Tangerine is independently documented in London and OnlineGeckos breeder listings; it is not automatically Black Night. Bojoneroko was searched with alternative spacing and marketplace/social queries. Only mirrored public sales text was found, so its breeder origin, unique appearance and genetics remain unverified. No associated SHTCTB, Sunglow or Tremper claim is imported into the bare name. Marketplace prices and seller contact details are not copied into the catalog. Availability changes; this is a dated index, not a live shopping feed or an exhaustive claim about every trade name.

## Locus and allele relationships

The app’s identifiers are **model identifiers**, not genome coordinates. A zero/one/two-copy model does not assert that a causal mutation has been isolated. Different letters can refer to different loci; identical letters in informal breeder notation do not establish allelism.

| Modeled locus | Inheritance and allele relationship | Evidence / limitations |
| --- | --- | --- |
| Mack Snow | Incomplete dominant: 0 normal at this locus, 1 Mack Snow, 2 Super Snow | Breeder segregation; PAX7-associated research. Gem/TUG and other snow relationships excluded. |
| Tremper Albino | Autosomal recessive; visual at two copies of its own variant | Separate strain supported by complementation; no hidden alleles inferred. |
| Bell Albino | Autosomal recessive; separate from Tremper and Rainwater | Breeder and complementation evidence; record strain from parentage. |
| Rainwater Albino | Autosomal recessive; also called Las Vegas Albino | Separate strain; no cross-strain visual inference. |
| Eclipse | Breeder-supported recessive | Variable visual eye expression; no quantitative penetrance or eye-locus interactions. |
| Blizzard | Breeder-supported recessive | Can mask other pattern/color traits. |
| Murphy Patternless | Breeder-supported recessive | Distinct from line-bred patternless stripe; not inferred from a generic patternless description. |
| White & Yellow | Conditional breeder-supported dominant model; 1 and 2 copies grouped visually | Molecular basis and variant dosage cannot be inferred from appearance; reported neurological concerns have no established incidence here. |

Known or proposed eye loci (BAE, Cipher, Marble Eye, NDBE), other snow lines, and disputed size/color models remain reference-only. Line-bred traits have no assigned allele, locus, or expression percentage. No linked or allelic relationship is invented to force a complete prediction.

## Catalog

All entries use the review date above. Source titles below include publication dates where available; undated breeder pages are explicitly treated as undated observations. For combination names, genotype requirements are the listed component copy counts, conditional on the breeder’s definition and parentage records. Descriptive combinations do not add independent genes.

| Morph and aliases | Known/proposed mechanism and model components | Evidence status | Limitations, typical expression, welfare | Sources |
| --- | --- | --- | --- | --- |
`
  const rows = morphs.map((m) => {
    const loci = traits.filter((t) => t.id in (m.loci ?? {}))
    let refs = [...new Set(m.refs ?? loci.flatMap((t) => t.refs))]
    if (!refs.length)
      refs = [
        m.risk === 'frost' ? 'frost' : m.risk === 'enigma' ? 'enigma' : 'verse',
      ]
    const mechanism =
      m.risk === 'frost'
        ? 'Semidominant; SPINT1 candidate region; withheld'
        : m.risk === 'enigma'
          ? 'Dominant morph reported; neurological inheritance not modeled'
          : loci.length
            ? loci
                .map(
                  (t) =>
                    `${t.name}: ${m.loci[t.id]} variant copies (${t.inheritance})`,
                )
                .join('; ')
            : m.lineage
              ? 'Selected lineage / polygenic; no modeled locus'
              : 'See proposed mechanism and limitations; no modeled locus'
    const status =
      m.status ??
      (m.risk === 'frost'
        ? 'Peer-reviewed association; causal variant unresolved'
        : m.risk === 'enigma'
          ? 'Breeder-reported concerns'
          : loci.length
            ? 'Breeder-supported conditional model'
            : m.lineage
              ? 'Breeder-supported selection'
              : 'Descriptive or unmodeled; no genotype inferred')
    return `| ${clean(m.name + (m.aliases.length ? ` (${m.aliases.join(', ')})` : ''))} | ${clean(mechanism)} | ${clean(status)} | ${clean(m.note)} | ${refs.map((id) => `[${references[id].title}](${references[id].url})`).join('; ')} |`
  })
  const sources =
    '\n\n## Source register\n\n' +
    Object.values(references)
      .map(
        (r) =>
          `- [${r.title}](${r.url}) — consulted or indexed as qualified above, 26 October 2026.`,
      )
      .join('\n')
  await mkdir('docs', { recursive: true })
  await writeFile(
    'docs/GENETICS_REFERENCES.md',
    header + rows.join('\n') + sources + '\n',
  )
  console.log(
    `Documented ${morphs.length} catalog entries and ${traits.length} modeled loci.`,
  )
} finally {
  await server.close()
}
