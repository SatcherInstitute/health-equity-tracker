import ChoroplethMap from '../../charts/ChoroplethMap'
import type {
  DataTypeConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import { Fips } from '../../data/utils/Fips'

import type { DemographicGroup } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import {
  type HighestLowest,
  type CountColsMap,
  unknownMapConfig,
} from '../../charts/mapGlobals'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'

interface TerritoryCirclesProps {
  data: Array<Record<string, any>>
  signalListeners: any
  metricConfig: MetricConfig
  dataTypeConfig: DataTypeConfig
  extremesMode: boolean
  highestLowestGroupsByFips?: Record<string, HighestLowest>
  legendData?: Array<Record<string, any>>
  geoData?: Record<string, any>
  countColsMap: CountColsMap
  mapIsWide: boolean
  isUnknownsMap?: boolean
  demographicType: DemographicType
  activeDemographicGroup: DemographicGroup
  fullData?: HetRow[]
  scaleConfig?: { domain: number[]; range: number[] }
  isMulti?: boolean
  isPhrmaAdherence?: boolean
}

export default function TerritoryCircles(props: TerritoryCirclesProps) {
  const mapConfig = props.isUnknownsMap
    ? unknownMapConfig
    : props.dataTypeConfig.mapConfig

  return (
    <div className='flex justify-end p-0' aria-hidden={true}>
      {Object.entries(TERRITORY_CODES).map(([fipsCode, postalCode]) => {
        const fips = new Fips(fipsCode)
        return (
          <figure className='m-0 p-0.5 sm:m-1' key={fipsCode}>
            <ChoroplethMap
              demographicType={props.demographicType}
              highestLowestGroupsByFips={props.highestLowestGroupsByFips}
              activeDemographicGroup={props.activeDemographicGroup}
              signalListeners={props.signalListeners}
              metric={props.metricConfig}
              data={props.data}
              hideMissingDataTooltip={props.extremesMode}
              legendData={props.legendData}
              hideLegend={true}
              showCounties={false}
              fips={fips}
              isUnknownsMap={props.isUnknownsMap}
              geoData={props.geoData}
              overrideShapeWithCircle={true}
              countColsMap={props.countColsMap}
              mapConfig={mapConfig}
              scaleConfig={props.scaleConfig}
              isMulti={props.isMulti}
              extremesMode={props.extremesMode}
              isPhrmaAdherence={props.isPhrmaAdherence}
            />
            <figcaption className='-mt-1 mb-1 text-center text-smallest leading-lhTight tracking-tighter'>
              {postalCode}
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}
