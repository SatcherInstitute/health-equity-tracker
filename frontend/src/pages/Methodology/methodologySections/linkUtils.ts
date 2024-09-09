import type { DropdownVarId } from '../../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { DROPDOWN_TOPIC_MAP } from '../../../utils/MadLibs'

export function buildTopicsString(topics: readonly DropdownVarId[]): string {
  const mutableTopics = [...topics]
  return mutableTopics
    .map((dropdownId) => {
      let topicString = DROPDOWN_TOPIC_MAP[dropdownId]
      if (METRIC_CONFIG[dropdownId].length > 1) {
        const topicDataTypesString = METRIC_CONFIG[dropdownId]
          .map((config) => config.dataTypeShortLabel)
          .join(', ')
        topicString += ` (${topicDataTypesString})`
      }
      return topicString
    })
    .join(', ')
}
