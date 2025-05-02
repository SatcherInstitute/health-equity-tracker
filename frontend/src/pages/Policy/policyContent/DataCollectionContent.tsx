import { COMMUNITY_SAFETY_DROPDOWNIDS_NO_CHR } from '../../../data/config/MetricConfigCommunitySafety'
import { getMetricConfigsForIds } from '../../../data/config/MetricConfigUtils'

const metricConfigsWithIds = getMetricConfigsForIds([
  ...COMMUNITY_SAFETY_DROPDOWNIDS_NO_CHR,
])

export const gvDefinitions = metricConfigsWithIds.flatMap(({ configs }) => {
  return configs.map((config) => ({
    topic: config.fullDisplayName,
    measurementDefinition: config.definition?.text || '',
  }))
})
