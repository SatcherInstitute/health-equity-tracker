import { CardContent, Divider, Alert } from '@mui/material'
import {
  formatFieldValue,
  type MetricConfig,
  type DataTypeConfig,
} from '../../data/config/MetricConfig'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { ALL, type DemographicGroup } from '../../data/utils/Constants'
import { type Fips } from '../../data/utils/Fips'
import { MultiMapLink } from './MultiMapLink'
import styles from '../Card.module.scss'
import { WHAT_DATA_ARE_MISSING_ID } from '../../utils/internalRoutes'

interface RateInfoAlertProps {
  overallQueryResponse: MetricQueryResponse
  demographicType: DemographicType
  activeDemographicGroup: DemographicGroup
  metricConfig: MetricConfig
  fips: Fips
  setMultimapOpen: (smallMultiplesDialogOpen: boolean) => void
  dataTypeConfig: DataTypeConfig
}

export function RateInfoAlert(props: RateInfoAlertProps) {
  // If possible, calculate the total for the selected demographic group and dynamically generate the rest of the phrase
  //     {/* TODO: The "all" display in this info box should appear even if the only data available is the current level total */}

  function generateDemographicTotalPhrase() {
    const options = props.overallQueryResponse.data.find(
      (row) => row[props.demographicType] === props.activeDemographicGroup
    )

    return options ? (
      <>
        <b>
          {formatFieldValue(
            /* metricType: MetricType, */ props.metricConfig.type,
            /* value: any, */ options[props.metricConfig.metricId],
            /* omitPctSymbol: boolean = false */ true
          )}
        </b>{' '}
        {/* } HYPERLINKED TO BOTTOM DEFINITION {condition} cases per 100k  */}
        <a
          href={`#${WHAT_DATA_ARE_MISSING_ID}`}
          className={styles.ConditionDefinitionLink}
        >
          {props.metricConfig.shortLabel}
        </a>
        {/* } for  */}
        {props.activeDemographicGroup !== ALL && ' for'}
        {/* } [ ages 30-39] */}
        {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType] ===
          'age' &&
          props.activeDemographicGroup !== ALL &&
          ` ages ${props.activeDemographicGroup}`}
        {/* } [Asian (non Hispanic) individuals] */}
        {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType] !==
          'age' &&
          props.activeDemographicGroup !== ALL &&
          ` ${props.activeDemographicGroup} individuals`}
        {' in  '}
        {/* } Georgia */}
        {props.fips.getSentenceDisplayName()}
        {'. '}
      </>
    ) : (
      ''
    )
  }

  return (
    <>
      <Divider />
      <CardContent>
        <Alert severity="info" role="note">
          {generateDemographicTotalPhrase()}
          {/* Compare across XYZ for all variables except vaccinated at county level */}
          <MultiMapLink
            setMultimapOpen={props.setMultimapOpen}
            demographicType={props.demographicType}
            currentDataType={props.dataTypeConfig.fullDisplayName}
          />
        </Alert>
      </CardContent>
    </>
  )
}
