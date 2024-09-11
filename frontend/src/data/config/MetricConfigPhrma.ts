import {
  medicareHigherIsBetterMapConfig,
  medicareHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'

export const MEDICARE_CATEGORY_HIV_AND_CVD_DROPDOWNIDS = [
  'medicare_cardiovascular',
  'medicare_hiv',
]

export const MEDICARE_CATEGORY_DROPDOWNIDS = [
  'medicare_cardiovascular',
  'medicare_hiv',
  'medicare_mental_health',
] as const

export type PhrmaDataTypeId =
  | 'medicare_ami'
  | 'medicare_hiv'
  | 'medicare_schizophrenia'
  | 'anti_psychotics_adherence'
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
    categoryId: 'medicare',
    dataTypeId: 'bb_ami_adherence',
    dataTableTitle: 'Summary for persistence of beta blockers post AMI',
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
      citations: [
        {
          shortLabel:
            'American Heart Association/American College of Cardiology Foundation',
          longerTitle:
            'Smith, S. C., Jr, Benjamin, E. J., Bonow, R. O., Braun, L. T., Creager, M. A., Franklin, B. A., Gibbons, R. J., Grundy, S. M., Hiratzka, L. F., Jones, D. W., Lloyd-Jones, D. M., Minissian, M., Mosca, L., Peterson, E. D., Sacco, R. L., Spertus, J., Stein, J. H., Taubert, K. A., & World Heart Federation and the Preventive Cardiovascular Nurses Association (2011). AHA/ACCF Secondary Prevention and Risk Reduction Therapy for Patients with Coronary and other Atherosclerotic Vascular Disease: 2011 update: a guideline from the American Heart Association and American College of Cardiology Foundation. Circulation, 124(22), 2458–2473. https://doi.org/10.1161/CIR.0b013e318235eb4d',
          url: 'https://doi.org/10.1161/CIR.0b013e318235eb4d',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare Beta-Blocker Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
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
    categoryId: 'medicare',
    dataTypeId: 'statins_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTableTitle: 'Summary for adherence to statins',

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
          shortLabel:
            'American College of Cardiology/American Heart Association',
          longerTitle:
            'Stone NJ, Robinson JG, Lichtenstein AH, et al. American College of Cardiology/American Heart Association Task Force on Practice Guidelines. 2013 ACC/AHA guideline on the treatment of blood cholesterol to reduce atherosclerotic cardiovascular risk in adults: a report of the American College of Cardiology/American Heart Association Task Force on Practice Guidelines. Circulation. 2014; 129(25 Suppl 2):S1-45. PMID: 24222016.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/24222016/',
        },
        {
          shortLabel:
            'American Association of Clinical Endocrinologists/American College of Endocrinology',
          longerTitle:
            'Jellinger PS, Handelsman Y, Rosenblit PD, et al. American Association of Clinical Endocrinologists and American College of Endocrinology Guidelines for Management of Dyslipidemia and Prevention of Cardiovascular Disease. Endocr Pract. 2017; 23(Suppl 2):1-87. PMID: 28437620.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/28437620/',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare Statins Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
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
    categoryId: 'medicare',
    dataTypeId: 'beta_blockers_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTableTitle: 'Summary for adherence to beta blockers',

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
      citations: [
        {
          shortLabel:
            'American College of Cardiology/American Heart Association',
          longerTitle:
            'Whelton, P. K., Carey, R. M., Aronow, W. S., Casey, D. E., Jr, Collins, K. J., Dennison Himmelfarb, C., DePalma, S. M., Gidding, S., Jamerson, K. A., Jones, D. W., MacLaughlin, E. J., Muntner, P., Ovbiagele, B., Smith, S. C., Jr, Spencer, C. C., Stafford, R. S., Taler, S. J., Thomas, R. J., Williams, K. A., Sr, Williamson, J. D., … Wright, J. T., Jr (2018). 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults: Executive Summary: A Report of the American College of Cardiology/American Heart Association Task Force on Clinical Practice Guidelines. Hypertension (Dallas, Tex. : 1979), 71(6), 1269–1324.',
          url: 'https://doi.org/10.1161/HYP.0000000000000066',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare Beta Blockers Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
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
    categoryId: 'medicare',
    dataTypeId: 'ras_antagonists_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel:
      'Adherence to Renin Angiotensin System Antagonists (RASA)',
    dataTableTitle:
      'Summary for adherence to renin angiotensin system antagonists',

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
      citations: [
        {
          shortLabel:
            'American College of Cardiology/American Heart Association',
          longerTitle:
            'Whelton, P. K., Carey, R. M., Aronow, W. S., Casey, D. E., Jr, Collins, K. J., Dennison Himmelfarb, C., DePalma, S. M., Gidding, S., Jamerson, K. A., Jones, D. W., MacLaughlin, E. J., Muntner, P., Ovbiagele, B., Smith, S. C., Jr, Spencer, C. C., Stafford, R. S., Taler, S. J., Thomas, R. J., Williams, K. A., Sr, Williamson, J. D., … Wright, J. T., Jr (2018). 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults: Executive Summary: A Report of the American College of Cardiology/American Heart Association Task Force on Clinical Practice Guidelines. Hypertension (Dallas, Tex. : 1979), 71(6), 1269–1324.',
          url: 'https://doi.org/10.1161/HYP.0000000000000066',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare RASA Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
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
    categoryId: 'medicare',
    dataTypeId: 'ccb_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Calcium Channel Blockers',
    fullDisplayName: 'Adherence to calcium channel blockers',
    dataTableTitle: 'Summary for adherence to calcium channel blockers',

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
      citations: [
        {
          shortLabel:
            'American College of Cardiology/American Heart Association',
          longerTitle:
            'Whelton, P. K., Carey, R. M., Aronow, W. S., Casey, D. E., Jr, Collins, K. J., Dennison Himmelfarb, C., DePalma, S. M., Gidding, S., Jamerson, K. A., Jones, D. W., MacLaughlin, E. J., Muntner, P., Ovbiagele, B., Smith, S. C., Jr, Spencer, C. C., Stafford, R. S., Taler, S. J., Thomas, R. J., Williams, K. A., Sr, Williamson, J. D., … Wright, J. T., Jr (2018). 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults: Executive Summary: A Report of the American College of Cardiology/American Heart Association Task Force on Clinical Practice Guidelines. Hypertension (Dallas, Tex. : 1979), 71(6), 1269–1324.',
          url: 'https://doi.org/10.1161/HYP.0000000000000066',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare CCBs Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
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
    categoryId: 'medicare',
    dataTypeId: 'doac_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Direct Oral Anticoagulants (DOACs)',
    dataTableTitle: 'Summary for adherence to direct oral anticoagulants',

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
      citations: [
        {
          shortLabel:
            'American Heart Association / American Stroke Association',
          longerTitle:
            'Kleindorfer, D. O., Towfighi, A., Chaturvedi, S., Cockroft, K. M., Gutierrez, J., Lombardi-Hill, D., Kamel, H., Kernan, W. N., Kittner, S. J., Leira, E. C., Lennon, O., Meschia, J. F., Nguyen, T. N., Pollak, P. M., Santangeli, P., Sharrief, A. Z., Smith, S. C., Jr, Turan, T. N., & Williams, L. S. (2021). 2021 Guideline for the Prevention of Stroke in Patients With Stroke and Transient Ischemic Attack: A Guideline From the American Heart Association/American Stroke Association. Stroke, 52(7), e364–e467. https://doi.org/10.1161/STR.0000000000000375',
          url: 'https://doi.org/10.1161/STR.0000000000000375',
        },
      ],
      /*

      */
    },
    otherSubPopulationLabel: 'Medicare DOACs Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
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
    categoryId: 'medicare',
    dataTypeId: 'medicare_ami',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases of Heart Attacks (Acute MI)',
    dataTableTitle: 'Summary for acute myocardial infarctions (heart attacks)',

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
    otherSubPopulationLabel: 'Medicare Beneficiaries diagnosed with AMI',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
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
    categoryId: 'medicare',
    dataTypeId: 'arv_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Antiretroviral Medications',
    dataTableTitle: 'Summary for adherence to antiretrovirals',

    fullDisplayName: 'Adherence to antiretroviral medications',
    surveyCollectedData: true,
    definition: {
      text: `Pharmacy Quality Alliance measure representing the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 90% for ≥3 antiretroviral medications during the measurement year.`,
      citations: [
        {
          shortLabel: 'PQA Alliance',
          longerTitle:
            'Proportion of Days Covered: Antiretroviral Medications (PDC-ARV). Pharmacy Quality Alliance. Updated September 2019.',
          url: 'https://www.pqaalliance.org/measures-overview#pdc-arv',
        },
      ],
    },
    description: {
      text: `Antiretroviral medications are recommended for the treatment of HIV.`,
      citations: [
        {
          shortLabel: 'CDC',
          longerTitle:
            'Centers for Disease Control and Prevention, Health Resources and Services Administration, National Institutes of Health, American Academy of HIV Medicine, Association of Nurses in AIDS Care, International Association of Providers of AIDS Care, the National Minority AIDS Council, and Urban Coalition for HIV / AIDS Prevention Services.Recommendations for HIV Prevention with Adults and Adolescents with HIV in the United States, 2014',
          url: 'https://health.gov/healthypeople/tools-action/browse-evidence-based-resources/recommendations-hiv-prevention-adults-and-adolescents-hiv-united-states-2014',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare ARV Beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
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
    categoryId: 'medicare',
    dataTypeId: 'medicare_hiv',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'HIV Cases',
    dataTableTitle: 'Summary for HIV cases',

    fullDisplayName: 'New HIV diagnoses',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of human immunodeficiency virus (HIV) during the measurement period.`,
    },
    description: {
      text: `HIV is a major public health crisis, which disproportionately impacts certain subpopulations.`,
      citations: [
        {
          shortLabel: 'CDC',
          longerTitle:
            'HIV Incidence. Centers for Disease and Control. https://www.cdc.gov/hiv/statistics/overview/in-us/incidence.html',
          url: 'https://www.cdc.gov/hiv/statistics/overview/in-us/incidence.html',
        },
      ],
    },
    otherSubPopulationLabel: 'Medicare beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      per100k: {
        metricId: 'medicare_hiv_per_100k',
        chartTitle: 'Rates of HIV diagnoses',
        shortLabel: 'cases per 100k',
        columnTitleHeader: 'Medicare beneficiary HIV diagnoses',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'medicare_hiv_estimated_total',
          shortLabel: 'diagnoses',
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
        chartTitle: 'Share of total HIV incidence',
        metricId: 'medicare_hiv_pct_share',
        columnTitleHeader: 'Share of total HIV incidence',
        shortLabel: '% of beneficiary pop. diagnosed with HIV',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Share of beneficiary population vs. share of total HIV diagnoses',
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
    categoryId: 'medicare',
    dataTypeId: 'anti_psychotics_adherence',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Adherence to Anti-Psychotics',
    dataTableTitle: 'Summary for adherence to anti-psychotics',

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
    otherSubPopulationLabel:
      'Medicare beneficiaries with schizophrenia or schizoaffective disorder',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
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
    categoryId: 'medicare',
    dataTypeId: 'medicare_schizophrenia',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Schizophrenia',
    dataTableTitle: 'Summary for schizophrenia cases',
    fullDisplayName: 'Cases of Schizophrenia',
    surveyCollectedData: true,
    definition: {
      text: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of schizophrenia during the measurement period.`,
    },
    otherSubPopulationLabel: 'Medicare beneficiaries',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
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
        chartTitle: 'Share of total schizophrenia cases',
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
