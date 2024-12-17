import { BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS } from './MetricConfigBehavioralHealth'
import { CDC_CANCER_CATEGORY_DROPDOWNIDS } from './MetricConfigCancer'
import { CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS } from './MetricConfigChronicDisease'
import { COMMUNITY_SAFETY_DROPDOWNIDS } from './MetricConfigCommunitySafety'
import { COVID_CATEGORY_DROPDOWNIDS } from './MetricConfigCovidCategory'
import { HIV_CATEGORY_DROPDOWNIDS } from './MetricConfigHivCategory'
import { MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS } from './MetricConfigMaternalHealth'
import { PDOH_CATEGORY_DROPDOWNIDS } from './MetricConfigPDOH'
import { MEDICARE_CATEGORY_DROPDOWNIDS } from './MetricConfigPhrma'
import { CANCER_CATEGORY_DROPDOWNIDS } from './MetricConfigPhrmaBrfss'
import { SDOH_CATEGORY_DROPDOWNIDS } from './MetricConfigSDOH'

export const DROPDOWN_IDS = [
  ...CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS,
  ...PDOH_CATEGORY_DROPDOWNIDS,
  ...SDOH_CATEGORY_DROPDOWNIDS,
  ...BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
  ...HIV_CATEGORY_DROPDOWNIDS,
  ...COVID_CATEGORY_DROPDOWNIDS,
  ...MEDICARE_CATEGORY_DROPDOWNIDS,
  ...COMMUNITY_SAFETY_DROPDOWNIDS,
  ...MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS,
  ...CANCER_CATEGORY_DROPDOWNIDS,
  ...CDC_CANCER_CATEGORY_DROPDOWNIDS,
] as const

export type DropdownVarId = (typeof DROPDOWN_IDS)[number]

export function isDropdownVarId(
  possibleDropdownIdString: string,
): possibleDropdownIdString is DropdownVarId {
  return !!DROPDOWN_IDS.find(
    (dropdownId) => possibleDropdownIdString === dropdownId,
  )
}
