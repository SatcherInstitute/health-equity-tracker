import { Link, useLocation } from 'react-router-dom'
import type { DataTypeId } from '../data/config/MetricConfig'
import { getLogger } from './globals'
import {
  ABOUT_US_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  NEWS_PAGE_LINK,
  METHODOLOGY_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  FAQ_TAB_LINK,
  GUN_VIOLENCE_POLICY,
} from './internalRoutes'
import type { MadLibId, PhraseSelections } from './MadLibs'
import {
  raceNameToCodeMap,
  type DemographicGroup,
} from '../data/utils/Constants'
import type { ReactNode } from 'react'
import { urlMap } from './externalUrls'

// OLDER HANDLING PARAMS

export const STICKY_VERSION_PARAM = 'sv'
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

// Ensures backwards compatibility for external links to old DataTypeIds
export function swapOldDatatypeParams(oldParam: string) {
  const swaps: Record<string, DataTypeId> = {
    deaths: 'covid_deaths',
    cases: 'covid_cases',
    hospitalizations: 'covid_hospitalizations',
  }
  return swaps[oldParam] || oldParam
}

export function useUrlSearchParams() {
  return new URLSearchParams(useLocation().search)
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

export const PAGE_URL_TO_NAMES: Record<string, string> = {
  [WHAT_IS_HEALTH_EQUITY_PAGE_LINK]: 'What is Health Equity?',
  [EXPLORE_DATA_PAGE_LINK]: 'Explore the Data',
  [NEWS_PAGE_LINK]: 'News',
  [DATA_CATALOG_PAGE_LINK]: 'Downloads',
  [METHODOLOGY_PAGE_LINK]: 'Methodology',
  [ABOUT_US_PAGE_LINK]: 'About Us',
}

export const ADDED_MOBILE_PAGE_URL_TO_NAMES: Record<string, string> = {
  '/': 'Home',
}

export const NAVIGATION_STRUCTURE = {
  about: {
    label: 'About',
    pages: {
      [WHAT_IS_HEALTH_EQUITY_PAGE_LINK]: 'What is Health Equity?',
      // [GUN_VIOLENCE_POLICY]: 'Policy Context',
      [ABOUT_US_PAGE_LINK]: 'About Us',
    },
  },
  exploreTheData: {
    label: 'Explore the Data',
    pages: {
      [EXPLORE_DATA_PAGE_LINK]: 'Explore the Data',
      [DATA_CATALOG_PAGE_LINK]: 'Data Downloads',
      [METHODOLOGY_PAGE_LINK]: 'Methodology',
    },
  },
  mediaAndUpdates: {
    label: 'Media & Updates',
    pages: {
      [NEWS_PAGE_LINK]: 'News',
      [urlMap.hetYouTubeShorts]: 'Videos',
    },
  },
  faqs: { label: 'FAQs', link: FAQ_TAB_LINK },
}

export function useSearchParams() {
  // Note: URLSearchParams doesn't support IE, if we keep this code and we want
  // to support IE we'll need to change it.
  const params = new URLSearchParams(useLocation().search)
  return Object.fromEntries(params.entries())
}

export function linkToMadLib(
  madLibId: MadLibId,
  phraseSelections: PhraseSelections,
  absolute = false,
) {
  const selectionOverrides = Object.keys(phraseSelections).map(
    (key) => key + ':' + phraseSelections[Number(key)],
  )

  const url = [
    EXPLORE_DATA_PAGE_LINK,
    '?',
    MADLIB_PHRASE_PARAM,
    '=',
    madLibId,
    '&',
    MADLIB_SELECTIONS_PARAM,
    '=',
    selectionOverrides.join(','),
  ].join('')
  return absolute ? window.location.host + url : url
}

export function setParameter(
  paramName: string,
  paramValue: string | null = null,
) {
  setParameters([{ name: paramName, value: paramValue }])
}

export interface ParamKeyValue {
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

export function removeParamAndReturnValue<T1>(
  paramName: string,
  defaultValue: T1,
) {
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

export type PSEventHandler = () => void

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

export const psUnsubscribe = (k: string) => {
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

/*
Dumps a string of HTML into a div (or string with optional boolean)
*/
export function getHtml(item: any, asString?: boolean) {
  // if div is needed
  if (!asString) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: needed to render headless Wordpress
    return <div dangerouslySetInnerHTML={{ __html: item || '' }}></div>
  }

  // if only string is needed, create an HTML element and then extract the text
  const span = document.createElement('span')
  span.innerHTML = item
  return span.textContent ?? span.innerText
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
