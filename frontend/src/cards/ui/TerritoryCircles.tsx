import { Grid } from '@mui/material'
import { ChoroplethMap } from '../../charts/ChoroplethMap'
import { RATE_MAP_SCALE } from '../../charts/mapHelpers'
import {
  type MetricId,
  type MetricConfig,
} from '../../data/config/MetricConfig'
import { Fips, TERRITORY_CODES } from '../../data/utils/Fips'
import styles from './TerritoryCircles.module.scss'

interface TerritoryCirclesProps {
  data: Array<Record<string, any>>
  signalListeners: any
  metricConfig: MetricConfig
  listExpanded: boolean
  legendData?: Array<Record<string, any>>
  geoData?: Record<string, any>
  countColsToAdd: MetricId[]
  layout: 'horizontal' | 'vertical'
}

export default function TerritoryCircles(props: TerritoryCirclesProps) {
  return (
    <Grid
      container
      spacing={2}
      flexWrap={'nowrap'}
      flexDirection={props.layout === 'vertical' ? 'column' : 'row'}
      className={styles.TerritoryCirclesContainer}
    >
      {TERRITORY_CODES.map((code) => {
        const fips = new Fips(code)
        return (
          <Grid item key={code}>
            <ChoroplethMap
              signalListeners={props.signalListeners}
              metric={props.metricConfig}
              data={props.data}
              hideMissingDataTooltip={props.listExpanded}
              legendData={props.legendData}
              hideLegend={true}
              hideActions={true}
              showCounties={false}
              fips={fips}
              scaleType={RATE_MAP_SCALE}
              geoData={props.geoData}
              overrideShapeWithCircle={true}
              countColsToAdd={props.countColsToAdd}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}
