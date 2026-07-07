import { atom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { atomFamily } from 'jotai-family'
import { atomWithLocation } from 'jotai-location'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import type { Fips } from '../data/utils/Fips'
import type { ReportInsightSections } from './generateReportInsight'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MADLIB_SELECTIONS_PARAM,
  parseMls,
} from './urlutils'

export const selectedFipsAtom = atom<Fips | null>(null)
export const selectedDemographicTypeAtom = atom<DemographicType | null>(null)

/* CARD INSIGHT CACHE — keyed by scrollToHash + dataTypeId + fipsCode + demographicType (+ '-2' for compare card) */
export const cardInsightsAtom = atom<Record<string, string>>({})

/* CARD INSIGHT OPEN STATE — keyed by scrollToHash (+ '-2' for compare card) */
export const cardInsightOpenAtom = atom<Record<string, boolean>>({})

/* CONTRAST INSIGHT CACHE — keyed by scrollToHash + both dataTypeIds + both fipsCodes + demographicType */
export const contrastInsightsAtom = atom<Record<string, string>>({})

/* CARD QUERY RESPONSES — keyed same as cardInsightsAtom; published by CardWrapper for ContrastInsightSection to consume. */
export const cardQueryResponsesAtom = atom<
  Record<string, MetricQueryResponse[]>
>({})

/* REPORT INSIGHT CACHE — keyed by dataTypeId + fipsCode + demographicType */
export type ReportInsightCacheEntry = {
  sections: ReportInsightSections
}
export const reportInsightsAtom = atom<Record<string, ReportInsightCacheEntry>>(
  {},
)

/* URL PARAMS — all written via setLocationAtom (single pushState per action).
 * jotai-location's popstate listener keeps locationAtom current on back/forward.
 * Components subscribe via urlParamAtom(key) for fine-grained re-renders.
 */
export const locationAtom = atomWithLocation()

// Per-param derived atoms. selectAtom with Object.is equality means a component
// subscribed to urlParamAtom('demo') only re-renders when 'demo' changes,
// not when any other URL param changes.
export const urlParamAtom = atomFamily((key: string) =>
  selectAtom(
    locationAtom,
    (loc) => loc.searchParams?.get(key) ?? null,
    Object.is,
  ),
)

// Flattened once at module level — METRIC_CONFIG is static.
const ALL_METRIC_CONFIGS = Object.values(METRIC_CONFIG).flat()

// Derived from dt1/dt2 URL params, with fallback to the first config for the
// topic encoded in the mls param. Returns null only when no topic is selected.
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(
  (get) => {
    const dt1 = get(urlParamAtom(DATA_TYPE_1_PARAM))
    if (dt1) return ALL_METRIC_CONFIGS.find((c) => c.dataTypeId === dt1) ?? null
    const mls = get(urlParamAtom(MADLIB_SELECTIONS_PARAM))
    if (!mls) return null
    const topic = parseMls(mls)[1]
    return METRIC_CONFIG[topic as keyof typeof METRIC_CONFIG]?.[0] ?? null
  },
)

// For comparevars mode: falls back to the first config for the second topic in
// mls. In comparegeos/disparity mode, mls index 3 is a FIPS code, so
// METRIC_CONFIG lookup returns undefined and the atom correctly returns null.
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(
  (get) => {
    const dt2 = get(urlParamAtom(DATA_TYPE_2_PARAM))
    if (dt2) return ALL_METRIC_CONFIGS.find((c) => c.dataTypeId === dt2) ?? null
    const mls = get(urlParamAtom(MADLIB_SELECTIONS_PARAM))
    if (!mls) return null
    const topic = parseMls(mls)[3]
    return METRIC_CONFIG[topic as keyof typeof METRIC_CONFIG]?.[0] ?? null
  },
)
