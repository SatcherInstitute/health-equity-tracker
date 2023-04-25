import { Grid } from '@mui/material'
import { ChoroplethMap } from '../../charts/ChoroplethMap'
import { RATE_MAP_SCALE } from '../../charts/mapHelpers'
import {
  type MetricId,
  type MetricConfig,
} from '../../data/config/MetricConfig'
import { Fips, TERRITORY_CODES } from '../../data/utils/Fips'

interface TerritoryCirclesProps {
  data: Array<Record<string, any>>
  signalListeners: any
  metricConfig: MetricConfig
  listExpanded: boolean
  legendData?: Array<Record<string, any>>
  geoData?: Record<string, any>
  countColsToAdd: MetricId[]
  layout: 'horizontal' | 'vertical'
  mapIsWide: boolean
}

export default function TerritoryCircles(props: TerritoryCirclesProps) {
  return (
    <Grid
      container
      spacing={props.mapIsWide ? 2 : 0}
      flexWrap={'nowrap'}
      flexDirection={props.layout === 'vertical' ? 'column' : 'row'}
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
