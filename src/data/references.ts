export const references = {
  labs: {
    title: 'Gecko Labs · Quick blip on heritability (2015)',
    url: 'https://geckoforums.net/threads/quick-blip-on-heritability.104713/',
  },
  reptimate: {
    title: 'ReptiMate · Leopard gecko genetics',
    url: 'https://reptimatecalculator.com/leopard-gecko/select-genetics',
  },
  frost: {
    title: 'Guo et al. · PLOS Genetics (2021)',
    url: 'https://doi.org/10.1371/journal.pgen.1009580',
  },
  review: {
    title: 'Guo & Kruglyak · Physiological Genomics (2023)',
    url: 'https://doi.org/10.1152/physiolgenomics.00015.2023',
  },
  enigma: {
    title: 'Bargen · Enigma syndrome, breeder observations (2013)',
    url: 'https://geckotime.com/enigma-syndrome/',
  },
  verse: {
    title: 'Geckoverse · Breeder genetics reference',
    url: 'https://geckoverse.net/genetics/',
  },
  strains: {
    title:
      'Gamble et al. · Tyrosinase activity in albino leopard geckos (2006)',
    url: 'https://www.geckoevolution.org/publications/Gamble_etal_2006_Tyrosinase.pdf',
  },
  masterlist: {
    title: 'MorphMarket · Community nomenclature masterlist (2020–2025)',
    url: 'https://community.morphmarket.com/t/masterlist-of-every-leopard-gecko-morph-help-fill-in-the-blanks/12219',
  },
  bae: {
    title: 'Ron Tremper · Blue Amber Eye breeding observations',
    url: 'https://www.leopardgecko.com/BAEinformation.html',
  },
  giant: {
    title: 'Ron Tremper · Giant genetics (historical model, 2004)',
    url: 'https://leopardgecko.com/giantgenetics.html',
  },
  pastel: {
    title: 'Ron Tremper · Pastel information',
    url: 'https://www.leopardgecko.com/pastelinformation.html',
  },
  etc: {
    title: 'Geckos Etc. · Breeder morph catalog',
    url: 'https://geckosetc.com/leopard-geckos/',
  },
  snow: {
    title: 'University of Geneva · PAX7 & Mack Super Snow research (2024)',
    url: 'https://www.unige.ch/medias/download_file/view/3167/2530',
  },
  bell: {
    title: 'Morphpedia · Bell Albino',
    url: 'https://www.morphmarket.com/morphpedia/leopard-geckos/albino-bell/',
  },
} as const
export type ReferenceId = keyof typeof references
