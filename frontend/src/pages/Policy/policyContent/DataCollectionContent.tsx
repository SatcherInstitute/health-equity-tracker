import { datasourceMetadataCommunitySafetyCategory } from '../../../data/config/DatasetMetadataCommunitySafetyCategory'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import type {
  DataTypeConfig,
  DataTypeId,
} from '../../../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../../data/query/Breakdowns'
import { Fips } from '../../../data/utils/Fips'
import { getAllDemographicOptions } from '../../../reports/reportUtils'
import { getConfigFromDataTypeId } from '../../../utils/MadLibs'

interface DatasetItem {
  label: string
  included: boolean
}

interface Dataset {
  datasetName: string
  datasetNameDetails?: string
  items: DatasetItem[]
}

const unionGunDeathsDemographicOptions =
  datasourceMetadataCommunitySafetyCategory.demographic_breakdowns

const usFips = new Fips('00')

function getItems(id: DataTypeId): DatasetItem[] {
  const config = getConfigFromDataTypeId(id)
  const configDemographicOptions = Object.values(
    getAllDemographicOptions(config, usFips).enabledDemographicOptionsMap,
  )

  const items: DatasetItem[] = unionGunDeathsDemographicOptions.map(
    (demo: DemographicType) => {
      return {
        label: `Breakdowns by ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demo]}`,
        included: configDemographicOptions.includes(demo),
      }
    },
  )

  return items
}

const gvDropdownIds = [
  'gun_deaths',
  'gun_violence',
  'gun_violence_youth',
  'gun_deaths_black_men',
]

export const gunViolenceDatasets: Dataset[] = gvDropdownIds.flatMap((id) => {
  const gvDatasets: Dataset[] = []

  const metricConfigs: DataTypeConfig[] = METRIC_CONFIG[id]

  gvDatasets.push(
    ...metricConfigs.map((config) => {
      const details =
        config.otherSubPopulationLabel && config.ageSubPopulationLabel
          ? `${config.otherSubPopulationLabel}, ${config.ageSubPopulationLabel}`
          : config.otherSubPopulationLabel || config.ageSubPopulationLabel || ''

      return {
        datasetName: config.fullDisplayName,
        datasetNameDetails: details,
        items: getItems(config.dataTypeId),
      }
    }),
  )

  return gvDatasets
})

export const gvDefinitions = gvDropdownIds.flatMap((id) => {
  const gvDefinitions: any[] = []

  const metricConfigs: DataTypeConfig[] = METRIC_CONFIG[id]

  gvDefinitions.push(
    ...metricConfigs.map((config) => {
      return {
        topic: config.fullDisplayName,
        measurementDefinition: config.definition?.text || '',
      }
    }),
  )
  return gvDefinitions
})
