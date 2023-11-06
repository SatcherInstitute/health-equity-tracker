import {
  medicareHigherIsBetterMapConfig,
  medicareHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import { type DataTypeConfig } from './MetricConfig'

export const MEDICARE_CATEGORY_DROPDOWNIDS = [
  'medicare_cardiovascular',
  'medicare_hiv',
  'medicare_mental_health',
]

export type PhrmaDataTypeId =
  | 'medicare_ami'
  | 'medicare_hiv'
  | 'medicare_anti_psychotics'
  | 'arv_adherence'
  | 'beta_blockers_adherence'
  | 'ras_antagonists_adherence'
  | 'statins_adherence'
  | 'ccb_adherence'
  | 'doac_adherence'
  | 'bb_ami_adherence'

export type PhrmaMetricId =
  | 'anti_psychotics_adherence_estimated_total'
  | 'anti_psychotics_adherence_pct_rate'
  | 'anti_psychotics_adherence_pct_share'
  | 'anti_psychotics_beneficiaries_estimated_total'
  | 'anti_psychotics_population_pct_share'
  | 'arv_adherence_estimated_total'
  | 'arv_adherence_pct_rate'
  | 'arv_adherence_pct_share'
  | 'arv_beneficiaries_estimated_total'
  | 'arv_population_pct_share'
  | 'bb_ami_adherence_estimated_total'
  | 'bb_ami_adherence_pct_rate'
  | 'bb_ami_adherence_pct_share'
  | 'bb_ami_beneficiaries_estimated_total'
  | 'bb_ami_population_pct_share'
  | 'beta_blockers_adherence_estimated_total'
  | 'beta_blockers_adherence_pct_rate'
  | 'beta_blockers_adherence_pct_share'
  | 'beta_blockers_beneficiaries_estimated_total'
  | 'beta_blockers_population_pct_share'
  | 'ccb_adherence_estimated_total'
  | 'ccb_adherence_pct_rate'
  | 'ccb_adherence_pct_share'
  | 'ccb_beneficiaries_estimated_total'
  | 'ccb_population_pct_share'
  | 'doac_adherence_estimated_total'
  | 'doac_adherence_pct_rate'
  | 'doac_adherence_pct_share'
  | 'doac_beneficiaries_estimated_total'
  | 'doac_population_pct_share'
  | 'medicare_ami_estimated_total'
  | 'medicare_ami_pct_share'
  | 'medicare_ami_per_100k'
  | 'medicare_hiv_estimated_total'
  | 'medicare_hiv_pct_share'
  | 'medicare_hiv_per_100k'
  | 'medicare_schizophrenia_estimated_total'
  | 'medicare_schizophrenia_pct_share'
  | 'medicare_schizophrenia_per_100k'
  | 'medicare_population_pct_share'
  | 'medicare_population'
  | 'ras_antagonists_adherence_estimated_total'
  | 'ras_antagonists_adherence_pct_rate'
  | 'ras_antagonists_adherence_pct_share'
  | 'ras_antagonists_beneficiaries_estimated_total'
  | 'ras_antagonists_population_pct_share'
  | 'statins_adherence_estimated_total'
  | 'statins_adherence_pct_rate'
  | 'statins_adherence_pct_share'
  | 'statins_beneficiaries_estimated_total'
  | 'statins_population_pct_share'

export const PHRMA_CARDIOVASCULAR_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'bb_ami_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel:
      'Persistence of Beta Blocker Treatment after a Heart Attack',
    fullDisplayName:
      'Population Receiving Persistent Beta Blocker Treatment After a Heart Attack',
    surveyCollectedData: true,
    definition: {
      text: `National Quality Forum measure representing the percentage of Medicare fee-for-service beneficiaries 18 years of age and older during the measurement year who were hospitalized and discharged with a diagnosis of acute myocardial infarction (AMI) and who received persistent beta-blocker treatment for six months after discharge.`,
      citations: [
        {
          shortLabel: 'National Quality Forum',
          longerTitle:
            'Persistence of Beta-Blocker Treatment After a Heart Attack (NQF-0071). National Quality Forum. Updated July 2020.',
          url: 'https://www.qualityforum.org/Home.aspx',
        },
      ],
    },
    description: {
      text: `Beta-blockers are recommended by clinical guidelines for reducing the risk of a secondary heart attack.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'bb_ami_adherence_estimated_total',
          shortLabel: 'Persistently treated beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'bb_ami_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'bb_ami_adherence_pct_rate',
        chartTitle:
          'Population Persistent to Beta Blocker Treatment After a Heart Attack',
        shortLabel: '% of pop. receiving persistent treatment',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'bb_ami_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'statins_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Statins',
    fullDisplayName: 'Adherence to statins',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for statins during the measurement year. A higher rate indicates better performance.`,
      citations: [
        {
          shortLabel: 'PQA Alliance',
          longerTitle:
            'Proportion of Days Covered: Statins (PDC-STA). Pharmacy Quality Alliance. Updated September 2019. ',
          url: 'https://www.pqaalliance.org/measures-overview#pdc-sta',
        },
      ],
    },
    description: {
      text: `Statins are recommended by several treatment guidelines for the prevention of cardiovascular disease (CVD).`,
      citations: [
        {
          shortLabel: 'Journal of Clinical Medicine',
          longerTitle:
            'Nowak MM, Niemczyk M, Florczyk M, Kurzyna M, Pączek L. Effect of Statins on All-Cause Mortality in Adults: A Systematic Review and Meta-Analysis of Propensity Score-Matched Studies. J Clin Med. 2022 Sep 25;11(19):5643. doi: 10.3390/jcm11195643. PMID: 36233511; PMCID: PMC9572734.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/36233511/',
        },
        {
          shortLabel: 'Health Affairs (Project Hope)',
          longerTitle:
            'Roebuck MC, Liberman JN, Gemmill-Toyama M, et al. Medication adherence leads to lower health care use and costs despite increased drug spending. Health Aff (Millwood). 2011; 30(1):91-9. PMID: 21209444.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/21209444/',
        },
      ],
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        metricId: 'statins_adherence_pct_rate',
        chartTitle: 'Population adherent to statins',
        shortLabel: '% of pop. above adherence threshold',
        columnTitleHeader: 'Population adherent to statins',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'statins_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'statins_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'statins_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'beta_blockers_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Beta Blockers',
    fullDisplayName: 'Adherence to beta blockers',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for beta-blockers during the measurement year. A higher rate indicates better performance.`,
      citations: [
        {
          shortLabel: 'PQA Alliance',
          longerTitle:
            'Proportion of Days Covered: Beta-Blockers (PDC-BB). Pharmacy Quality Alliance. Updated September 2019.',
          url: 'https://www.pqaalliance.org/measures-overview#pdc-bb',
        },
      ],
    },
    description: {
      text: `Beta-blockers are recommended by clinical guidelines as a treatment for high blood pressure among some patients with coronary artery disease or heart failure.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'beta_blockers_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'beta_blockers_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'beta_blockers_adherence_pct_rate',
        chartTitle: 'Population adherent to beta blockers',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'beta_blockers_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },

  {
    dataTypeId: 'ras_antagonists_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel:
      'Adherence to Renin Angiotensin System Antagonists (RASA)',
    fullDisplayName: 'Adherence to RASA',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for renin angiotensin system antagonists (RASAs) during the measurement year. A higher rate indicates better performance.`,
      citations: [
        {
          shortLabel: 'PQA Alliance',
          longerTitle:
            'Proportion of Days Covered: Renin Angiotensin System Antagonists (PDC-RAS). Pharmacy Quality Alliance. Updated September 2019. ',
          url: 'https://www.pqaalliance.org/measures-overview#pdc-rasa',
        },
      ],
    },
    description: {
      text: `RASAs are commonly prescribed to treat hypertension. The 2017 American College of Cardiology/American Heart Association Task Force on Clinical Practice Guidelines recommend RASAs as first-line treatment of hypertension.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'ras_antagonists_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ras_antagonists_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'ras_antagonists_adherence_pct_rate',
        chartTitle: 'Population adherent to RAS-Antagonists',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'ras_antagonists_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'ccb_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Calcium Channel Blockers',
    fullDisplayName: 'Adherence to calcium channel blockers',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for calcium channel blockers during the measurement year.`,
      citations: [
        {
          shortLabel: 'PQA Alliance',
          longerTitle:
            'Proportion of Days Covered: Calcium Channel Blockers (PDC-CCB). Pharmacy Quality Alliance. Updated September 2019.',
          url: 'https://www.pqaalliance.org/measures-overview#pdc-ccb',
        },
      ],
    },
    description: {
      text: `Calcium channel blockers are recommended by clinical guidelines as first-line treatment of hypertension.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'ccb_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ccb_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'ccb_adherence_pct_rate',
        chartTitle: 'Population adherent to calcium channel blockers',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'ccb_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'doac_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Direct Oral Anticoagulants (DOACs)',
    fullDisplayName: 'Adherence to direct oral anticoagulants',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% during the measurement period for direct-acting oral anticoagulants.`,
      citations: [
        {
          shortLabel: 'PQA Alliance',
          longerTitle:
            'Proportion of Days Covered: Direct-Acting Oral Anticoagulants (PDC-DOAC) Pharmacy Quality Alliance. Updated September 2019.',
          url: 'https://www.pqaalliance.org/measures-overview#pdc-doac',
        },
      ],
    },
    description: {
      text: `DOACs are recommended by clinical guidelines among many patients with a history of ischemic stroke and atrial fibrillation.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'doac_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'doac_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'doac_adherence_pct_rate',
        chartTitle: 'Population adherent to direct oral anticoagulants',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'doac_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'ami',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases of Heart Attacks (Acute MI)',
    fullDisplayName: 'Acute Myocardial Infarctions (Heart Attacks)',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries with a diagnosis of acute myocardial infarction (AMI) (otherwise known as a heart attack) per 100K during the measurement period.`,
    },
    description: {
      text: `Heart disease, such as heart attack and heart failure, is leading cause of death in the US.`,
      citations: [
        {
          shortLabel: 'CDC',
          longerTitle:
            'Leading Causes of Death. 2018. Centers for Disease Control and Prevention.',
          url: 'https://www.cdc.gov/minorityhealth/lcod/men/2018/all-races-origins/index.htm',
        },
      ],
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      per100k: {
        metricId: 'medicare_ami_per_100k',
        chartTitle: 'Rates of Acute MI',
        shortLabel: 'Acute MI per 100k',
        columnTitleHeader: 'Medicare beneficiary acute MI cases',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'medicare_ami_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'medicare_population',
          shortLabel: 'beneficiaries',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of total beneficiary acute MI cases',
        metricId: 'medicare_ami_pct_share',
        columnTitleHeader: 'Share of total beneficiary acute MI cases',
        shortLabel: '% of beneficiary pop. with acute MI',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total acute MI cases',
          metricId: 'medicare_population_pct_share',
          columnTitleHeader: 'Share of all beneficiaries',
          shortLabel: '% of beneficiary pop.',
          type: 'pct_share',
        },
      },
    },
  },
]

export const PHRMA_HIV_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'arv_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Antiretroviral Medications',
    fullDisplayName: 'Adherence to antiretroviral medications',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 90% for ≥3 antiretroviral medications during the measurement year.`,
    },
    description: {
      text: `Antiretroviral medications are recommended for the treatment of HIV.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'arv_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'arv_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'arv_adherence_pct_rate',
        chartTitle: 'Population adherent to antiretrovirals',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'arv_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'medicare_hiv',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'HIV Cases',
    fullDisplayName: 'Cases of HIV',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of human immunodeficiency virus (HIV) during the measurement period.`,
    },
    description: {
      text: `HIV is a major public health crisis, which disproportionately impacts certain subpopulations.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      per100k: {
        metricId: 'medicare_hiv_per_100k',
        chartTitle: 'Rates of HIV cases',
        shortLabel: 'cases per 100k',
        columnTitleHeader: 'Medicare beneficiary HIV cases',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'medicare_hiv_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'medicare_population',
          shortLabel: 'beneficiaries',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of total beneficiaries living with HIV',
        metricId: 'medicare_hiv_pct_share',
        columnTitleHeader: 'Share of total beneficiaries living with HIV',
        shortLabel: '% of beneficiary pop. living with HIV',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total HIV cases',
          metricId: 'medicare_population_pct_share',
          columnTitleHeader: 'Share of all beneficiaries',
          shortLabel: '% of beneficiary pop.',
          type: 'pct_share',
        },
      },
    },
  },
]

export const PHRMA_MENTAL_HEALTH_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'anti_psychotics_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Anti-Psychotics',
    fullDisplayName: 'Adherence to anti-psychotics',
    surveyCollectedData: true,
    definition: {
      text: `Percentage of individuals at least 18 years of age as of the beginning of the measurement period with schizophrenia or schizoaffective disorder who had at least two prescriptions filled for any antipsychotic medication and who had a Proportion of Days Covered (PDC) of at least 0.8 for antipsychotic medications during the measurement period (12 consecutive months)`,
      citations: [
        {
          shortLabel: 'National Quality Forum',
          longerTitle:
            'Adherence to Antipsychotic Medications For Individuals with Schizophrenia (NQF 1879). National Quality Forum. Updated July 2020.',
          url: 'https://www.qualityforum.org/Home.aspx',
        },
      ],
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'anti_psychotics_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'anti_psychotics_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'anti_psychotics_adherence_pct_rate',
        chartTitle: 'Population adherent to antipsychotics',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'anti_psychotics_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'medicare_schizophrenia',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Schizophrenia',
    fullDisplayName: 'Cases of Schizophrenia',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of schizophrenia during the measurement period.`,
    },
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'medicare_population',
        shortLabel: 'Total Medicare Population',
        type: 'count',
      },
      per100k: {
        metricId: 'medicare_schizophrenia_per_100k',
        chartTitle: 'Rates of schizophrenia',
        shortLabel: 'cases per 100k',
        columnTitleHeader: 'Medicare beneficiary schizophrenia cases',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'medicare_schizophrenia_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'medicare_population',
          shortLabel: 'beneficiaries',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of total beneficiaries diagnosed with schizophrenia',
        metricId: 'medicare_schizophrenia_pct_share',
        columnTitleHeader:
          'Share of total beneficiaries diagnosed with schizophrenia',
        shortLabel: '% of beneficiary pop. diagnosed with schizophrenia',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total schizophrenia cases',
          metricId: 'medicare_population_pct_share',
          columnTitleHeader: 'Share of all beneficiaries',
          shortLabel: '% of beneficiary pop.',
          type: 'pct_share',
        },
      },
    },
  },
]
