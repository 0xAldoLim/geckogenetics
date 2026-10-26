# GeckoGenetics

**A little science. A world of possibility.**

Explore what a leopard gecko pairing could produce—and understand why. GeckoGenetics brings offspring probabilities, hidden carrier genetics, and the story behind each trait into one friendly calculator.

![GeckoGenetics calculator with parent illustrations and offspring probabilities](docs/images/calculator.png)

## Meet your next discovery

- **Pair two geckos.** Search familiar morph names or enter documented genotypes, hidden traits, and possible hets.
- **See the possibilities.** Explore offspring cards, a probability chart, and an interactive Punnett square. Switch between appearance and genotype views without losing carrier information.
- **Understand the color story.** Keep Tangerine, Super Hypo, Carrot Tail, and other selected breeding lines separate from single-gene inheritance.
- **Learn as you go.** Browse 78 sourced morph and breeding-line entries and a plain-English genetics guide, including uncertain and disputed morphs.
- **Keep a pairing handy.** Save up to 20 pairings in your browser, share a pairing link, or copy results with their assumptions.

No accounts, subscriptions, database, or AI services. Calculations run on your device.

## Try a pairing

The calculator opens with **Mack Snow × Mack Snow**: 25% normal at the Snow locus, 50% Mack Snow, and 25% Super Snow under the stated model.

Choose **Sunglow × SHTCT** from the example menu to explore the effect of Tremper carrier status:

| Dam’s documented Tremper status | Expected offspring at that locus    |
| ------------------------------- | ----------------------------------- |
| Non-carrier                     | 100% het Tremper; 0% visual Tremper |
| Confirmed het                   | 50% het Tremper; 50% visual Tremper |

The sire’s Tremper Albino strain is explicitly selected in these examples. The name “Sunglow” by itself does not establish an albino strain. Tangerine, Super Hypo, and Carrot Tail ancestry appears separately, without invented color percentages.

## Good genetics starts with good records

Percentages describe the chance for **each egg**, not a guaranteed clutch. Predictions depend on entered genotypes and the assumptions shown with the results.

A normal appearance cannot rule out hidden recessive alleles. Unspecified genotypes stay unknown. “66.67% possible het” means a two-thirds chance of being a carrier under the stated parentage; it does not mean two-thirds of an allele. The calculator distinguishes an exact 2/3 from a literal 66% estimate.

The library includes breeding lines, combination names, and disputed traits beyond the supported calculation model. It does not claim to identify every trade name or infer an animal’s genotype from its photograph. Ambiguous shorthand such as `MSEBN H T` and `SP PH T` is preserved for clarification. Recognized expansions are shown before you confirm them.

Lemon Frost and Enigma trigger welfare information and withheld predictions, including recognized Enigma combination names. No offspring sex, survival, fertility, health, or inbreeding coefficient is predicted. See the [evidence and source limitations](docs/GENETICS_REFERENCES.md) and [calculation assumptions](docs/ASSUMPTIONS.md).

## Privacy & sharing

Saved pairings live in this browser’s local storage. Clearing browser data removes them; they do not sync between devices. A share link includes the entered pairing, evidence notes, and observed hatchling label. Review those details before sharing. Links are validated when opened. Observations never rewrite parental alleles.

## Run it yourself

Install [Node.js 24 LTS](https://nodejs.org/) and [pnpm](https://pnpm.io/installation), then:

```sh
git clone https://github.com/0xAldoLim/geckogenetics.git
cd geckogenetics
pnpm install
pnpm dev
```

Open the local address printed in your terminal.

```sh
pnpm test                         # Genetics and data validation
pnpm exec playwright install chromium
pnpm test:e2e                     # Desktop and mobile browser tests
pnpm build                       # Production website in dist/
pnpm preview                     # Preview the production build
```

Deploy `dist/` to any static host. Relative asset paths support a repository subdirectory; pairing links use a URL fragment, so no application server is required. GitHub Actions runs the checks and uploads a production build for each push.

## For contributors

Built with React, strict TypeScript, Vite, Tailwind CSS, Vitest, and Playwright. Genetics rules and catalog data live independently of the interface. Exact rational arithmetic preserves probabilities until display.

- [Architecture](docs/ARCHITECTURE.md)
- [Genetics catalog, evidence, and references](docs/GENETICS_REFERENCES.md)
- [Assumptions and limitations](docs/ASSUMPTIONS.md)
- [Illustration and dependency attribution](docs/ATTRIBUTION.md)

Found a missing morph or a genetics correction? [Open an issue](https://github.com/0xAldoLim/geckogenetics/issues) with the name, original breeder records or research, and any relevant welfare evidence. New catalog entries do not automatically become independent modeled genes.
