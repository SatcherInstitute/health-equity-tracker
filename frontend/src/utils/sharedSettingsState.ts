import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'
import { type DataTypeConfig } from '../data/config/MetricConfig'
import { type DemographicType } from '../data/query/Breakdowns'

/* GENERAL PARAMS STATE */
export const locationAtom = atomWithLocation()

/* USER SELECTED REPORT SETTINGS */
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)
export const selectedDemographicTypeAtom =
  atom<DemographicType>('race_and_ethnicity')
