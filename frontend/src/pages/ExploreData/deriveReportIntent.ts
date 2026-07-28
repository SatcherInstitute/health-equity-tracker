import { isDropdownVarId } from '../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import { USA_FIPS } from '../../data/utils/ConstantsGeography'
import { COUNTY_FIPS_MAP, STATE_FIPS_MAP } from '../../data/utils/FipsData'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { MADLIB_SELECTIONS_PARAM, parseMls } from '../../utils/urlutils'

export interface ReportIntent {
  topicLabel: string
  placeLabel?: string
  href: string
}

// mls encodes the madlib phrase as index.value pairs. Index 1 is always the
// topic; index 3 is a FIPS code in disparity/comparegeos mode and a second
// topic in comparevars mode, where the FIPS lands at index 5 instead.
const TOPIC_INDEX = 1
const PLACE_INDICES = [3, 5]

function getPlaceLabel(code: string | undefined): string | undefined {
  if (!code) return undefined
  return code.length === 5 ? COUNTY_FIPS_MAP[code] : STATE_FIPS_MAP[code]
}

// Runs after a render error, possibly one thrown by param parsing itself, so
// it must never throw: an error raised inside a boundary's fallback escapes
// that boundary and blanks the page.
export function deriveReportIntent(search: string): ReportIntent | null {
  try {
    const mls = new URLSearchParams(search).get(MADLIB_SELECTIONS_PARAM)
    if (!mls) return null

    const selections = parseMls(mls)

    const topicId = selections[TOPIC_INDEX]
    if (!topicId || !isDropdownVarId(topicId)) return null
    const topicLabel = METRIC_CONFIG[topicId]?.[0]?.fullDisplayName
    if (!topicLabel) return null

    const placeCode = PLACE_INDICES.map((i) => selections[i]).find((code) =>
      getPlaceLabel(code),
    )
    const placeLabel = getPlaceLabel(placeCode)

    // deliberately rebuilt from the topic and place alone: demo, group, and dt
    // params are the likelier culprits if the URL really was malformed. mls
    // replaces defaultSelections wholesale, so the place has to be written even
    // when we could not recover one.
    const params = new URLSearchParams({
      [MADLIB_SELECTIONS_PARAM]: `${TOPIC_INDEX}.${topicId}-3.${placeCode ?? USA_FIPS}`,
    })

    return {
      topicLabel,
      placeLabel,
      href: `${EXPLORE_DATA_PAGE_LINK}?${params.toString()}`,
    }
  } catch {
    return null
  }
}
