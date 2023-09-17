import { Grid } from '@mui/material'
import {
  type MetricId,
  type DataTypeConfig,
} from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import MapBreadcrumbs from './MapBreadcrumbs'
import SviAlert from './SviAlert'
import styles from './GeoContext.module.scss'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type DemographicType } from '../../data/query/Breakdowns'
import { ALL } from '../../data/utils/Constants'
import { PHRMA_METRICS } from '../../data/providers/PhrmaProvider'

interface GeoContextProps {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  dataTypeConfig: DataTypeConfig
  totalPopulationPhrase: string
  subPopulationPhrase: string
  sviQueryResponse: MetricQueryResponse | null
}

const HASH_ID: ScrollableHashId = 'rate-map'

export default function GeoContext(props: GeoContextProps) {
  const { svi } = props.sviQueryResponse?.data?.[0] ?? {}

  return (
    <>
      <MapBreadcrumbs
        fips={props.fips}
        updateFipsCallback={props.updateFipsCallback}
        ariaLabel={props.dataTypeConfig.fullDisplayName}
        scrollToHashId={HASH_ID}
        totalPopulationPhrase={props.totalPopulationPhrase}
        subPopulationPhrase={props.subPopulationPhrase}
      />
      <Grid className={styles.SviContainer}>
        <Grid>
          {props.fips.isCounty() && (
            <SviAlert
              svi={svi}
              sviQueryResponse={props.sviQueryResponse}
              fips={props.fips}
            />
          )}
        </Grid>
      </Grid>
    </>
  )
}

export function getPopulationPhrase(
  populationQueryResponse: MetricQueryResponse,
  demographicType: DemographicType,
  metricId: MetricId
): string {
  if (metricId === 'population') {
    const popAllCount: string =
      populationQueryResponse.data?.[0].population.toLocaleString()
    console.log(popAllCount)
    return `Total Population: ${popAllCount}`
  }
  if (PHRMA_METRICS.includes(metricId)) {
    const allRow = populationQueryResponse.data?.find(
      (row) => row[demographicType] === ALL
    )
    const popAllCount: string =
      allRow?.phrma_population.toLocaleString() ?? 'unknown'
    return `Total Medicare Population: ${popAllCount}`
  }
  return ''
}
