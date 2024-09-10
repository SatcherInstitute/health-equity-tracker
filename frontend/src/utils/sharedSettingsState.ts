import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'

export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)

/* SHARED SYNCED URL PARAMS STATE */
export const locationAtom = atomWithLocation()
