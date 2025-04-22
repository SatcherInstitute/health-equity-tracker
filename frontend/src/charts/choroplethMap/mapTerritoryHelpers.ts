import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { STATE_FIPS_MAP } from '../../data/utils/FipsData'
import type { DataPoint, HetRow } from './types'

export const TERRITORIES = {
  radius: 15,
  radiusMobile: 12,
  radiusMultiMap: 8,
  marginTop: 50,
  marginRightForRow: 50,
  verticalGapFromUsa: 50,
}

export const createTerritoryFeature = (
  fipsCode: string,
): Feature<Geometry, GeoJsonProperties> => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [0, 0],
  },
  properties: {
    name: STATE_FIPS_MAP[fipsCode],
  },
  id: fipsCode,
})

export function extractTerritoryData(fipsCode: string, data: HetRow[]) {
  return Object.entries(TERRITORY_CODES).map(([fips, fips_name]) => {
    const territoryRow: DataPoint | undefined = data.find(
      (d) => d.fips === fips,
    )
    const missingTerritoryRow = {} as DataPoint
    missingTerritoryRow.fips = fips
    missingTerritoryRow.fips_name = fips_name
    return territoryRow || missingTerritoryRow
  })
}
