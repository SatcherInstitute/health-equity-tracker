import { CardContent, Alert } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { urlMap } from '../../utils/externalUrls'
import { type MetricId, type DataTypeId } from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type DemographicType } from '../../data/query/Breakdowns'
import { ALL } from '../../data/utils/Constants'
import { type Row } from '../../data/utils/DatasetTypes'

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

  const dataAlls: Row[] = props.queryResponse.data.filter(
    (row) => row[props.demographicType] === ALL
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
    <CardContent>
      <Alert severity={'warning'} role="note" icon={<FlagIcon />}>
        The groups above refer to <b>sex assigned at birth</b>, as opposed to{' '}
        <b>gender identity</b>. Due to lack of reliable population data for
        gender-expansive people, we are unable to present <b>rates per 100k</b>,
        however our data sources do provide the following 2019 case counts for{' '}
        <b>
          people {hivPhraseMap?.[props?.dataTypeId]} in{' '}
          {props.fips.getSentenceDisplayName()}
        </b>
        :
        <ul>
          <li>
            <b>
              {transMenCount.toLocaleString()} individuals identified as
              transgender men
            </b>
          </li>

          <li>
            <b>
              {transWomenCount.toLocaleString()} individuals identified as
              transgender women
            </b>
          </li>
          <li>
            <b>
              {agiCount.toLocaleString()} individuals with additional gender
              identities (AGI)
            </b>
          </li>
        </ul>
        Visit the{' '}
        <a href={urlMap.cdcTrans}>
          CDC's HIV Prevention and Care for Transgender People
        </a>{' '}
        to learn more.
      </Alert>
    </CardContent>
  )
}

export default GenderDataShortAlert
