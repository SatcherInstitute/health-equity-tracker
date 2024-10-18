import { urlMap } from '../../../utils/externalUrls'

type ExternalResourceMapping = {
  href?: string
  ariaLabel?: string
  imgSrc?: string
  imgAlt?: string
  title?: string
  description?: string
  readMoreHref?: string
  categories?: string[]
  isVideo?: boolean
}

export const externalResourceMappings: ExternalResourceMapping[] = [
  {
    href: 'https://satcherinstitute.org/hetblog2/',
    ariaLabel: 'Satcher Blog Post on Why Data Matters',
    imgSrc: '/img/stock/kid-gets-a-mask.png',
    imgAlt: '',
    title:
      'Why it matters that information on race, ethnicity, gender and disability are measured accurately and completely',
    description:
      'Why ongoing data on health and well-being metrics could be used in targeting federal resources and programs to address inequities due to social and economic factors.',
    readMoreHref: 'https://satcherinstitute.org/hetblog2/',
    categories: ['Demographics', 'Determinants of Health'],
  },
  {
    href: 'https://satcherinstitute.org/hetblog3/',
    ariaLabel: 'Satcher Blog Post on Health Equity Data',
    imgSrc: '/img/stock/girls-studying.jpg',
    imgAlt: '',
    title: 'How can we use data to inform practices to advance health equity?',
    description: `In public health, much of our work depends on having accurate data, so we know what's happening both on the ground and at a population level.`,
    readMoreHref: 'https://satcherinstitute.org/hetblog3/',
    categories: ['Public Health', 'Data Collection'],
  },
  {
    href: 'https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/',
    ariaLabel: 'Read Scientific American Article',
    imgSrc: '/img/stock/filling-in-forms.png',
    imgAlt: '',
    title: 'Data and technology can help us make progress on COVID inequities',
    description: '',
    readMoreHref: '',
    categories: ['COVID-19', 'Data Collection', 'Health Inequities'],
  },
  {
    href: 'https://satcherinstitute.github.io/analysis/cdc_case_data',
    ariaLabel: 'Satcher Post on COVID Data Completeness',
    imgSrc: '/img/stock/kids-ukulele.png',
    imgAlt: '',
    title: `How complete are the CDC's COVID-19 case surveillance datasets for race/ethnicity at the state and county levels?`,
    description: '',
    readMoreHref: '',
    categories: ['Demographics', 'COVID-19', 'Data Collection'],
  },
  {
    href: 'https://www.kennedysatcher.org/blog/the-mental-fitness-of-our-children',
    ariaLabel: 'Kennedy Satcher Article: The Mental Fitness of Our Children',
    imgSrc: '/img/graphics/laptop-HET.png',
    imgAlt: '',
    title: 'The mental fitness of our children',
    description: '',
    readMoreHref: '',
    categories: ['Mental Health', 'Youth', 'Psychology'],
  },
  {
    href: 'https://www.youtube.com/embed/mux1c73fJ78',
    ariaLabel: 'The Allegory of the Orchard Video',
    imgSrc: '',
    imgAlt: '',
    title:
      'Learn about the Political Determinants of Health through the Allegory of the Orchard',
    description:
      'Girding all health determinants is one that rarely gets addressed but which has power over all aspects of health: political determinants of health.',
    readMoreHref: '',
    categories: ['Political Determinants of Health'],
    isVideo: true,
  },
  {
    href: 'https://www.youtube.com/embed/cmMutvgQIcU',
    ariaLabel: `Jessica's Story Video`,
    imgSrc: '',
    imgAlt: '',
    title: `Jessica's Story`,
    description:
      'How political determinants of health operate and the impact they have on BIPOC communities.',
    readMoreHref: '',
    categories: ['BIPOC Communities'],
    isVideo: true,
  },
  {
    href: `${urlMap.ncrn}`,
    ariaLabel: 'NCRN Information',
    imgSrc: '../../../public/img/graphics/NCRN-MSM.png',
    imgAlt: 'NCRN Information Thumbnail',
    title: 'Morehouse School of Medicine National COVID-19 Resiliency Network',
    description:
      'We provide awareness and linkage to critical health information and services, helping families recover from difficulties that may have been caused or worsened by the Coronavirus (COVID-19) pandemic.',
    readMoreHref: '',
    categories: [],
    isVideo: false,
  },
]
