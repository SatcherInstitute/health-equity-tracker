import { SimpleHorizontalBarChart } from '../charts/SimpleHorizontalBarChart'
import type { Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  isPctType,
  type MetricId,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import CardWrapper from './CardWrapper'
import { exclude } from '../data/query/BreakdownFilter'
import {
  AIAN_API,
  ALL,
  NON_HISPANIC,
  UNKNOWN_RACE,
} from '../data/utils/Constants'
import MissingDataAlert from './ui/MissingDataAlert'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'

import IncarceratedChildrenShortAlert from './ui/IncarceratedChildrenShortAlert'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import ChartTitle from './ChartTitle'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import GenderDataShortAlert from './ui/GenderDataShortAlert'
import {
  DATATYPES_NEEDING_13PLUS,
  GENDER_METRICS,
} from '../data/providers/HivProvider'
import type { ElementHashIdHiddenOnScreenshot } from '../utils/hooks/useDownloadCardImage'
import { GUN_VIOLENCE_DATATYPES } from '../data/providers/GunViolenceProvider'
import LawEnforcementAlert from './ui/LawEnforcementAlert'
import HetNotice from '../styles/HetComponents/HetNotice'
import { urlMap } from '../utils/externalUrls'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

interface SimpleBarChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  reportTitle: string
  className?: string
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export default function SimpleBarChartCard(props: SimpleBarChartCardProps) {
  return (
    <SimpleBarChartCardWithKey
      key={props.dataTypeConfig.dataTypeId + props.demographicType}
      {...props}
    />
  )
}

function SimpleBarChartCardWithKey(props: SimpleBarChartCardProps) {
  const metricConfig =
    props.dataTypeConfig.metrics?.per100k ??
    props.dataTypeConfig.metrics?.pct_rate ??
    props.dataTypeConfig.metrics?.index

  if (!metricConfig) return <></>

  const isIncarceration = INCARCERATION_IDS.includes(
    props.dataTypeConfig.dataTypeId
  )
  const isHIV = DATATYPES_NEEDING_13PLUS.includes(
    props.dataTypeConfig.dataTypeId
  )

  const isGunDeaths = GUN_VIOLENCE_DATATYPES.includes(props.dataTypeConfig.dataTypeId)

  const metricIdsToFetch: MetricId[] = []
  metricIdsToFetch.push(metricConfig.metricId)
  isIncarceration && metricIdsToFetch.push('total_confined_children')

  if (isHIV) {
    metricIdsToFetch.push(...GENDER_METRICS)
  }

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API, UNKNOWN_RACE)
  )

  const query = new MetricQuery(
    metricIdsToFetch,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current'
  )

  const chartTitle = generateChartTitle(
    /* chartTitle: */ metricConfig.chartTitle,
    /* fips: */ props.fips
  )

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig
  )
  const filename = `${chartTitle}, by ${DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
    }`

  const HASH_ID: ScrollableHashId = 'rate-chart'

  const elementsToHide: ElementHashIdHiddenOnScreenshot[] = [
    '#card-options-menu',
  ]

  const defaultClasses = 'shadow-raised bg-white'

  return (
    <CardWrapper
      className={`rounded-sm relative m-2 p-3 ${defaultClasses} ${props.className}`}
      downloadTitle={filename}
      queries={[query]}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
    >
      {([queryResponse], metadata) => {
        const data = queryResponse.getValidRowsForField(metricConfig.metricId)

        const hideChart =
          data.length === 0 ||
          queryResponse.shouldShowMissingDataMessage([metricConfig.metricId])


        return (
          <div className='w-full'>
            {hideChart ? (
              <div className='w-full'>
                <ChartTitle
                  title={'Graph unavailable: ' + chartTitle}
                  subtitle={subtitle}
                />

                <MissingDataAlert
                  dataName={chartTitle}
                  demographicTypeString={
                    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                  }
                  fips={props.fips}
                />
              </div>
            ) : (
              <div className='w-full'>
                <ChartTitle title={chartTitle} subtitle={subtitle} />

                <SimpleHorizontalBarChart
                className='w-full'
                  data={data}
                  demographicType={props.demographicType}
                  metric={metricConfig}
                  filename={filename}
                  usePercentSuffix={isPctType(metricConfig.type)}
                />
                {isIncarceration && (
                  <IncarceratedChildrenShortAlert
                    fips={props.fips}
                    queryResponse={queryResponse}
                    demographicType={props.demographicType}
                  />
                )}
                {isHIV && breakdowns.demographicBreakdowns.sex.enabled && (
                  <GenderDataShortAlert
                    fips={props.fips}
                    queryResponse={queryResponse}
                    demographicType={props.demographicType}
                    dataTypeId={props.dataTypeConfig.dataTypeId}
                  />
                )}
                {isGunDeaths && (
                  <LawEnforcementAlert
                    fips={props.fips}
                    demographicType={props.demographicType}
                    metadata={metadata}
                    queryResponse={queryResponse}
                  />
                )}

              </div>
            )}
          </div>
        )
      }}
    </CardWrapper>
  )
}
