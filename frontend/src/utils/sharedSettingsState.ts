import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'
import { type DataTypeConfig } from '../data/config/MetricConfig'

/* GENERAL PARAMS STATE */
export const locationAtom = atomWithLocation()

/* USER SELECTED REPORT SETTINGS */
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)
