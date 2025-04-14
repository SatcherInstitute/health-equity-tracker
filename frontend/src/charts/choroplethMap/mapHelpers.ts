import * as d3 from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature } from 'topojson-client'
import { GEOGRAPHIES_DATASET_ID } from '../../data/config/MetadataMap'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { Fips } from '../../data/utils/Fips'
import {
  ATLANTA_METRO_COUNTY_FIPS,
  type CountColsMap,
  DATA_SUPPRESSED,
  NO_DATA_MESSAGE,
} from '../mapGlobals'
import {
  getCawpMapGroupDenominatorLabel,
  getCawpMapGroupNumeratorLabel,
  getMapGroupLabel,
} from '../mapHelperFunctions'
import type { MetricData } from './types'

export const createFeatures = async (
  showCounties: boolean,
  parentFips: string,
  geoData?: Record<string, any>,
  isAtlantaMode?: boolean,
): Promise<FeatureCollection> => {
  const topology =
    geoData ??
    JSON.parse(
      new TextDecoder().decode(
        await window.fs.readFile(`/tmp/${GEOGRAPHIES_DATASET_ID}.json`),
      ),
    )

  const geographyKey = showCounties ? 'counties' : 'states'

  const features = feature(
    topology,
    topology.objects[geographyKey],
  ) as unknown as FeatureCollection

  if (parentFips === '00') return features


  if (isAtlantaMode)
    return {
      ...features,
      features: features.features.filter((f) =>
        ATLANTA_METRO_COUNTY_FIPS.includes(String(f.id)),
      ),
    }

  return {
    ...features,
    features: features.features.filter((f) =>
      String(f.id)?.startsWith(parentFips),
    ),
  }
}

export const createProjection = (
  fips: Fips,
  width: number,
  height: number,
  features: FeatureCollection,
): d3.GeoProjection => {
  const isTerritory = fips.isTerritory() || fips.getParentFips().isTerritory()
  return isTerritory
    ? d3.geoAlbers().fitSize([width, height], features)
    : d3.geoAlbersUsa().fitSize([width, height], features)
}

export const processPhrmaData = (
  data: Array<Record<string, any>>,
  countColsMap: CountColsMap,
) => {
  return data.map((row) => {
    const newRow = { ...row }

    const processField = (
      fieldConfig:
        | typeof countColsMap.numeratorConfig
        | typeof countColsMap.denominatorConfig,
    ) => {
      if (!fieldConfig) return

      const value = row[fieldConfig.metricId]
      if (value === null) return DATA_SUPPRESSED
      if (value >= 0) return value.toLocaleString()
      return value
    }

    const numeratorId = countColsMap?.numeratorConfig?.metricId
    const denominatorId = countColsMap?.denominatorConfig?.metricId

    if (numeratorId) {
      newRow[numeratorId] = processField(countColsMap?.numeratorConfig)
    }
    if (denominatorId) {
      newRow[denominatorId] = processField(countColsMap?.denominatorConfig)
    }

    return newRow
  })
}

export const getNumeratorPhrase = (
  isCawp: boolean,
  countColsMap: any,
  demographicType: DemographicType,
  activeDemographicGroup: string,
): string => {
  if (isCawp) {
    return getCawpMapGroupNumeratorLabel(countColsMap, activeDemographicGroup)
  }

  return getMapGroupLabel(
    demographicType,
    activeDemographicGroup,
    countColsMap?.numeratorConfig?.shortLabel ?? '',
  )
}

export const getDenominatorPhrase = (
  isCawp: boolean,
  countColsMap: any,
  demographicType: DemographicType,
  activeDemographicGroup: string,
): string => {
  if (isCawp) {
    return getCawpMapGroupDenominatorLabel(countColsMap)
  }

  return getMapGroupLabel(
    demographicType,
    activeDemographicGroup,
    countColsMap?.denominatorConfig?.shortLabel ?? '',
  )
}

export const createDataMap = (
  dataWithHighestLowest: any[],
  tooltipLabel: string,
  metric: MetricConfig,
  numeratorPhrase: string,
  denominatorPhrase: string,
  countColsMap: any,
): Map<string, MetricData> => {
  return new Map(
    dataWithHighestLowest.map((d) => [
      d.fips,
      {
        [tooltipLabel]: d[metric.metricId],
        value: d[metric.metricId],
        ...(countColsMap?.numeratorConfig && {
          [`# ${numeratorPhrase}`]:
            d?.[countColsMap.numeratorConfig.metricId] ?? NO_DATA_MESSAGE,
        }),
        ...(countColsMap?.denominatorConfig && {
          [`# ${denominatorPhrase}`]:
            d[countColsMap.denominatorConfig.metricId],
        }),
        ...(d.highestGroup && { ['Highest rate group']: d.highestGroup }),
        ...(d.lowestGroup && { ['Lowest rate group']: d.lowestGroup }),
        ...(d.rating && { ['County SVI']: d.rating }),
      },
    ]),
  )
}
