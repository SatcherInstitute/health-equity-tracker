import type { VisualizationType } from '../../charts/utils'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { AGE } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { splitIntoKnownsAndUnknowns } from '../../data/utils/datasetutils'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { WHAT_DATA_ARE_MISSING_ID } from '../../utils/internalRoutes'

const RACE_OR_ETHNICITY = 'race or ethnicity'

interface UnknownsAlertProps {
  queryResponse: MetricQueryResponse
  ageQueryResponse?: MetricQueryResponse
  metricConfig: MetricConfig
  demographicType: DemographicType
  displayType: VisualizationType
  known: boolean
  overrideAndWithOr?: boolean
  raceEthDiffMap?: boolean
  noDemographicInfoMap?: boolean
  showingVisualization?: boolean
  fips: Fips
  jumpToData?: () => void
}

export default function UnknownsAlert(props: UnknownsAlertProps) {
  const validData = props.queryResponse.getValidRowsForField(
    props.metricConfig.metricId,
  )

  const [, unknowns] = splitIntoKnownsAndUnknowns(
    validData,
    props.demographicType,
  )

  let additionalAgeUnknowns = null

  if (props.ageQueryResponse) {
    const validAgeData: HetRow[] = props.ageQueryResponse.getValidRowsForField(
      props.metricConfig.metricId,
    )
    const [, ageUnknowns] = splitIntoKnownsAndUnknowns(validAgeData, AGE)
    additionalAgeUnknowns = ageUnknowns
  }

  const demographicTypeDisplayName =
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]

  if (unknowns.length === 0) {
    return <></>
  }
  const raceEthnicityDiff =
    unknowns.length === 2 &&
    unknowns[0][props.metricConfig.metricId] !==
      unknowns[1][props.metricConfig.metricId]

  const cardHelperText = props.known
    ? `This ${
        props.displayType
      } only displays data for cases where ${demographicTypeDisplayName} ${
        props.overrideAndWithOr ? 'were both' : 'was'
      } known.`
    : `This ${props.displayType} displays data for cases where ${
        props.overrideAndWithOr
          ? ` either ${RACE_OR_ETHNICITY}`
          : demographicTypeDisplayName
      } was unknown.`

  const raceEthDiffMapText = `In cases where race and ethnicity are reported
    separately, the map shows the higher of the two metrics.`

  const percentageUnknown = unknowns[0][props.metricConfig.metricId]

  const secondaryAgePercentageUnknown: string =
    additionalAgeUnknowns?.[0]?.[props.metricConfig.metricId]

  const noUnknowns = percentageUnknown === 0

  const diffRaceEthnicityText = raceEthnicityDiff
    ? `This state reports race and ethnicity separately.
    ${unknowns[0][props.metricConfig.metricId] as string}${
      props.metricConfig.shortLabel
    } reported an
    ${unknowns[0][props.demographicType].toLowerCase() as string} and
    ${unknowns[1][props.metricConfig.metricId] as string}${
      props.metricConfig?.knownBreakdownComparisonMetric?.shortLabel ??
      'This group'
    } reported an
    ${unknowns[1][props.demographicType].toLowerCase() as string}.`
    : ''

  const showCardHelperText =
    /* for DISPARITY CHART  */ (props.displayType === 'chart' &&
      percentageUnknown !== 100 &&
      !props.noDemographicInfoMap) ||
    /* for UNKNOWNS MAP */ (percentageUnknown !== 100 &&
      percentageUnknown !== 0 &&
      props.showingVisualization)
  /* for AGE-ADJUSTMENT TABLE */
  const showDataGapsRisk = props.displayType === 'table'

  // In the case we have unknowns for race and ethnicity reported separately,
  // show the higher one on the map
  return raceEthnicityDiff ? (
    <HetNotice kind='data-integrity'>{diffRaceEthnicityText}</HetNotice>
  ) : (
    <HetNotice kind={noUnknowns ? 'helpful-info' : 'data-integrity'}>
      {percentageUnknown}
      {props.metricConfig.shortLabel}
      {' reported an unknown '}
      {props.overrideAndWithOr ? RACE_OR_ETHNICITY : demographicTypeDisplayName}
      {/* Age Adjusted Card reports both unknown RACE + AGE */}
      {secondaryAgePercentageUnknown
        ? `, and ${secondaryAgePercentageUnknown}${props.metricConfig.shortLabel} reported an unknown age`
        : null}
      {' in '}
      {props.fips.getSentenceDisplayName()} overall.{' '}
      {showCardHelperText && cardHelperText}
      {props.raceEthDiffMap && raceEthDiffMapText}
      {showDataGapsRisk && (
        <>
          Consider the possible impact of{' '}
          <a href={`#${WHAT_DATA_ARE_MISSING_ID}`}>data reporting gaps</a> when
          interpreting age-adjusted ratios.
        </>
      )}
    </HetNotice>
  )
}
