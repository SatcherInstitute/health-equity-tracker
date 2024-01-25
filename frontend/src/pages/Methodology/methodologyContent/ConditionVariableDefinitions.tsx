import {
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  COVID_19_LINK,
  HIV_LINK,
  PDOH_LINK,
  SDOH_LINK,
} from '../../../utils/internalRoutes'

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
  id?: string
}

// TODO: This file should be deleted once the new methodology pages all retrieve the existing definitions from the correct MetricConfig.ts files.

export const conditionVariableDefinitions: DataItem[] = [
  {
    topic: 'Behavioral Health',
    path: BEHAVIORAL_HEALTH_LINK,
    id: '#behavioral-health-variables',
    definitions: [
      {
        key: 'Depression cases',
        description:
          'Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.',
      },
      {
        key: 'Excessive drinking cases',
        description:
          'Adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week).',
      },
      {
        key: 'Frequent mental distress cases',
        description:
          'Adults who reported their mental health was not good 14 or more days in the past 30 days.',
      },
      {
        key: 'Opioid and other non-medical drug use',
        description:
          'Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months.',
      },
      {
        key: 'Suicides',
        description: 'Deaths due to intentional self-harm.',
      },
    ],
  },

  {
    topic: 'Chronic Diseases',
    path: CHRONIC_DISEASE_LINK,
    id: '#chronic-diseases-variables',
    definitions: [
      {
        key: 'Asthma cases',
        description:
          'Adults who reported being told by a health professional that they currently have asthma.',
      },
      {
        key: 'Cases of cardiovascular diseases',
        description:
          'Adults who reported being told by a health professional that they had angina or coronary heart disease; a heart attack or myocardial infarction; or a stroke.',
      },
      {
        key: 'Cases of chronic kidney disease',
        description:
          'Adults who reported being told by a health professional that they have kidney disease not including kidney stones, bladder infection or incontinence.',
      },
      {
        key: 'COPD',
        description:
          'Adults who reported being told by a health professional that they have chronic obstructive pulmonary disease, emphysema or chronic bronchitis.',
      },
      {
        key: 'Diabetes',
        description:
          'Adults who reported being told by a health professional that they have diabetes (excluding prediabetes and gestational diabetes).',
      },
    ],
  },

  {
    topic: 'COVID-19',
    path: COVID_19_LINK,
    id: '#covid-19-variables',
    definitions: [
      {
        key: 'COVID-19 cases',
        description:
          'A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a “case definition”. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.',
      },
      {
        key: 'COVID-19 deaths',
        description: 'The number of people who died due to COVID-19.',
      },
      {
        key: 'COVID-19 hospitalizations',
        description:
          'The number of people hospitalized at any point while ill with COVID-19.',
      },
      {
        key: 'COVID-19 vaccinations',
        description:
          'For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.',
      },
    ],
  },

  {
    topic: 'HIV',
    path: HIV_LINK,
    id: '#hiv-variables',
    definitions: [
      {
        key: 'HIV prevalence',
        description:
          'Individuals ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year.',
      },
      {
        key: 'New HIV diagnoses',
        description:
          'Individuals ages 13+ diagnosed with HIV in a particular year.',
      },
      {
        key: 'HIV deaths',
        description:
          'Individuals ages 13+ who died from HIV or AIDS in a particular year.',
      },
      {
        key: 'HIV prevalence for Black women',
        description:
          'Black or African-American (NH) women ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year.',
      },
      {
        key: 'New HIV diagnoses for Black women',
        description:
          'Black or African-American (NH) women ages 13+ diagnosed with HIV in a particular year.',
      },
      {
        key: 'HIV deaths for Black women',
        description:
          'Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a particular year.',
      },
      {
        key: 'PrEP coverage',
        description:
          'Individuals ages 16+ prescribed PrEP medication in a particular year.',
      },
      {
        key: 'Linkage to HIV care',
        description:
          'Individuals ages 13+ with linkage to HIV care in a particular year.',
      },
      {
        key: 'HIV stigma',
        description:
          'Self-reported stigma scores ranging from 0 (no stigma) to 100 (high stigma) for HIV-diagnosed individuals ages 18+ in a particular year.',
      },
    ],
  },

  {
    topic: 'Political Determinants of Health (PDOH)',
    path: PDOH_LINK,
    id: '#pdoh-variables',
    definitions: [
      {
        key: 'Voter participation',
        description:
          'U.S. citizens ages 18 and older who voted in the last presidential election.',
      },
      {
        key: 'Women in US Congress',
        description:
          'Individuals identifying as women who have served in the Congress of the United States, including members of the U.S. Senate and members, territorial delegates, and resident commissioners of the U.S. House of Representatives. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.',
      },
      {
        key: 'Women in state legislatures',
        description: `Individuals identifying as women currently serving in their state or territory's legislature. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.`,
      },
      {
        key: 'People in prison',
        description:
          'Individuals of any age, including children, under the jurisdiction of an adult prison facility. ‘Age’ reports at the national level include only the subset of this jurisdictional population who have been sentenced to one year or more, which accounted for 97% of the total U.S. prison population in 2020. For all national reports, this rate includes both state and federal prisons. For state number of people incarcerated under the jurisdiction of a state prison system on charges arising from a criminal case in that specific county, which are not available in every state. The county of court commitment is generally where a person was convicted; it is not necessarily the person’s county of residence, and may not even be the county where the crime was committed, but nevertheless is likely to be both. AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Prisons are longer-term facilities run by the state or the federal government that typically hold felons and persons with sentences of more than one year. Definitions may vary by state.',
      },
      {
        key: 'People in jail',
        description:
          'Individuals of any age, including children, confined in a local, adult jail facility. AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Jails are locally operated short-term facilities that hold inmates awaiting trial or sentencing or both, and inmates sentenced to a term of less than one year, typically misdemeanants. Definitions may vary by state.',
      },
    ],
  },
  {
    topic: 'Social Determinants of Health (SDOH)',
    path: SDOH_LINK,
    id: '#sdoh-variables',
    definitions: [
      {
        key: 'Care avoidance due to cost',
        description:
          'Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.',
      },
      {
        key: 'People below the poverty line',
        description: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
      },
      {
        key: 'Uninsured people',
        description:
          'Health insurance coverage in the ACS and other Census Bureau surveys define coverage to include plans and programs that provide comprehensive health coverage. Plans that provide insurance only for specific conditions or situations such as cancer and long-term care policies are not considered comprehensive health coverage. Likewise, other types of insurance like dental, vision, life, and disability insurance are not considered comprehensive health insurance coverage.',
      },

      {
        key: 'Preventable hospitalization',
        description:
          'Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.',
      },
    ],
  },
]
