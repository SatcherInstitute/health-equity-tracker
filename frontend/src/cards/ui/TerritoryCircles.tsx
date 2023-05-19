import { Grid } from '@mui/material'
import { ChoroplethMap } from '../../charts/ChoroplethMap'
import {
  type MetricId,
  type MetricConfig,
} from '../../data/config/MetricConfig'
import { Fips, TERRITORY_CODES } from '../../data/utils/Fips'
import styles from './TerritoryCircles.module.scss'
import { getMapScheme } from '../../charts/mapHelpers'

interface TerritoryCirclesProps {
  data: Array<Record<string, any>>
  signalListeners: any
  metricConfig: MetricConfig
  listExpanded?: boolean
  legendData?: Array<Record<string, any>>
  geoData?: Record<string, any>
  countColsToAdd: MetricId[]
  mapIsWide: boolean
  isUnknownsMap?: boolean
}

export default function TerritoryCircles(props: TerritoryCirclesProps) {
  const [mapScheme, mapMin] = getMapScheme({
    metricId: props.metricConfig.metricId,
    isUnknownsMap: props.isUnknownsMap,
  })

  return (
    <Grid container flexDirection={'row'} justifyContent={'flex-end'}>
      {Object.entries(TERRITORY_CODES).map(([fipsCode, postalCode]) => {
        const fips = new Fips(fipsCode)
        return (
          <Grid item key={fipsCode} sx={{ width: 40 }} component={'figure'}>
            <ChoroplethMap
              signalListeners={props.signalListeners}
              metric={props.metricConfig}
              data={props.data}
              hideMissingDataTooltip={props.listExpanded}
              legendData={props.legendData}
              hideLegend={true}
              showCounties={false}
              fips={fips}
              isUnknownsMap={props.isUnknownsMap}
              geoData={props.geoData}
              overrideShapeWithCircle={true}
              countColsToAdd={props.countColsToAdd}
              mapConfig={{ mapScheme, mapMin }}
            />
            <figcaption className={styles.TerritoryLabel}>
              {postalCode}
            </figcaption>
          </Grid>
        )
      })}
    </Grid>
  )
}
