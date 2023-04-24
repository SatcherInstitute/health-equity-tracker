import { Grid } from '@mui/material'
import { type VariableConfig } from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import MapBreadcrumbs from './MapBreadcrumbs'
import SviAlert from './SviAlert'
import styles from './GeoContext.module.scss'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'

interface GeoContextProps {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  variableConfig: VariableConfig
  populationQueryResponse: MetricQueryResponse
  sviQueryResponse: MetricQueryResponse | null
}

const HASH_ID: ScrollableHashId = 'rate-map'

export default function GeoContext(props: GeoContextProps) {
  const { svi } = props.sviQueryResponse?.data?.[0] ?? {}
  const totalPopulation: string =
    props.populationQueryResponse.data?.[0].population?.toLocaleString() ??
    'unknown'

  return (
    <>
      <MapBreadcrumbs
        fips={props.fips}
        updateFipsCallback={props.updateFipsCallback}
        ariaLabel={props.variableConfig.variableFullDisplayName}
        scrollToHashId={HASH_ID}
        endNote={`Population ${totalPopulation}`}
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
