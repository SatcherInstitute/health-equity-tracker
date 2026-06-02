import { atom } from 'jotai'
import { atomFamily, selectAtom } from 'jotai/utils'
import { atomWithLocation } from 'jotai-location'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import type { Fips } from '../data/utils/Fips'
import type { ReportInsightSections } from './generateReportInsight'
import { DATA_TYPE_1_PARAM, DATA_TYPE_2_PARAM } from './urlutils'

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

// Derived from dt1/dt2 URL params — never manually set.
// Returns null when the param is absent or the id is not found.
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(
  (get) => {
    const dt1 = get(urlParamAtom(DATA_TYPE_1_PARAM))
    if (!dt1) return null
    return ALL_METRIC_CONFIGS.find((c) => c.dataTypeId === dt1) ?? null
  },
)

export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(
  (get) => {
    const dt2 = get(urlParamAtom(DATA_TYPE_2_PARAM))
    if (!dt2) return null
    return ALL_METRIC_CONFIGS.find((c) => c.dataTypeId === dt2) ?? null
  },
)
