import { urlMap } from '../../utils/externalUrls'
import type { MetricId, DataTypeId } from '../../data/config/MetricConfigTypes'
import type { Fips } from '../../data/utils/Fips'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { DemographicType } from '../../data/query/Breakdowns'
import { ALL } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

interface GenderDataShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
  demographicType: DemographicType
  dataTypeId: DataTypeId
}

function GenderDataShortAlert(props: GenderDataShortAlertProps) {
  const hivPhraseMap: Partial<Record<DataTypeId, string>> = {
    hiv_deaths: 'who died from HIV or AIDS',
    hiv_prevalence: 'living with HIV',
    hiv_care: 'with linkage to HIV care',
    hiv_diagnoses: 'newly diagnosed with HIV',
  }

  interface GenderCounts {
    men: MetricId
    women: MetricId
    agi: MetricId
  }
  const hivGenderCountsMap: Partial<Record<DataTypeId, GenderCounts>> = {
    hiv_deaths: {
      agi: 'hiv_deaths_total_additional_gender',
      men: 'hiv_deaths_total_trans_men',
      women: 'hiv_deaths_total_trans_women',
    },
    hiv_prevalence: {
      agi: 'hiv_prevalence_total_additional_gender',
      men: 'hiv_prevalence_total_trans_men',
      women: 'hiv_prevalence_total_trans_women',
    },
    hiv_care: {
      agi: 'hiv_care_total_additional_gender',
      men: 'hiv_care_total_trans_men',
      women: 'hiv_care_total_trans_women',
    },
    hiv_diagnoses: {
      agi: 'hiv_diagnoses_total_additional_gender',
      men: 'hiv_diagnoses_total_trans_men',
      women: 'hiv_diagnoses_total_trans_women',
    },
  }

  const dataAlls: HetRow[] = props.queryResponse.data.filter(
    (row) => row[props.demographicType] === ALL,
  )

  const transMenCountId: MetricId | undefined =
    hivGenderCountsMap[props.dataTypeId]?.men
  const transWomenCountId: MetricId | undefined =
    hivGenderCountsMap[props.dataTypeId]?.women
  const agiCountId: MetricId | undefined =
    hivGenderCountsMap[props.dataTypeId]?.agi

  if (!transMenCountId || !transWomenCountId || !agiCountId) return <></>

  const transMenCount: number = dataAlls[0]?.[transMenCountId]
  const transWomenCount: number = dataAlls[0]?.[transWomenCountId]
  const agiCount: number = dataAlls[0]?.[agiCountId]

  if (!transMenCount && !transWomenCount && !agiCount) return <></>

  return (
    <HetNotice kind='data-integrity'>
      The groups above refer to <HetTerm>sex assigned at birth</HetTerm>, as
      opposed to <HetTerm>gender identity</HetTerm>. Due to lack of reliable
      population data for gender-expansive people, we are unable to present{' '}
      <HetTerm>rates per 100k</HetTerm>, however our data sources do provide the
      following 2019 case counts for{' '}
      <HetTerm>
        people {hivPhraseMap?.[props?.dataTypeId] ?? ''} in{' '}
        {props.fips.getSentenceDisplayName()}
      </HetTerm>
      :
      <ul>
        <li>
          {transMenCount.toLocaleString()} individuals identified as{' '}
          <HetTerm>transgender men</HetTerm>
        </li>

        <li>
          {transWomenCount.toLocaleString()} individuals identified as{' '}
          <HetTerm>transgender women</HetTerm>
        </li>
        <li>
          {agiCount.toLocaleString()} individuals with{' '}
          <HetTerm>additional gender identities (AGI)</HetTerm>
        </li>
      </ul>
      Visit the{' '}
      <a href={urlMap.cdcTrans}>
        CDC's HIV Prevention and Care for Transgender People
      </a>{' '}
      to learn more.
    </HetNotice>
  )
}

export default GenderDataShortAlert
