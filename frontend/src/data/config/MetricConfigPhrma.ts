import { type DataTypeConfig } from './MetricConfig'

export const MEDICARE_CATEGORY_DROPDOWNIDS = [
  'phrma_cardiovascular',
  'phrma_hiv',
]

export type PhrmaDataTypeId =
  | 'ami'
  | 'arv_adherence'
  | 'beta_blockers_adherence'
  | 'rasa_adherence'
  | 'statins_adherence'
  | 'ccb_adherence'
  | 'doac_adherence'
  | 'nqf_adherence'

export type PhrmaMetricId =
  | 'ami_pct_share'
  | 'ami_per_100k'
  | 'ami_estimated_total'
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
  | 'nqf_adherence_pct_rate'
  | 'nqf_adherence_pct_share'
  | 'nqf_population_pct_share'
  | 'nqf_adherence_estimated_total'
  | 'nqf_beneficiaries_estimated_total'
  | 'rasa_adherence_pct_rate'
  | 'rasa_adherence_pct_share'
  | 'rasa_population_pct_share'
  | 'rasa_adherence_estimated_total'
  | 'rasa_beneficiaries_estimated_total'
  | 'statins_adherence_pct_rate'
  | 'statins_adherence_pct_share'
  | 'statins_population_pct_share'
  | 'statins_adherence_estimated_total'
  | 'statins_beneficiaries_estimated_total'
  | 'phrma_hiv_pct_share'
  | 'phrma_hiv_per_100k'
  | 'phrma_population_pct_share'
  | 'phrma_hiv_estimated_total'
  | 'phrma_population'

export const PHRMA_CARDIOVASCULAR_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'statins_adherence',
    dataTypeShortLabel: 'Adherence to Statins',
    fullDisplayName: 'Adherence to statins',
    surveyCollectedData: true,
    dataTypeDefinition: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for statins during the measurement year. A higher rate indicates better performance.`,
    dataTypeDescription: `Statins are recommended for management of dyslipidemia and/or primary prevention of cardiovascular disease (CVD) in several treatment guidelines. High adherence to statins is associated with decreased risk of death and lower health care costs.`,
    metrics: {
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
    dataTypeShortLabel: 'Adherence to Beta Blockers',
    fullDisplayName: 'Adherence to beta blockers',
    surveyCollectedData: true,
    dataTypeDefinition: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for beta blockers during the measurement year.`,
    dataTypeDescription: `Adherence to beta blockers is essential in preventing complications from cardiovascular conditions. Adherence to beta blockers have been shown to decrease the rate of mortality and hospitalization in patients with heart failure and to improve survival after AMI (CITE).`,
    metrics: {
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
    dataTypeId: 'nqf_adherence',
    dataTypeShortLabel:
      'Persistence to Beta Blocker Treatment after a Heart Attack',
    fullDisplayName:
      'Population Receiving Persistent Beta Blocker Treatment After a Heart Attack',
    surveyCollectedData: true,
    dataTypeDefinition: `National Quality Forum measure representing the percentage of Medicare fee-for-service beneficiaries 18 years of age and older during the measurement year who were hospitalized and discharged with a diagnosis of acute myocardial infarction (AMI) and who received persistent beta-blocker treatment for six months after discharge.`,
    dataTypeDescription: `Persistent use of beta-blockers after a heart attacked is indicted by major clinical guidelines to reduce the risk of a future heart attack (CITE).`,
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'nqf_adherence_estimated_total',
          shortLabel: 'Persistently treated beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'nqf_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'nqf_adherence_pct_rate',
        chartTitle:
          'Population Persistent to Beta Blocker Treatment After a Heart Attack',
        shortLabel: '% of pop. receiving persistent treatment',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'nqf_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'rasa_adherence',
    dataTypeShortLabel:
      'Adherence to Renin Angiotensin System Antagonists (RAS-Antagonists)',
    fullDisplayName: 'Adherence to RAS-Antagonists',
    surveyCollectedData: true,
    dataTypeDefinition: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for renin angiotensin system antagonists (RASA) during the measurement year. A higher rate indicates better performance.`,
    dataTypeDescription: `RASAs are important for the chronic treatment of hypertension and proteinuria in patients with diabetes, in which these drugs have been shown to delay renal failure and heart disease. Non-adherence is a major contributor to poor control of hypertension and a key barrier to reducing mortality and understanding adherence patterns can lead to improved clinical outcomes for patients (CITE).`,
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'rasa_adherence_estimated_total',
          shortLabel: 'Adherent beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'rasa_beneficiaries_estimated_total',
          shortLabel: 'Total beneficiaries',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'rasa_adherence_pct_rate',
        chartTitle: 'Population adherent to RAS-Antagonists',
        shortLabel: '% of pop. above adherence threshold',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'rasa_adherence_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
    },
  },
  {
    dataTypeId: 'ccb_adherence',
    dataTypeShortLabel: 'Adherence to Calcium Channel Blockers',
    fullDisplayName: 'Adherence to calcium channel blockers',
    surveyCollectedData: true,
    dataTypeDefinition: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for calcium channel blockers during the measurement year.`,
    dataTypeDescription: `Adherence to calcium channel blockers is important to effectively treat high blood pressure and reduce risk of cardiovascular disease (CITE).`,
    metrics: {
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
    dataTypeShortLabel: 'Adherence to Direct Oral Anticoagulants (DOACs)',
    fullDisplayName: 'Adherence to direct oral anticoagulants',
    surveyCollectedData: true,
    dataTypeDefinition: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% during the measurement period for direct-acting oral anticoagulants.`,
    dataTypeDescription: `Missed doses of DOAC can increase the risk for blood clots in patients. Improved adherence to DOACs is associated with decreased risk of stroke (CITE).`,
    metrics: {
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
        chartTitle: 'Direct Oral Anticoagulants Adherence',
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
    dataTypeShortLabel: 'Cases of Heart Attacks (Acute MI)',
    fullDisplayName: 'Acute Myocardial Infarctions (Heart Attacks)',
    surveyCollectedData: true,
    dataTypeDefinition: `The number of Medicare fee-for-service beneficiaries with a diagnosis of acute myocardial infarction (AMI) (otherwise known as a heart attack) per 100K during the measurement period.`,
    dataTypeDescription: ` Heart disease, such as heart attack and heart failure, is leading cause of death in the US.`,
    metrics: {
      per100k: {
        metricId: 'ami_per_100k',
        chartTitle: 'Rates of Acute MI',
        shortLabel: 'Acute MI per 100k',
        columnTitleHeader: 'Medicare beneficiary acute MI cases',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'ami_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'phrma_population',
          shortLabel: 'beneficiaries',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of total beneficiary acute MI cases',
        metricId: 'ami_pct_share',
        columnTitleHeader: 'Share of total beneficiary acute MI cases',
        shortLabel: '% of beneficiary pop. with acute MI',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total acute MI cases',
          metricId: 'phrma_population_pct_share',
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
    dataTypeShortLabel: 'Adherence to Antiretroviral Medications',
    fullDisplayName: 'Adherence to antiretroviral medications',
    surveyCollectedData: true,
    dataTypeDefinition: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 90% for ≥3 antiretroviral medications during the measurement year.`,
    dataTypeDescription: `Effective treatment of HIV with antiretroviral medications can reduce mortality and morbidity rates among people affected by HIV (CITE).`,
    metrics: {
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
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Cases of HIV',
    surveyCollectedData: true,
    dataTypeDefinition: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of Human immunodeficiency virus (HIV) during the measurement period.`,
    dataTypeDescription: `HIV is a major public health crisis that infects thousands of people in the U.S. per year. If left untreated, HIV results in acquired immunodeficiency syndrome, which increases the risk of death.`,
    metrics: {
      per100k: {
        metricId: 'phrma_hiv_per_100k',
        chartTitle: 'Rates of HIV cases',
        shortLabel: 'cases per 100k',
        columnTitleHeader: 'Medicare beneficiary HIV cases',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'phrma_hiv_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'phrma_population',
          shortLabel: 'beneficiaries',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of total beneficiaries living with HIV',
        metricId: 'phrma_hiv_pct_share',
        columnTitleHeader: 'Share of total beneficiaries living with HIV',
        shortLabel: '% of beneficiary pop. living with HIV',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total HIV cases',
          metricId: 'phrma_population_pct_share',
          columnTitleHeader: 'Share of all beneficiaries',
          shortLabel: '% of beneficiary pop.',
          type: 'pct_share',
        },
      },
    },
  },
]
