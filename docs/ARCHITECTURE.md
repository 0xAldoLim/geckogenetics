# Architecture

GeckoGenetics is a static React application. It needs no server, API key, database, account, or inference service.

| Area                                  | Responsibility                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/genetics/traits.ts`              | Species-specific locus definitions, allele notation, explicit genotype states, lineage names, parent and pairing types                     |
| `src/genetics/probability.ts`         | Reduced BigInt fractions, exact operations, presentation rounding                                                                          |
| `src/genetics/inference.ts`           | Parental genotype mixtures, weighted gametes, per-locus crossing, joint enumeration, phenotype grouping, conditional carrier probabilities |
| `src/genetics/result-presentation.ts` | Family-aware result names and plain-language visible-trait labels; no probability changes                                                  |
| `src/genetics/parser.ts`              | Conservative alias and shorthand recognition; no state mutation                                                                            |
| `src/genetics/observations.ts`        | Compare recognized observations with predictions without parental inference                                                                |
| `src/data/morphs.ts`                  | Morph presets, aliases, combination components, reference-only entries, source/evidence annotations, welfare labels                        |
| `src/data/references.ts`              | Source records shared by the catalog and educational pages                                                                                 |
| `src/lib/storage.ts`                  | Strict Zod schemas, validated URL-fragment encoding, Unicode round trips, local storage validation                                         |
| `src/components/`                     | Parent controls, cartoon artwork with local feature overlays, outcome cards/charts, and weighted Punnett square                            |
| `src/pages/`                          | Searchable encyclopedia and genetics guide                                                                                                 |
| `src/App.tsx`                         | App navigation, working vs. calculated pairing, presets, saves, sharing, observation text                                                  |
| `src/tests/`, `e2e/`                  | Independent genetics tests, exhaustive probability checks, desktop/mobile flows                                                            |

## Data flow

Base morph selection, additive visible traits, direct het selection, confirmed combination text, and optional record controls produce a typed `Pairing`. `assumeUnlisted` enables scenario estimates for omitted states at active loci without changing the underlying records. Explicit unknown states are never replaced by assumptions. The same state resolver is used by the engine and Punnett square. The UI maintains a working pairing and a separate calculated snapshot so pending edits are visible. Calculation crosses parental distributions at each eligible locus; it then multiplies these distributions under the documented independent-assortment assumption. Grouping changes presentation only, retaining underlying genotypes.

Every engine function is independent of React and storage. Adding another species should provide its own catalog, locus definitions, allele/phenotype mapping, and validation adapter, reusing rational and diploid-cross primitives where appropriate. Do not merge another species’ rules into the leopard gecko catalog.

## Catalog corrections

Update the catalog or locus definition with supporting evidence. New names can enter the encyclopedia without entering probability calculations. Modeling a new locus requires evaluating allelism, linkage, interactions, evidence quality, and welfare. Nine locus definitions include the conditional TUG model. Mack/TUG compatibility rules are checked before joint enumeration; raising the simultaneous independent-locus limit requires reviewing exponential growth. Keep the reference document and regression tests in sync.

## Browser behavior

The sun/moon button applies a semantic light/dark palette without filtering gecko artwork. A pre-paint bootstrap uses a validated browser preference or the initial system color scheme; manual choices persist independently of pairing data. The toggle remains usable when storage is blocked.

Navigation is local state and works on a static host. Shared pairings live in a URL fragment, not a query sent to a backend. Imported data is parsed through a strict schema before use. React escapes text; no user-controlled HTML is rendered. Genotype notes and unknown labels never execute as code.

The app uses system fonts, original cartoon WebP illustrations, and bundled icons. `appearance.ts` maps expressed genotypes to separate body-color, body-pattern, eye, head, and tail features. Parent/library appearance descriptors are distinct from inferred offspring genetics. Carrier states never become visible art traits. `MorphIllustration` selects an actual pattern asset, while `CartoonEyes` modifies only the eye region; local head and tail features remain separate. Illustrations remain explicitly non-predictive. No runtime asset CDN is required. Tailwind’s Vite integration and semantic component styles form the UI. Motion respects reduced-motion preferences.

`catalog-index.ts` extends the naming catalog with breeder, marketplace, pattern, eye, and unverified entries without creating new Mendelian loci. The library paginates entries and filters categories and sources. Bojoneroko remains an unverified trade-line record; Pied/Super Pied do not acquire a fabricated Pied locus.

## Validation and delivery

`pnpm test` verifies required crosses, possible hets, the six-genotype Gecko Labs example, carrier conditioning, separate albino strains, aliases, data validation, welfare aliases, and exact probability conservation. Exhaustive tests check all supported loci over seven representative known/possible parent states in both crossing directions and all eight compatible simultaneous heterozygous loci. General estimate regressions cover carrier additions across every non-risk catalog entry and each supported recessive, explicit unknown overrides, trait stacking, and assumption settings in legacy/new links.

`pnpm test:e2e` checks desktop and mobile Chromium for the primary controls, presets, Punnett expansion, genotype editing, saved/shared pairings, ambiguous input, welfare behavior, corrupt storage, responsive overflow, and runtime errors. `pnpm build` runs strict TypeScript checks before producing `dist/`. CI uploads the static production build and browser diagnostics as artifacts.

The shared `parentFromLabel` resolver powers interactive review and marketplace regressions. It scopes het qualifiers in input order, holds unknown probabilities, checks compound-het assumptions and separates lineage from allele evidence. `marketplace-listings.json` records a dated source audit, including unsupported species and accessories; it is test data and is not bundled into the app. Four curated source-linked pairings are bundled separately. Tests cover every recorded leopard-gecko parent pair and all 5,760 advertised male/female listing combinations under explicit test scenarios.

`faunary-listings.json` records the 9 November public-description snapshot, including original description hashes, relevant fields, exclusions and listing URLs. The full fixture is test/audit data and is not bundled. `faunary-labels.json` is the smaller searchable label index; `faunary-morphs.ts` holds reviewed core combinations and reference projects. `morph-search.ts` matches aliases/words and offers a direct combination only when the shared parser can resolve it without guessing. Other labels open the same review as typed input. Source-label replacement clears the previous visible selection so an unknown label cannot accidentally retain the opening Snow genotype. The requested Black Night Tangerine Stripe × Black Night het MP case has both a preset and UI regressions.

Simple results keep family names visible on each card and in the chart. DNA notation stays inside an expandable explanation; Genetics details separates underlying genotypes. `offspringAppearanceExamples` supplies unweighted visual examples of family color/pattern variation while preserving calculated albino, eye and patternless features. These guides never enter `calculate` or create an expression probability. Family-only pairings receive a guide without a percentage badge. Regression checks cover the reported Black Night × Mack Snow Eclipse Black Night pairing, other selected lines and dark-mode readability.
