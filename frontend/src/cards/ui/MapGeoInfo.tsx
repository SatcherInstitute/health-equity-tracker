import { Divider } from '@mui/material'
import styles from './MapGeoInfo.module.scss'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import {
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
  type BreakdownVar,
} from '../../data/query/Breakdowns'
import { type DemographicGroup } from '../../data/utils/Constants'
import {
  formatFieldValue,
  type MetricConfig,
  type VariableConfig,
} from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'

interface MapGeoInfoProps {
  overallQueryResponse: MetricQueryResponse
  currentBreakdown: BreakdownVar
  activeBreakdownFilter: DemographicGroup
  metricConfig: MetricConfig
  fips: Fips
  variableConfig: VariableConfig
}

export default function MapGeoInfo(props: MapGeoInfoProps) {
  const options = props.overallQueryResponse.data.find(
    (row) => row[props.currentBreakdown] === props.activeBreakdownFilter
  )
  return (
    <>
      <Divider />

      <div className={styles.MapGeoInfoBox}>
        <b>
          {formatFieldValue(
            /* metricType: MetricType, */ props.metricConfig.type,
            /* value: any, */ options?.[props.metricConfig.metricId],
            /* omitPctSymbol: boolean = false */ true
          )}{' '}
          {props.metricConfig.shortLabel}
        </b>

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
        {' overall'}
      </div>
    </>
  )
}
