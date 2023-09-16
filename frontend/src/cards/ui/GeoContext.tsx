import { Grid } from '@mui/material'
import {
  type MetricId,
  type DataTypeConfig,
  type DataTypeId,
  type DropdownVarId,
} from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import MapBreadcrumbs from './MapBreadcrumbs'
import SviAlert from './SviAlert'
import styles from './GeoContext.module.scss'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { getParentDropdownFromDataTypeId } from '../../pages/ExploreData/MadLibUI'

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

type PopConfig = [string, MetricId]

export function getPopulationPhrase(
  populationQueryResponse: MetricQueryResponse,
  dataTypeId?: DataTypeId
): string {
  const dropdownVarId: DropdownVarId | undefined = dataTypeId
    ? getParentDropdownFromDataTypeId(dataTypeId)
    : undefined

  const popLookup: Partial<Record<DropdownVarId, PopConfig>> = {
    phrma_cardiovascular: ['Total Medicare', 'phrma_population'],
    phrma_hiv: ['Total Medicare', 'phrma_population'],
  }

  let popConfig: PopConfig | undefined
  if (dropdownVarId && popLookup[dropdownVarId])
    popConfig = popLookup[dropdownVarId]
  if (!popConfig) popConfig = ['Total', 'population']

  const [popLabel, popColumn]: PopConfig = popConfig

  const totalPopulation: string =
    populationQueryResponse.data?.[0]?.[popColumn]?.toLocaleString() ??
    'unknown'

  return `${popLabel} Population: ${totalPopulation}`
}
