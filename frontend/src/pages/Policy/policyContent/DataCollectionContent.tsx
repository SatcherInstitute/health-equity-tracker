import { datasourceMetadataCommunitySafetyCategory } from '../../../data/config/DatasetMetadataCommunitySafetyCategory'
import type { DropdownVarId } from '../../../data/config/DropDownIds'
import type { DataTypeId } from '../../../data/config/MetricConfigTypes'
import {
  formatSubPopString,
  getMetricConfigsForIds,
} from '../../../data/config/MetricConfigUtils'
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

const gvDropdownIds: DropdownVarId[] = [
  'gun_deaths',
  'gun_violence',
  'gun_violence_youth',
  'gun_deaths_black_men',
]

const metricConfigsWithIds = getMetricConfigsForIds(gvDropdownIds)

export const gunViolenceDatasets: Dataset[] = metricConfigsWithIds.flatMap(
  ({ configs }) => {
    return configs.map((config) => ({
      datasetName: config.fullDisplayName,
      datasetNameDetails: formatSubPopString(config),
      items: getItems(config.dataTypeId),
    }))
  },
)

export const gvDefinitions = metricConfigsWithIds.flatMap(({ configs }) => {
  return configs.map((config) => ({
    topic: config.fullDisplayName,
    measurementDefinition: config.definition?.text || '',
  }))
})

// TODO: Most (all?) of this file should be removed in favor of <HetTopicDemographics />.
// TODO: Need to move/refactor the definitions block as well.
