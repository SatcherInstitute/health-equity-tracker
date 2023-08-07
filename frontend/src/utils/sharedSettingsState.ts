import { atom } from 'jotai'
import { type DataTypeConfig } from '../data/config/MetricConfig'
import { type DemographicType } from '../data/query/Breakdowns'

/* USER SELECTED REPORT SETTINGS */
export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)
export const selectedDemographicTypeAtom =
  atom<DemographicType>('race_and_ethnicity')

/* MODALS */
export const topicInfoModalIsOpenAtom = atom<boolean>(false)
