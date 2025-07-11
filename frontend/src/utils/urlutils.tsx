import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import type { DataTypeId } from '../data/config/MetricConfigTypes'
import {
  type DemographicGroup,
  raceNameToCodeMap,
} from '../data/utils/Constants'
import { urlMap } from './externalUrls'
import { getLogger } from './globals'
import {
  ABOUT_US_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  FULL_FAQS_LINK,
  GUN_VIOLENCE_POLICY,
  METHODOLOGY_PAGE_LINK,
  NEWS_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from './internalRoutes'
import type { PhraseSelections } from './MadLibs'

// OLDER HANDLING PARAMS

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

// Ensures backwards compatibility for external links to old DataTypeIds
export function swapOldDatatypeParams(oldParam: string) {
  const swaps: Record<string, DataTypeId> = {
    deaths: 'covid_deaths',
    cases: 'covid_cases',
    hospitalizations: 'covid_hospitalizations',
  }
  return swaps[oldParam] || oldParam
}

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

export const NAVIGATION_STRUCTURE = {
  about: {
    label: 'About',
    pages: {
      [WHAT_IS_HEALTH_EQUITY_PAGE_LINK]: 'What is Health Equity?',
      [ABOUT_US_PAGE_LINK]: 'About Us',
    },
  },
  exploreTheData: {
    label: 'Insights Hub',
    pages: {
      [EXPLORE_DATA_PAGE_LINK]: 'Data Dashboard',
      [DATA_CATALOG_PAGE_LINK]: 'Source Files',
      [METHODOLOGY_PAGE_LINK]: 'Methodology',
      [GUN_VIOLENCE_POLICY]: 'Policy Context',
    },
  },
  mediaAndUpdates: {
    label: 'Media & Updates',
    pages: {
      [NEWS_PAGE_LINK]: 'News',
      [urlMap.hetYouTubeShorts]: 'Videos on YouTube',
    },
  },
  faqs: { label: 'FAQs', link: FULL_FAQS_LINK },
}

export function useSearchParams() {
  const params = new URLSearchParams(useLocation().search)
  return Object.fromEntries(params.entries())
}

export function setParameter(
  paramName: string,
  paramValue: string | null = null,
) {
  setParameters([{ name: paramName, value: paramValue }])
}

interface ParamKeyValue {
  name: string
  value: string | null
}

export function setParameters(paramMap: ParamKeyValue[]) {
  const searchParams = new URLSearchParams(window.location.search)

  paramMap.forEach((kv) => {
    const paramName = kv.name
    const paramValue = kv.value

    if (paramValue) {
      searchParams.set(paramName, paramValue)
    } else {
      searchParams.delete(paramName)
    }
  })

  const base =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname

  window.history.pushState({}, '', base + '?' + searchParams.toString())
}

const defaultHandler = <T,>(input: string | null): T => {
  return input as unknown as T
}

function removeParamAndReturnValue<T1>(paramName: string, defaultValue: T1) {
  setParameter(paramName, null)
  return defaultValue
}

export function getParameter<T1>(
  paramName: string,
  defaultValue: T1,
  formatter: (x: any) => T1 = defaultHandler,
): T1 {
  const searchParams = new URLSearchParams(window.location.search)
  try {
    return searchParams.has(paramName)
      ? formatter(searchParams.get(paramName))
      : defaultValue
  } catch (err) {
    console.error(err)
    return removeParamAndReturnValue(paramName, defaultValue)
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

type PSEventHandler = () => void

const psSubscriptions: any = {}
let psCount: number = 0

export const psSubscribe = (
  handler: PSEventHandler,
  keyPrefix = 'unk',
): { unsubscribe: () => void } => {
  const key = keyPrefix + '_' + psCount
  getLogger().debugLog('Adding PSHandler: ' + key)
  psSubscriptions[key] = handler
  psCount++
  return {
    unsubscribe: () => {
      psUnsubscribe(key)
    },
  }
}

const psUnsubscribe = (k: string) => {
  getLogger().debugLog('Removing PSHandler: ' + k)
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete psSubscriptions[k]
}

window.onpopstate = () => {
  Object.keys(psSubscriptions).forEach((key) => {
    const handler = psSubscriptions[key]
    if (handler) {
      getLogger().debugLog('Firing PSHandler: ' + key)
      handler()
    }
  })
}

export function getHtml(item: string | undefined, asString = false) {
  // If only a string is needed (not setting inner HTML)
  if (asString) {
    const span = document.createElement('span')
    span.innerHTML = item || ''
    return span.textContent || span.innerText || ''
  }

  // Return a div with dangerouslySetInnerHTML
  return (
    <div
      // biome-ignore lint/security/noDangerouslySetInnerHtml: needed to render headless WordPress
      dangerouslySetInnerHTML={{ __html: item || '' }}
    />
  )
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
