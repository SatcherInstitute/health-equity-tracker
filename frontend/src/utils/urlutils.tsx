import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import {
  type DemographicGroup,
  raceNameToCodeMap,
} from '../data/utils/Constants'
import type { PhraseSelections } from './MadLibs'

// LLM INSIGHTS FEATURE
export const REPORT_INSIGHT_PARAM_KEY = 'report-insight'

// OG PARAMS
const STICKY_VERSION_PARAM = 'sv'
export const DATA_SOURCE_PRE_FILTERS = 'dpf'
// Value is index of the phrase to jump to
export const MADLIB_PHRASE_PARAM = 'mlp'

// Value is a comma-separated list mapping indices to values with : delimiter
// Values are applied on top of defaults so you only need to specify those that differ
// mls=0:1,2:5
export const MADLIB_SELECTIONS_PARAM = 'mls'
export const DATA_TYPE_1_PARAM = 'dt1'
export const DATA_TYPE_2_PARAM = 'dt2'
export const MAP1_GROUP_PARAM = 'group1'
export const MAP2_GROUP_PARAM = 'group2'

// Trend cards let the user narrow the legend to a subset of groups. The two
// card types keep independent params because their available group sets
// genuinely differ: share trends excludes ALL, rate trends excludes AIAN_API
// and drops "Unknown race", and topics differ in demographic shape (CAWP women,
// NH races, entirely different age buckets). Compare columns are split for the
// same reason — compare-vars can put a CAWP topic beside a standard one, and a
// shared param would carry groups the other card cannot render.
export const RATE_GROUPS_1_PARAM = 'rateGroups1'
export const RATE_GROUPS_2_PARAM = 'rateGroups2'
export const SHARE_GROUPS_1_PARAM = 'shareGroups1'
export const SHARE_GROUPS_2_PARAM = 'shareGroups2'

// Separator for multi-group params. `,` becomes `%2C` through URLSearchParams,
// `-` collides with age buckets like `18-44`, `~` becomes `%7E`, and `.`/`_`
// are already consumed by getGroupParamFromDemographicGroup. `*` stays literal.
// Assumes no demographic label contains a literal `*`; one would split into two
// bogus groups on decode.
const GROUP_LIST_SEPARATOR = '*'

// 'true' or 'false' will override the cookie to show or hide the onboarding flow
export const SHOW_ONBOARDING_PARAM = 'onboard'

// PARAMS HANDLED WITH USEPARAMSTATE() USING JOTAI
// TODO: eventually all params should likely be moved to useParamState

export const DEMOGRAPHIC_PARAM = 'demo'
export const TOPIC_INFO_PARAM_KEY = 'topic-info'
export const VOTE_DOT_ORG_PARAM_KEY = 'vote-dot-org'
export const MULTIPLE_MAPS_1_PARAM_KEY = 'multiple-maps'
export const MULTIPLE_MAPS_2_PARAM_KEY = 'multiple-maps2'
export const EXTREMES_1_PARAM_KEY = 'extremes'
export const EXTREMES_2_PARAM_KEY = 'extremes2'
export const ALT_TABLE_VIEW_1_PARAM_KEY = 'alt-table-view1'
export const ALT_TABLE_VIEW_2_PARAM_KEY = 'alt-table-view2'
export const ATLANTA_MODE_PARAM_KEY = 'atl'
export const CHLP_MAPS_PARAM_KEY = 'chlp-maps'

export function LinkWithStickyParams(props: {
  to: string
  target?: string
  className?: string
  children: ReactNode
}) {
  const linkProps = { ...props }
  const params = useSearchParams()
  let newUrl = props.to
  if (params[STICKY_VERSION_PARAM]) {
    // Note: doesn't handle urls that already have params on them.
    newUrl = newUrl + `?${STICKY_VERSION_PARAM}=${params[STICKY_VERSION_PARAM]}`
  }
  linkProps.to = newUrl

  return <Link {...linkProps}>{props.children}</Link>
}

type NavigationPage = string | { label: string }

export type NavigationItem =
  | {
      label: string
      pages: Record<string, NavigationPage>
    }
  | {
      label: string
      link: string
    }

export function isExternalLink(href: string): boolean {
  return (
    href.startsWith('https://') ||
    href.startsWith('http://') ||
    href.startsWith('mailto:')
  )
}

export function useSearchParams() {
  const params = new URLSearchParams(useLocation().search)
  return Object.fromEntries(params.entries())
}

export function getParameter<T1>(
  paramName: string,
  defaultValue: T1,
  formatter: (x: any) => T1 = (input: string | null) => input as unknown as T1,
): T1 {
  const searchParams = new URLSearchParams(window.location.search)
  try {
    return searchParams.has(paramName)
      ? formatter(searchParams.get(paramName))
      : defaultValue
  } catch (err) {
    console.error(err)
    return defaultValue
  }
}

const kvSeparator = '.'
const partsSeparator = '-'

export const parseMls = (param: string) => {
  const parts = param.split(partsSeparator)
  const selection: PhraseSelections = {}
  parts.forEach((part) => {
    const p = part.split(kvSeparator)
    selection[Number(p[0])] = p[1]
  })

  return selection
}

export const stringifyMls = (selection: PhraseSelections): string => {
  const kvPair: string[] = []

  Object.keys(selection).forEach((key: any) => {
    kvPair.push(key + kvSeparator + selection[key])
  })

  return kvPair.join(partsSeparator)
}

/* for converting selected group long name into URL safe param value */
export function getGroupParamFromDemographicGroup(
  groupLongName: DemographicGroup,
): string {
  const groupCode = raceNameToCodeMap[groupLongName] ?? groupLongName

  return groupCode
    .replaceAll(' (NH)', '.NH')
    .replaceAll(' ', '_')
    .replaceAll('/', '~')
    .replaceAll('+', 'PLUS')
}

// Encode a list of selected groups for a URL param. Order is preserved
// deliberately: FilterLegend.tsx compares the current selection against
// getMinMaxGroups(data) with an order-sensitive JSON.stringify, so a sort
// here would silently break the "highest / lowest averages" preset.
export function getGroupsParamFromDemographicGroups(
  groups: DemographicGroup[],
): string {
  return groups
    .map(getGroupParamFromDemographicGroup)
    .join(GROUP_LIST_SEPARATOR)
}

// Decode a URL param produced by getGroupsParamFromDemographicGroups. An
// empty or missing param means "no filter" — the trend chart's normalization
// at charts/trendsChart/Index.tsx already treats [] as "show every group",
// so no sentinel is needed for the default state.
export function getDemographicGroupsFromGroupsParam(
  groupsParam: string,
): DemographicGroup[] {
  if (!groupsParam) return []
  return groupsParam
    .split(GROUP_LIST_SEPARATOR)
    .filter(Boolean)
    .map(getDemographicGroupFromGroupParam)
}

/* for extracting selected group long name from URL safe param value */
export function getDemographicGroupFromGroupParam(
  groupParam: string,
): DemographicGroup {
  const groupCodeFromParam = groupParam
    ?.replaceAll('.NH', ' (NH)')
    ?.replaceAll('_', ' ')
    ?.replaceAll('~', '/')
    ?.replaceAll('PLUS', '+')

  // if group code is in race map, reverse lookup to get full group name
  // otherwise the age and sex groups are the full names
  const groupName =
    Object.entries(raceNameToCodeMap).find(
      (entry) => entry[1] === groupCodeFromParam,
    )?.[0] ?? groupCodeFromParam

  return groupName
}

export function slugify(s: string): string {
  // Convert to lowercase and replace spaces with dashes
  s = s.toLowerCase().replace(/ /g, '-')

  // Remove special characters using regex
  s = s.replace(/[^a-z0-9-]/g, '')

  return s
}
