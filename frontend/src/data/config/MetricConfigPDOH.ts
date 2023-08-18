import { type DataTypeConfig } from './MetricConfig'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export const PDOH_CATEGORY_DROPDOWNIDS = [
  'incarceration',
  'voter_participation',
  'women_in_gov',
]

export type PDOHDataTypeId =
  | 'jail'
  | 'prison'
  | 'women_in_state_legislature'
  | 'women_in_us_congress'

export type PDOHMetricId =
  | 'ahr_population_pct'
  | 'cawp_population_pct'
  | 'incarceration_population_pct'
  | 'jail_pct_relative_inequity'
  | 'jail_pct_share'
  | 'jail_per_100k'
  | 'pct_share_of_state_leg'
  | 'pct_share_of_us_congress'
  | 'pct_share_of_women_state_leg'
  | 'pct_share_of_women_us_congress'
  | 'prison_pct_relative_inequity'
  | 'prison_pct_share'
  | 'prison_per_100k'
  | 'total_confined_children'
  | 'total_state_leg_count'
  | 'total_us_congress_count'
  | 'total_us_congress_names'
  | 'voter_participation_pct_rate'
  | 'voter_participation_pct_share'
  | 'women_state_leg_pct_relative_inequity'
  | 'women_this_race_state_leg_count'
  | 'women_this_race_us_congress_count'
  | 'women_this_race_us_congress_names'
  | 'women_us_congress_pct_relative_inequity'
  | 'women_us_congress_ratio_age_adjusted'

export const VOTER_PARTICIPATION_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'voter_participation',
    dataTypeShortLabel: 'Voter participation',
    fullDisplayName: 'Voter participation',
    fullDisplayNameInline: 'voter participation',
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for voter participation',
    dataTypeDefinition: `U.S. citizens ages 18 and older who voted in the last presidential election.`,
    metrics: {
      pct_rate: {
        metricId: 'voter_participation_pct_rate',
        columnTitleHeader: 'Voter Participation',
        chartTitle: 'Voter participation',
        shortLabel: '% voter participation',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Share of all voter participation',
        metricId: 'voter_participation_pct_share',
        columnTitleHeader: 'Share of all voter participation',
        shortLabel: '% of voters',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total voter participation',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const WOMEN_IN_GOV_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'women_in_us_congress',
    dataTypeShortLabel: 'US Congress',
    fullDisplayName: 'Women in US Congress',
    surveyCollectedData: true,
    timeSeriesData: true,
    dataTypeDefinition: `Individuals identifying as women who have served in the Congress of the United States, including members of the U.S. Senate and members, territorial delegates, and resident commissioners of the U.S. House of Representatives. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.`,
    dataTableTitle: 'Breakdown summary for Women in US Congress',
    metrics: {
      pct_rate: {
        metricId: 'pct_share_of_us_congress',
        trendsCardTitleName:
          'Yearly rates of US Congress members identifying as women',
        columnTitleHeader: 'Share of Congress for women of each race',
        chartTitle: 'Current rates of US Congress members identifying as women',
        shortLabel: '% women in Congress',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'women_this_race_us_congress_count',
          shortLabel: 'members',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'total_us_congress_count',
          shortLabel: 'Total members',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Percent share of women US Congress members',
        metricId: 'pct_share_of_women_us_congress',
        trendsCardTitleName:
          'Inequitable share of women in U.S. Congress over time',
        columnTitleHeader: 'Percent share of women US Congress members',
        shortLabel: '% of women members',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total women in US congress',
          metricId: 'cawp_population_pct',
          columnTitleHeader: 'Total population share (all genders)',
          shortLabel: `${populationPctShortLabel} (all genders)`,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle:
          'Relative racial inequity of women in US Congress over time',
        metricId: 'women_us_congress_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
  {
    dataTypeId: 'women_in_state_legislature',
    dataTypeShortLabel: 'State legislatures', // DATA TOGGLE
    fullDisplayName: 'Women in state legislatures', // TABLE TITLE,
    surveyCollectedData: true,
    timeSeriesData: true,
    dataTypeDefinition: `Individuals identifying as women currently serving in their state or territory’s legislature. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.
    `,
    dataTableTitle: 'Breakdown summary for Women in state legislatures',
    metrics: {
      pct_rate: {
        metricId: 'pct_share_of_state_leg',
        chartTitle: 'Percentage of state legislators identifying as women',
        // MAP CARD HEADING, SIMPLE BAR TITLE, MAP INFO ALERT, TABLE COL HEADER, HI/LOW DROPDOWN FOOTNOTE
        trendsCardTitleName: 'Rates of women in state legislatures over time',
        columnTitleHeader: 'Percentage of women state legislators',
        shortLabel: '% women in state legislature', // SIMPLE BAR LEGEND, MAP LEGEND, INFO BOX IN MAP CARD
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'women_this_race_state_leg_count',
          shortLabel: 'legislators',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'total_state_leg_count',
          shortLabel: 'Total legislators',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Percent share of women state legislators', // UNKNOWNS MAP TITLE, DISPARITY BAR TITLE
        metricId: 'pct_share_of_women_state_leg',
        trendsCardTitleName:
          'Inequitable share of women in state legislatures over time',
        columnTitleHeader: 'Percent share of women state legislators',
        shortLabel: '% of women legislators', // DISPARITY BAR LEGEND
        unknownsVegaLabel: '% unknown race',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total women in state legislatures',
          metricId: 'cawp_population_pct',
          columnTitleHeader: 'Total population share (all genders)', // TABLE COLUMN HEADER
          shortLabel: `${populationPctShortLabel} (all genders)`, // DISPARITY BAR LEGEND/AXIS
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle:
          'Relative racial inequity of women state legislators over time',
        metricId: 'women_state_leg_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const INCARCERATION_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'prison',
    dataTypeShortLabel: 'Prison',
    fullDisplayName: 'People in prison',
    fullDisplayNameInline: 'people in prison',
    surveyCollectedData: true,
    timeSeriesData: true,
    dataTypeDefinition: `Individuals of any age, including children, under the jurisdiction of an adult prison facility. ‘Age’ reports at the national level include only the subset of this jurisdictional population who have been sentenced to one year or more, which accounted for 97% of the total U.S. prison population in 2020. For all national reports, this rate includes both state and federal prisons. For state and territory level reports, only the prisoners under the jurisdiction of that geography are included. For county level reports, Vera reports the
    number of people incarcerated under the jurisdiction of a state prison system on charges arising from a criminal case in that specific county, which are not available in every state. The county of court commitment is generally where a person was convicted; it is not necessarily the person’s county of residence, and may not even be the county where the crime was committed, but nevertheless is likely to be both.  AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Prisons are longer-term facilities run by the state or the federal government that typically hold felons and persons with sentences of more than one year. Definitions may vary by state.`,
    dataTableTitle: 'Breakdown summary for people in prison',
    metrics: {
      per100k: {
        metricId: 'prison_per_100k',
        chartTitle: 'Prison incarceration',
        trendsCardTitleName: 'Rates of prison incarceration over time',
        columnTitleHeader: 'People in prison per 100k',
        shortLabel: 'prison per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Percent share of total prison population',
        metricId: 'prison_pct_share',
        trendsCardTitleName:
          'Inequitable share of prison incarceration over time',
        columnTitleHeader: 'Percent share of total prison population',
        shortLabel: '% of prison pop.',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total people in prison',
          metricId: 'incarceration_population_pct',
          columnTitleHeader: 'Total population share',
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        knownBreakdownComparisonMetric: {
          chartTitle: '',
          metricId: 'prison_pct_share',
          columnTitleHeader: 'Percent share of total prison population',
          shortLabel: '% of total prison population',
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity of prison incarceration over time',
        metricId: 'prison_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
  {
    dataTypeId: 'jail',
    dataTypeShortLabel: 'Jail',
    fullDisplayName: 'People in jail',
    fullDisplayNameInline: 'people in jail',
    surveyCollectedData: true,
    timeSeriesData: true,
    dataTypeDefinition: `Individuals of any age, including children, confined in a local, adult jail facility. AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Jails are locally operated short-term facilities that hold inmates awaiting trial or sentencing or both, and inmates sentenced to a term of less than one year, typically misdemeanants. Definitions may vary by state.`,
    dataTableTitle: 'Breakdown summary for people in jail',
    metrics: {
      per100k: {
        metricId: 'jail_per_100k',
        chartTitle: 'Jail incarceration',
        trendsCardTitleName: 'Rates of jail incarceration over time',
        columnTitleHeader: 'People in jail per 100k',
        shortLabel: 'jail per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Percent share of total jail population',
        metricId: 'jail_pct_share',
        trendsCardTitleName:
          'Inequitable share of jail incarceration over time',
        columnTitleHeader: 'Percent share of total jail population',
        shortLabel: '% of total jail population',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total people in jail',
          metricId: 'incarceration_population_pct',
          columnTitleHeader: 'Total population share',
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        knownBreakdownComparisonMetric: {
          chartTitle: '',
          metricId: 'jail_pct_share',
          columnTitleHeader: 'Percent share of total jail population',
          shortLabel: '% of total jail population',
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity of jail incarceration over time',
        metricId: 'jail_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]
