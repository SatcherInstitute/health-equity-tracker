import { Grid } from '@mui/material'
<<<<<<< HEAD
<<<<<<< HEAD
import ChoroplethMap from '../../charts/ChoroplethMap'
=======
import { ChoroplethMap } from '../../charts/ChoroplethMap'
>>>>>>> d419ca54 (Frontend: RF map color handling (#2391))
=======
import ChoroplethMap from '../../charts/ChoroplethMap'
>>>>>>> e7a9c150 (Switch some cards to `default` import/export for future code splitting (#2420))
import {
  type DataTypeConfig,
  type MetricConfig,
} from '../../data/config/MetricConfig'
import { Fips, TERRITORY_CODES } from '../../data/utils/Fips'
import styles from './TerritoryCircles.module.scss'
import { getMapScheme } from '../../charts/mapHelperFunctions'
import { type DemographicGroup } from '../../data/utils/Constants'
import { type Row } from '../../data/utils/DatasetTypes'
import { type DemographicType } from '../../data/query/Breakdowns'
<<<<<<< HEAD
<<<<<<< HEAD
import { type HighestLowest, type CountColsMap } from '../../charts/mapGlobals'
=======
import { type CountColsMap } from '../../charts/mapGlobals'
>>>>>>> e7a9c150 (Switch some cards to `default` import/export for future code splitting (#2420))
=======
import { type HighestLowest, type CountColsMap } from '../../charts/mapGlobals'
>>>>>>> c4bbb991 (Memoize `getHighestLowestGroupsByFips()`; remove unneeded alt text items from Maps (#2421))

interface TerritoryCirclesProps {
  data: Array<Record<string, any>>
  signalListeners: any
  metricConfig: MetricConfig
  dataTypeConfig: DataTypeConfig
  highestLowestGeosMode: boolean
  highestLowestGroupsByFips?: Record<string, HighestLowest>
  legendData?: Array<Record<string, any>>
  geoData?: Record<string, any>
  countColsMap: CountColsMap
  mapIsWide: boolean
  isUnknownsMap?: boolean
  demographicType: DemographicType
  activeDemographicGroup: DemographicGroup
  fullData?: Row[]
  scaleConfig?: { domain: number[]; range: number[] }
  isMulti?: boolean
  isPhrmaAdherence?: boolean
}

export default function TerritoryCircles(props: TerritoryCirclesProps) {
  const [mapScheme, mapMin] = getMapScheme(
    /* dataTypeConfig */ props.dataTypeConfig,
    /* isSummaryLegend */ undefined,
    /*  isUnknownsMap */ props.isUnknownsMap
<<<<<<< HEAD
=======
  )

<<<<<<< HEAD
  const highestLowestGroupsByFips = getHighestLowestGroupsByFips(
    props.fullData,
    props.demographicType,
    props.metricConfig.metricId
>>>>>>> d419ca54 (Frontend: RF map color handling (#2391))
  )

=======
>>>>>>> c4bbb991 (Memoize `getHighestLowestGroupsByFips()`; remove unneeded alt text items from Maps (#2421))
  return (
    <Grid
      container
      flexDirection={'row'}
      justifyContent={'flex-end'}
<<<<<<< HEAD
<<<<<<< HEAD
      aria-hidden={true}
=======
>>>>>>> d419ca54 (Frontend: RF map color handling (#2391))
=======
      aria-hidden={true}
>>>>>>> c4bbb991 (Memoize `getHighestLowestGroupsByFips()`; remove unneeded alt text items from Maps (#2421))
      style={{ padding: props.isMulti ? '0px 5px 10px' : '' }}
    >
      {Object.entries(TERRITORY_CODES).map(([fipsCode, postalCode]) => {
        const fips = new Fips(fipsCode)
        return (
          <Grid item key={fipsCode} sx={{ width: 40 }} component={'figure'}>
            <ChoroplethMap
              demographicType={props.demographicType}
              highestLowestGroupsByFips={props.highestLowestGroupsByFips}
              activeDemographicGroup={props.activeDemographicGroup}
              signalListeners={props.signalListeners}
              metric={props.metricConfig}
              data={props.data}
              hideMissingDataTooltip={props.highestLowestGeosMode}
              legendData={props.legendData}
              hideLegend={true}
              showCounties={false}
              fips={fips}
              isUnknownsMap={props.isUnknownsMap}
              geoData={props.geoData}
              overrideShapeWithCircle={true}
              countColsMap={props.countColsMap}
              mapConfig={{ mapScheme, mapMin }}
              scaleConfig={props.scaleConfig}
              isMulti={props.isMulti}
              highestLowestGeosMode={props.highestLowestGeosMode}
              isPhrmaAdherence={props.isPhrmaAdherence}
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
