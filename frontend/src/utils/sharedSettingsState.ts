import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import type { ReportInsightSections } from './generateReportInsight'
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)

export const selectedFipsAtom = atom<Fips | null>(null)
export const selectedDemographicTypeAtom = atom<DemographicType | null>(null)

/* CARD INSIGHT CACHE — keyed by scrollToHash + dataTypeId + fipsCode + demographicType (+ '-2' for compare card) */
export const cardInsightsAtom = atom<Record<string, string>>({})

/* CARD INSIGHT OPEN STATE — keyed by scrollToHash (+ '-2' for compare card) */
export const cardInsightOpenAtom = atom<Record<string, boolean>>({})

/* CONTRAST INSIGHT CACHE — keyed by scrollToHash + both dataTypeIds + both fipsCodes + demographicType */
export const contrastInsightsAtom = atom<Record<string, string>>({})

/* CONTRAST INSIGHT OPEN STATE — keyed by scrollToHash (one per row) */
export const contrastInsightOpenAtom = atom<Record<string, boolean>>({})

/* REPORT INSIGHT CACHE — keyed by dataTypeId + fipsCode + demographicType */
export type ReportInsightCacheEntry = {
  sections: ReportInsightSections
}
export const reportInsightsAtom = atom<Record<string, ReportInsightCacheEntry>>(
  {},
)

/* SHARED SYNCED URL PARAMS STATE */
export const locationAtom = atomWithLocation()
