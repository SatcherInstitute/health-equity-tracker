import { atom } from 'jotai'
import { type DataTypeConfig } from '../data/config/MetricConfig'
import { type BreakdownVar } from '../data/query/Breakdowns'

export const selectedDataTypeConfig1Atom = atom<DataTypeConfig | null>(null)
export const selectedDataTypeConfig2Atom = atom<DataTypeConfig | null>(null)
export const selectedDemographicTypeAtom =
  atom<BreakdownVar>('race_and_ethnicity')

export const topicInfoModalIsOpenAtom = atom<boolean>(false)
