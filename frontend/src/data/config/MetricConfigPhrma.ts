import { medicareMapConfig } from '../../charts/mapGlobals'
import { type DataTypeConfig } from './MetricConfig'

export const MEDICARE_CATEGORY_DROPDOWNIDS = [
  'phrma_cardiovascular',
  'phrma_hiv',
]

export type PhrmaDataTypeId =
  | 'ami'
  | 'arv_adherence'
  | 'beta_blockers_adherence'
  | 'ras_antagonists_adherence'
  | 'statins_adherence'
  | 'ccb_adherence'
  | 'doac_adherence'
  | 'bb_ami_adherence'

export type PhrmaMetricId =
  | 'medicare_ami_pct_share'
  | 'medicare_ami_per_100k'
  | 'medicare_ami_estimated_total'
  | 'arv_adherence_pct_rate'
  | 'arv_adherence_pct_share'
  | 'arv_population_pct_share'
  | 'arv_adherence_estimated_total'
  | 'arv_beneficiaries_estimated_total'
  | 'beta_blockers_adherence_pct_rate'
  | 'beta_blockers_adherence_pct_share'
  | 'beta_blockers_population_pct_share'
  | 'beta_blockers_adherence_estimated_total'
  | 'beta_blockers_beneficiaries_estimated_total'
  | 'ccb_adherence_pct_rate'
  | 'ccb_adherence_pct_share'
  | 'ccb_population_pct_share'
  | 'ccb_adherence_estimated_total'
  | 'ccb_beneficiaries_estimated_total'
  | 'doac_adherence_pct_rate'
  | 'doac_adherence_pct_share'
  | 'doac_population_pct_share'
  | 'doac_adherence_estimated_total'
  | 'doac_beneficiaries_estimated_total'
  | 'bb_ami_adherence_pct_rate'
  | 'bb_ami_adherence_pct_share'
  | 'bb_ami_population_pct_share'
  | 'bb_ami_adherence_estimated_total'
  | 'bb_ami_beneficiaries_estimated_total'
  | 'ras_antagonists_adherence_pct_rate'
  | 'ras_antagonists_adherence_pct_share'
  | 'ras_antagonists_population_pct_share'
  | 'ras_antagonists_adherence_estimated_total'
  | 'ras_antagonists_beneficiaries_estimated_total'
  | 'statins_adherence_pct_rate'
  | 'statins_adherence_pct_share'
  | 'statins_population_pct_share'
  | 'statins_adherence_estimated_total'
  | 'statins_beneficiaries_estimated_total'
  | 'medicare_hiv_pct_share'
  | 'medicare_hiv_per_100k'
  | 'medicare_population_pct_share'
  | 'medicare_hiv_estimated_total'
  | 'medicare_population'

export const PHRMA_CARDIOVASCULAR_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'bb_ami_adherence',
    mapConfig: medicareMapConfig,
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
      text: `Persistent use of beta-blockers after a heart attacked is indicted by major clinical guidelines to reduce the risk of a future heart attack.`,
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
    mapConfig: medicareMapConfig,
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
      text: `Statins are recommended for management of dyslipidemia and/or primary prevention of cardiovascular disease (CVD) in several treatment guidelines. High adherence to statins is associated with decreased risk of death and lower health care costs.`,
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
    mapConfig: medicareMapConfig,
    dataTypeShortLabel: 'Adherence to Beta Blockers',
    fullDisplayName: 'Adherence to beta blockers',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for beta blockers during the measurement year.`,
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
      text: `Adherence to beta blockers is essential in preventing complications from cardiovascular conditions. Adherence to beta blockers have been shown to decrease the rate of mortality and hospitalization in patients with heart failure and to improve survival after AMI.`,
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
    mapConfig: medicareMapConfig,
    dataTypeShortLabel:
      'Adherence to Renin Angiotensin System Antagonists (RAS-Antagonists)',
    fullDisplayName: 'Adherence to RAS-Antagonists',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for renin angiotensin system antagonists (RASA) during the measurement year. A higher rate indicates better performance.`,
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
      text: `RASAs are important for the chronic treatment of hypertension and proteinuria in patients with diabetes, in which these drugs have been shown to delay renal failure and heart disease. Non-adherence is a major contributor to poor control of hypertension and a key barrier to reducing mortality and understanding adherence patterns can lead to improved clinical outcomes for patients.`,
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
    mapConfig: medicareMapConfig,
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
      text: `Adherence to calcium channel blockers is important to effectively treat high blood pressure and reduce risk of cardiovascular disease.`,
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
    mapConfig: medicareMapConfig,
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
      text: `Missed doses of DOAC can increase the risk for blood clots in patients. Improved adherence to DOACs is associated with decreased risk of stroke.`,
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
    mapConfig: medicareMapConfig,
    dataTypeShortLabel: 'Cases of Heart Attacks (Acute MI)',
    fullDisplayName: 'Acute Myocardial Infarctions (Heart Attacks)',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries with a diagnosis of acute myocardial infarction (AMI) (otherwise known as a heart attack) per 100K during the measurement period.`,
    },
    description: {
      text: `Heart disease, such as heart attack and heart failure, is the leading cause of death in the US.`,
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
    mapConfig: medicareMapConfig,
    dataTypeShortLabel: 'Adherence to Antiretroviral Medications',
    fullDisplayName: 'Adherence to antiretroviral medications',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 90% for ≥3 antiretroviral medications during the measurement year.`,
    },
    description: {
      text: `Effective treatment of HIV with antiretroviral medications can reduce mortality and morbidity rates among people affected by HIV.`,
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
    dataTypeId: 'phrma_hiv',
    mapConfig: medicareMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Cases of HIV',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of Human immunodeficiency virus (HIV) during the measurement period.`,
    },
    description: {
      text: `HIV is a major public health crisis that infects thousands of people in the U.S. per year. If left untreated, HIV results in acquired immunodeficiency syndrome, which increases the risk of death.`,
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
