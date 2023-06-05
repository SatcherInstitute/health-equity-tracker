import { Grid } from '@mui/material'
import { type DataTypeConfig } from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import MapBreadcrumbs from './MapBreadcrumbs'
import SviAlert from './SviAlert'
import styles from './GeoContext.module.scss'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'

interface GeoContextProps {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  dataTypeConfig: DataTypeConfig
  totalPopulationPhrase: string
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
        endNote={props.totalPopulationPhrase}
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
  populationQueryResponse: MetricQueryResponse
): string {
  const totalPopulation: string =
    populationQueryResponse.data?.[0].population?.toLocaleString() ?? 'unknown'

  return `Total Population: ${totalPopulation}`
}
