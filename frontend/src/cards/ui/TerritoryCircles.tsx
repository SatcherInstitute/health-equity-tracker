import { Grid } from '@mui/material'
import { ChoroplethMap } from '../../charts/ChoroplethMap'
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
    >
      {Object.entries(TERRITORY_CODES).map(([fipsCode, postalCode]) => {
        const fips = new Fips(fipsCode)
        return (
          <Grid
            item
            key={fipsCode}
            xs={4}
            md={4}
            lg={props.mapIsWide ? 2 : 4}
            component={'figure'}
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
            <figcaption className={styles.TerritoryLabel}>
              {postalCode}
            </figcaption>
          </Grid>
        )
      })}
    </Grid>
  )
}
