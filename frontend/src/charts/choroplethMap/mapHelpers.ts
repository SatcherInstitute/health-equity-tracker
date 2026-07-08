import { format, type GeoProjection, geoAlbers, geoAlbersUsa } from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature, merge } from 'topojson-client'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import type { DemographicType } from '../../data/query/Breakdowns'
import { Fips } from '../../data/utils/Fips'
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

// The geographies topology is split per view (see scripts/geo/split-geographies.ts):
// national maps receive the states/territories topology, state and county
// level maps receive that single state's counties topology.
export const createFeatures = async (
  showCounties: boolean,
  parentFips: string,
  geoData?: Record<string, any>,
  isAtlantaMode?: boolean,
): Promise<FeatureCollection> => {
  const topology = geoData
  if (!topology) {
    throw new Error('Geographies topology was not provided to createFeatures')
  }

  if (!showCounties && parentFips !== '00') {
    // Parent outline (e.g. a state with only state-level data): merged from
    // its counties' shared arcs, which reconstructs the exact same geometry
    // the old whole-US states object contained.
    const geometries = topology.objects.counties.geometries.filter(
      (g: { id: string | number }) => String(g.id).startsWith(parentFips),
    )
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: parentFips,
          properties: { name: new Fips(parentFips).getDisplayName() },
          geometry: merge(topology as any, geometries),
        },
      ],
    }
  }

  const features = feature(
    topology as any,
    topology.objects[showCounties ? 'counties' : 'states'],
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
): GeoProjection => {
  const isTerritory = fips.isTerritory() || fips.getParentFips().isTerritory()
  return isTerritory
    ? geoAlbers().fitSize([width, height], features)
    : geoAlbersUsa().fitSize([width, height], features)
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
        [tooltipLabel]:
          d[metric.metricId] != null
            ? formatMetricValue(d[metric.metricId], metric)
            : undefined,
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

export const formatMetricValue = (
  value: number | undefined,
  metricConfig: MetricConfig,
  isLegendLabel?: boolean,
): string => {
  if (value === undefined || value === null) return 'no data'

  if (metricConfig.type === 'per100k') {
    const suffix = isLegendLabel ? '' : '  per 100k'

    if (value < 1) {
      return `${format('.1f')(value)}${suffix}`
    }

    return `${format(',.2s')(value)}${suffix}`
  }

  if (isPctType(metricConfig.type)) {
    return `${format('.1~f')(value)}%`
  }

  return format(',.2r')(value)
}

export const getTooltipLabel = (
  isUnknownsMap: boolean | undefined,
  metric: MetricConfig,
  activeDemographicGroup: string,
  demographicType: DemographicType,
): string => {
  if (isUnknownsMap) {
    return metric.unknownsLabel || '% unknown'
  }

  if (CAWP_METRICS.includes(metric.metricId)) {
    return `Rate — ${getWomenRaceLabel(activeDemographicGroup)}`
  }

  return getMapGroupLabel(
    demographicType,
    activeDemographicGroup,
    metric.type === 'index' ? 'Score' : 'Rate',
  )
}
