import { atom } from 'jotai'
import { atomFamily, selectAtom } from 'jotai/utils'
import { atomWithLocation } from 'jotai-location'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import type { ReportInsightSections } from './generateReportInsight'
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)

export const selectedFipsAtom = atom<Fips | null>(null)
export const selectedDemographicTypeAtom = atom<DemographicType | null>(null)

/* CARD INSIGHT CACHE — keyed by scrollToHash + dataTypeId + fipsCode + demographicType */
export const cardInsightsAtom = atom<Record<string, string>>({})

/* CARD INSIGHT OPEN STATE — keyed by scrollToHash only (UI visibility) */
export const cardInsightOpenAtom = atom<Record<string, boolean>>({})

/* REPORT INSIGHT CACHE — keyed by dataTypeId + fipsCode + demographicType */
export type ReportInsightCacheEntry = {
  sections: ReportInsightSections
}
export const reportInsightsAtom = atom<Record<string, ReportInsightCacheEntry>>(
  {},
)

/* SHARED SYNCED URL PARAMS STATE
 *
 * Two-tier URL param system:
 *
 * Tier 1 — MadLib params (mls, dt1, dt2, group1, group2, mlp, extremes*):
 *   Written by ExploreDataPage via history.replaceState directly.
 *   jotai-location only syncs on popstate, so locationAtom.searchParams
 *   is NOT kept current for these. Read them from window.location.search.
 *
 * Tier 2 — modal / UI params (topic-info, multiple-maps*, chlp-maps,
 *   vote-dot-org, report-insight, demo, atl):
 *   Written via useParamState → setLocationState. locationAtom stays
 *   current for these. Components subscribe via urlParamAtom(key).
 *
 * See useParamState.tsx for why setParamState reads window.location.search
 * rather than prev.searchParams as its base.
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
