import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { ALL } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import HetBreadcrumbs from '../../styles/HetComponents/HetBreadcrumbs'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import SviAlert from './SviAlert'

interface GeoContextProps {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  dataTypeConfig: DataTypeConfig
  totalPopulationPhrase: string
  subPopulationPhrase: string
  sviQueryResponse: MetricQueryResponse | null
  isAtlantaMode?: boolean
}

const HASH_ID: ScrollableHashId = 'rate-map'

export default function GeoContext(props: GeoContextProps) {
  const { svi } = props.sviQueryResponse?.data?.[0] ?? {}

  return (
    <>
      <HetBreadcrumbs
        fips={props.fips}
        updateFipsCallback={props.updateFipsCallback}
        ariaLabel={props.dataTypeConfig.fullDisplayName}
        scrollToHashId={HASH_ID}
        totalPopulationPhrase={props.totalPopulationPhrase}
        subPopulationPhrase={
          props.isAtlantaMode ? '' : props.subPopulationPhrase
        }
        isAtlantaMode={props.isAtlantaMode}
      />
      <div className='md:flex md:items-center'>
        {props.fips.isCounty() && (
          <SviAlert
            svi={svi}
            sviQueryResponse={props.sviQueryResponse}
            fips={props.fips}
          />
        )}
      </div>
    </>
  )
}

const POP_MISSING_VALUE = 'unavailable'

export function getTotalACSPopulationPhrase(populationData: HetRow[]): string {
  const popAllCount: string = populationData?.[0]?.population?.toLocaleString()
  return `Total population: ${popAllCount ?? POP_MISSING_VALUE} (from ACS 2022)`
}

export function getSubPopulationPhrase(
  subPopulationData: HetRow[],
  subPopulationSourceLabel: string,
  demographicType: DemographicType,
  dataTypeConfig: DataTypeConfig,
): string {
  const subPopConfig =
    dataTypeConfig.metrics?.pct_rate ?? dataTypeConfig.metrics?.per100k
  if (!subPopConfig?.rateDenominatorMetric) return ''
  const allRow = subPopulationData.find((row) => row[demographicType] === ALL)
  const popAllCount: string =
    allRow?.[subPopConfig.rateDenominatorMetric?.metricId]?.toLocaleString(
      'en-US',
      { maximumFractionDigits: 0 },
    ) ?? POP_MISSING_VALUE

  const combinedSubPop = [
    dataTypeConfig.otherSubPopulationLabel,
    dataTypeConfig.ageSubPopulationLabel,
  ]
    .filter(Boolean)
    .join(', ')

  return `Total population${dataTypeConfig.otherSubPopulationLabel ? ' of' : ''}${combinedSubPop ? ' ' + combinedSubPop : ''}: ${popAllCount}${subPopulationSourceLabel ? ' (from ' + subPopulationSourceLabel + ')' : ''}`
}
