import { Grid } from '@mui/material'
import { ChoroplethMap } from '../../charts/ChoroplethMap'
import {
  type MetricId,
  type MetricConfig,
} from '../../data/config/MetricConfig'
import { Fips, TERRITORY_CODES } from '../../data/utils/Fips'

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
  return (
    <Grid
      container
      flexWrap={props.mapIsWide ? 'nowrap' : undefined}
      flexDirection={'row'}
      justifyContent={props.isUnknownsMap ? 'flex-end' : undefined}
      // justifyContent={'flex-end'}
    >
      {TERRITORY_CODES.map((code) => {
        const fips = new Fips(code)
        return (
          <Grid
            item
            key={code}
            xs={4}
            md={props.mapIsWide ? 2 : 4}
            lg={props.mapIsWide ? 1 : 2}
          >
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
            />
          </Grid>
        )
      })}
    </Grid>
  )
}
