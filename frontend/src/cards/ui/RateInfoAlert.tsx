import { CardContent, Divider, Alert } from '@mui/material'
import {
  formatFieldValue,
  type MetricConfig,
  type DataTypeConfig,
} from '../../data/config/MetricConfig'
import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type DemographicGroup } from '../../data/utils/Constants'
import { type Fips } from '../../data/utils/Fips'
import { MultiMapLink } from './MultiMapLink'
import styles from '../Card.module.scss'
import { WHAT_DATA_ARE_MISSING_ID } from '../../utils/internalRoutes'

interface RateInfoAlertProps {
  overallQueryResponse: MetricQueryResponse
  currentBreakdown: BreakdownVar
  activeBreakdownFilter: DemographicGroup
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
      (row) => row[props.currentBreakdown] === props.activeBreakdownFilter
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
        {props.activeBreakdownFilter !== 'All' && ' for'}
        {/* } [ ages 30-39] */}
        {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.currentBreakdown] ===
          'age' &&
          props.activeBreakdownFilter !== 'All' &&
          ` ages ${props.activeBreakdownFilter}`}
        {/* } [Asian (non Hispanic) individuals] */}
        {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.currentBreakdown] !==
          'age' &&
          props.activeBreakdownFilter !== 'All' &&
          ` ${props.activeBreakdownFilter} individuals`}
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
            currentBreakdown={props.currentBreakdown}
            currentDataType={props.dataTypeConfig.fullDisplayName}
          />
        </Alert>
      </CardContent>
    </>
  )
}
