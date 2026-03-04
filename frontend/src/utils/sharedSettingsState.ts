import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'

export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)

export const selectedFipsAtom = atom<Fips | null>(null)
export const selectedDemographicTypeAtom = atom<DemographicType | null>(null)

/* SHARED SYNCED URL PARAMS STATE */
export const locationAtom = atomWithLocation()
