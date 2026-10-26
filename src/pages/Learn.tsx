import { ArrowRight, BookOpen, Dna, Heart, Leaf } from 'lucide-react'
import { references } from '../data/references'
export default function Learn({ onPreset }: { onPreset: () => void }) {
  return (
    <section className="learn-page">
      <span className="eyebrow">A LITTLE SCIENCE GOES A LONG WAY</span>
      <h1>Understand the possibilities.</h1>
      <p className="learn-intro">
        Every hatchling inherits one allele from each parent at each locus.
        Start there, and the world of gecko genetics becomes a little clearer.
      </p>
      <div className="learn-grid">
        {[
          {
            icon: Dna,
            title: 'Genotype vs. phenotype',
            text: 'Genotype is the alleles an animal carries. Phenotype is the trait you can see. A recessive carrier often looks like a non-carrier, and one visible trait can mask another.',
          },
          {
            icon: BookOpen,
            title: 'What does “het” mean?',
            text: 'Heterozygous means two different alleles at a locus. For a simple recessive trait, a confirmed het carries one variant copy without expressing that recessive phenotype.',
          },
          {
            icon: Dna,
            title: 'The 66.67% possible het',
            text: 'Het × het gives 25% visual, 50% carriers, and 25% non-carriers. Among the 75% that are non-visual, 50 ÷ 75 = 2/3 are carriers. That is a probability about the animal’s genotype, not part of an allele.',
          },
          {
            icon: Leaf,
            title: 'Color has a longer story',
            text: 'Tangerine, Super Hypo, Carrot Tail, and melanistic breeding lines reflect selection over generations. Ancestry can influence their appearance, but a Punnett square cannot promise a shade of orange or a percentage of spots.',
          },
          {
            icon: Dna,
            title: 'Each egg is a fresh chance',
            text: 'A 25% outcome does not mean exactly one out of four eggs. These are statistical expectations across many independent eggs. Small clutches can vary widely.',
          },
          {
            icon: Heart,
            title: 'Pedigree & animal welfare',
            text: 'Close relatives can share harmful alleles. A morph label cannot identify relatedness, and this tool does not calculate inbreeding without a pedigree. It does not predict sex, survival, fertility, or individual health.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={23} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="education-banner">
        <div>
          <span className="eyebrow">TRY IT FOR YOURSELF</span>
          <h2>Sunglow meets SHTCT.</h2>
          <p>
            See why the dam’s Tremper carrier status changes albino inheritance,
            while line-bred color stays a separate question.
          </p>
        </div>
        <button className="primary-button" onClick={onPreset}>
          Explore the example <ArrowRight size={17} />
        </button>
      </div>
      <div className="welfare-warning">
        <h2>Some possibilities should stay theoretical.</h2>
        <p>
          Lemon Frost is associated with a high incidence of iridophoroma in a
          studied breeding colony. Its semidominant inheritance and a strong
          candidate region involving SPINT1 were reported in peer-reviewed
          research. This is not an individual animal’s cancer probability.
        </p>
        <a href={references.frost.url} target="_blank" rel="noreferrer">
          Read Guo et al. (2021)
        </a>
        <p>
          Enigma has reported neurological concerns. The breeder account
          documents observations and hypotheses, not a controlled incidence
          study or an established molecular mechanism. GeckoGenetics discourages
          breeding either morph and withholds their pairing predictions.
        </p>
        <a href={references.enigma.url} target="_blank" rel="noreferrer">
          Read the breeder account and its limitations
        </a>
      </div>
      <h2 className="sources-heading">Follow the evidence.</h2>
      <div className="source-list">
        {Object.entries(references).map(([id, r]) => (
          <a href={r.url} key={id} target="_blank" rel="noreferrer">
            <BookOpen size={17} />
            {r.title}
            <ArrowRight size={15} />
          </a>
        ))}
      </div>
    </section>
  )
}
