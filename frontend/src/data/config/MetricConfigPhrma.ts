import { type DataTypeConfig } from './MetricConfig'

export const MEDICARE_CATEGORY_DROPDOWNIDS = [
  'phrma_cardiovascular',
  // 'phrma_hiv',
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
  | 'arv_adherence_pct_rate'
  | 'arv_adherence_pct_share'
  | 'arv_population_pct_share'
  | 'beta_blockers_adherence_pct_rate'
  | 'beta_blockers_adherence_pct_share'
  | 'beta_blockers_population_pct_share'
  | 'ccb_adherence_pct_rate'
  | 'ccb_adherence_pct_share'
  | 'ccb_population_pct_share'
  | 'doac_adherence_pct_rate'
  | 'doac_adherence_pct_share'
  | 'doac_population_pct_share'
  | 'nqf_adherence_pct_rate'
  | 'nqf_adherence_pct_share'
  | 'nqf_population_pct_share'
  | 'rasa_adherence_pct_rate'
  | 'rasa_adherence_pct_share'
  | 'rasa_population_pct_share'
  | 'statins_adherence_pct_rate'
  | 'statins_adherence_pct_share'
  | 'statins_population_pct_share'
  | 'phrma_hiv_pct_share'
  | 'phrma_hiv_per_100k'
  | 'phrma_population_pct_share'

export const PHRMA_CARDIOVASCULAR_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'statins_adherence',
    dataTypeShortLabel: 'Adherence to Statins',
    fullDisplayName: 'Adherence to statins',
    surveyCollectedData: true,
    dataTypeDefinition: `Statins are medications that help lower cholesterol levels in the blood to reduce the risk of heart disease and stroke. “Adherence to statins” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for statins during the measurement year.`,
    metrics: {
      pct_rate: {
        metricId: 'statins_adherence_pct_rate',
        chartTitle: 'Adherence to statins',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Percent share of total statins adherence',
        metricId: 'statins_adherence_pct_share',
        columnTitleHeader: 'Percent share of total statins adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of statins beneficiary population vs. share of total adherence',
          metricId: 'statins_population_pct_share',
          columnTitleHeader: 'Share of all Medicare statins beneficiaries',
          shortLabel: '% of prescribed pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'beta_blockers_adherence',
    dataTypeShortLabel: 'Adherence to Beta-Blockers',
    fullDisplayName: 'Adherence to beta-blockers',
    surveyCollectedData: true,
    dataTypeDefinition: `Beta-blockers are medications that block the effects of adrenaline and help lower blood pressure, reduce heart rate, and manage conditions like hypertension and heart-related issues. “Adherence to beta-blockers” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for beta-blockers during the measurement year.`,
    metrics: {
      pct_rate: {
        metricId: 'beta_blockers_adherence_pct_rate',
        chartTitle: 'Adherence to beta-blockers',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Percent share of total beta-blockers adherence',
        metricId: 'beta_blockers_adherence_pct_share',
        columnTitleHeader: 'Percent share of total beta-blockers adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beta-blockers beneficiary population vs. share of total adherence',
          metricId: 'beta_blockers_population_pct_share',
          columnTitleHeader:
            'Share of all Medicare beta-blockers beneficiaries',
          shortLabel: '% of prescribed pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'nqf_adherence',
    dataTypeShortLabel: 'Adherence to Beta-Blockers Post-Heart Attack',
    fullDisplayName:
      'Persistence of Beta-Blocker Treatment After a Heart Attack',
    surveyCollectedData: true,
    dataTypeDefinition: `Beta-blockers are medications that are used after an acute myocardial infarction (heart attack) to reduce the workload on the heart, lower blood pressure, and improve heart function by blocking the effects of adrenaline and stress hormones. Adherence on this report is measured as the percentage of Medicare fee-for-service beneficiaries 18 years of age and older during the measurement year who were hospitalized and discharged with a diagnosis of acute myocardial infarction (AMI) and who received persistent beta-blocker treatment for six months after discharge.`,
    metrics: {
      pct_rate: {
        metricId: 'nqf_adherence_pct_rate',
        chartTitle:
          'Persistence of Beta-Blocker Treatment After a Heart Attack',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Percent share of total adherence',
        metricId: 'nqf_adherence_pct_share',
        columnTitleHeader: 'Percent share of total adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total adherence',
          metricId: 'nqf_population_pct_share',
          columnTitleHeader: 'Share of all Medicare beneficiaries',
          shortLabel: '% of prescribed pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'rasa_adherence',
    dataTypeShortLabel: 'Adherence to RAS-Antagonists',
    fullDisplayName: 'Adherence to RAS antagonists',
    surveyCollectedData: true,
    dataTypeDefinition: `
    Renin angiotensin system antagonists are medications that block the actions of certain hormones to regulate blood pressure and fluid balance in the body. “Adherence to RAS antagonists” is measured as percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for renin angiotensin system antagonists (RASA) during the measurement year.`,
    metrics: {
      pct_rate: {
        metricId: 'rasa_adherence_pct_rate',
        chartTitle: 'Adherence to RAS antagonists',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Percent share of total RAS antagonists adherence',
        metricId: 'rasa_adherence_pct_share',
        columnTitleHeader: 'Percent share of total RAS antagonists adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of RASA beneficiary population vs. share of total adherence',
          metricId: 'rasa_population_pct_share',
          columnTitleHeader:
            'Share of all Medicare RAS antagonists beneficiaries',
          shortLabel: '% of prescribed pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'ccb_adherence',
    dataTypeShortLabel: 'Adherence to Calcium Channel Blockers',
    fullDisplayName: 'Adherence to calcium channel blockers',
    surveyCollectedData: true,
    dataTypeDefinition: `Calcium channel blockers are medications that relax and widen blood vessels, making it easier for the heart to pump blood and reducing blood pressure. “Adherence to calcium channel blockers” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for calcium channel blockers during the measurement year.`,
    metrics: {
      pct_rate: {
        metricId: 'ccb_adherence_pct_rate',
        chartTitle: 'Adherence to calcium channel blockers',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Percent share of total calcium channel blockers adherence',
        metricId: 'ccb_adherence_pct_share',
        columnTitleHeader:
          'Percent share of total calcium channel blockers adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of calcium channel blockers beneficiary population vs. share of total adherence',
          metricId: 'ccb_population_pct_share',
          columnTitleHeader:
            'Share of all Medicare calcium channel blockers beneficiaries',
          shortLabel: '% of prescribed pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'doac_adherence',
    dataTypeShortLabel: 'Adherence to Direct Oral Anticoagulants',
    fullDisplayName: 'Direct Oral Anticoagulants',
    surveyCollectedData: true,
    dataTypeDefinition: `Direct oral anticoagulants are medications that help prevent blood clot formation by inhibiting specific clotting factors, reducing the risk of stroke and blood clots in conditions such as atrial fibrillation and deep vein thrombosis. “Adherence to direct oral anticoagulants” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% during the measurement period for direct-acting oral anticoagulants.`,
    metrics: {
      pct_rate: {
        metricId: 'doac_adherence_pct_rate',
        chartTitle: 'Direct Oral Anticoagulants Adherence',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle:
          'Percent share of total Direct Oral Anticoagulants adherence',
        metricId: 'doac_adherence_pct_share',
        columnTitleHeader:
          'Percent share of total Direct Oral Anticoagulants adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of Direct Oral Anticoagulants beneficiary population vs. share of total adherence',
          metricId: 'doac_population_pct_share',
          columnTitleHeader:
            'Share of all Medicare Direct Oral Anticoagulants beneficiaries',
          shortLabel: '% of prescribed pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'ami',
    dataTypeShortLabel: 'Heart Attacks (Acute MI)',
    fullDisplayName: 'Acute Myocardial Infarctions (Heart Attacks)',
    surveyCollectedData: true,
    dataTypeDefinition: `Acute myocardial infarctions, commonly known as heart attacks, occur when the blood flow to the heart muscle is severely blocked, leading to damage or death of the heart tissue. “Acute MI per 100k” is measured as the number of Medicare fee-for-service beneficiaries with a diagnosis of acute myocardial infarction (AMI) per 100K during the measurement period.`,
    metrics: {
      per100k: {
        metricId: 'ami_per_100k',
        chartTitle: 'Rates of Acute MI',
        shortLabel: 'Acute MI per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Percent share of total Acute MI',
        metricId: 'ami_pct_share',
        columnTitleHeader: 'Percent share of total Acute MI',
        shortLabel: '% of total Acute MI',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total Acute MI',
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
    dataTypeShortLabel: 'Medication Adherence (Antiretrovirals)',
    fullDisplayName: 'Adherence to antiretrovirals',
    surveyCollectedData: true,
    dataTypeDefinition: `HIV antiretrovirals are medications that help control the HIV virus by interfering with its replication process, reducing viral load, and improving the immune system's ability to fight the infection. “Adherence to antiretrovirals” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 90% for ≥3 antiretroviral medications during the measurement year.`,
    metrics: {
      pct_rate: {
        metricId: 'arv_adherence_pct_rate',
        chartTitle: 'Adherence to antiretrovirals',
        shortLabel: '% adherent',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Percent share of total antiretrovirals adherence',
        metricId: 'arv_adherence_pct_share',
        columnTitleHeader: 'Percent share of total antiretrovirals adherence',
        shortLabel: '% of total adherence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of antiretrovirals beneficiary population vs. share of total adherence',
          metricId: 'arv_population_pct_share',
          columnTitleHeader:
            'Share of all Medicare antiretrovirals beneficiaries',
          shortLabel: '% of beneficiary pop.',
          type: 'pct_share',
        },
      },
    },
  },
  {
    dataTypeId: 'phrma_hiv',
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'HIV cases',
    surveyCollectedData: true,
    dataTypeDefinition: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of HIV during the measurement period.`,
    metrics: {
      per100k: {
        metricId: 'phrma_hiv_per_100k',
        chartTitle: 'Rates of HIV cases',
        shortLabel: 'cases per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Percent share of total HIV cases',
        metricId: 'phrma_hiv_pct_share',
        columnTitleHeader: 'Percent share of total HIV cases',
        shortLabel: '% of total HIV cases',
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
