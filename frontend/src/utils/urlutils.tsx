import Button from '@mui/material/Button'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { type DataTypeId } from '../data/config/MetricConfig'
import { getLogger } from './globals'
import { EXPLORE_DATA_PAGE_LINK } from './internalRoutes'
import { type MadLibId, type PhraseSelections } from './MadLibs'
import {
  raceNameToCodeMap,
  type DemographicGroup,
} from '../data/utils/Constants'

export const STICKY_VERSION_PARAM = 'sv'

// Value is a comma-separated list of dataset ids. Dataset ids cannot have
// commas in them.
export const DATA_SOURCE_PRE_FILTERS = 'dpf'

// Value is index of the phrase to jump to
export const MADLIB_PHRASE_PARAM = 'mlp'

// Value is a comma-separated list mapping indices to values with : delimiter
// Values are applied on top of defaults so you only need to specify those that differ
// mls=0:1,2:5
export const MADLIB_SELECTIONS_PARAM = 'mls'

// 'true' or 'false' will override the cookie to show or hide the onboarding flow
export const SHOW_ONBOARDING_PARAM = 'onboard'

export const DEMOGRAPHIC_PARAM = 'demo'
export const DATA_TYPE_1_PARAM = 'dt1'
export const DATA_TYPE_2_PARAM = 'dt2'

export const MAP1_GROUP_PARAM = 'group1'
export const MAP2_GROUP_PARAM = 'group2'

export const TOPIC_INFO_PARAM_KEY = 'topic-info'
export const MULTIPLE_MAPS_1_PARAM_KEY = 'multiple-maps'
export const MULTIPLE_MAPS_2_PARAM_KEY = 'multiple-maps2'
export const HIGHEST_LOWEST_GEOS_1_PARAM_KEY = 'highest-lowest-geos'
export const HIGHEST_LOWEST_GEOS_2_PARAM_KEY = 'highest-lowest-geos2'

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
  children: React.ReactNode
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

export function ReactRouterLinkButton(props: {
  url: string
  className?: string
  displayName?: string
  children?: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <Button
      href={props.url}
      className={props.className}
      aria-label={props.ariaLabel}
    >
      {props.displayName ?? props.children}
    </Button>
  )
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
  absolute = false
) {
  const selectionOverrides = Object.keys(phraseSelections).map(
    (key) => key + ':' + phraseSelections[Number(key)]
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
  paramValue: string | null = null
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
  defaultValue: T1
) {
  setParameter(paramName, null)
  return defaultValue
}

export function getParameter<T1>(
  paramName: string,
  defaultValue: T1,
  formatter: (x: any) => T1 = defaultHandler
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
  keyPrefix = 'unk'
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
    return <div dangerouslySetInnerHTML={{ __html: item || '' }}></div>
  }

  // if only string is needed, create an HTML element and then extract the text
  const span = document.createElement('span')
  span.innerHTML = item
  return span.textContent ?? span.innerText
}

/* for converting selected group long name into URL safe param value */
export function getGroupParamFromDemographicGroup(
  groupLongName: DemographicGroup
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
  groupParam: string
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
      (entry) => entry[1] === groupCodeFromParam
    )?.[0] ?? groupCodeFromParam

  return groupName
}
