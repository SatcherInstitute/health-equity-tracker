import { atom } from 'jotai'
import { type VariableConfig } from '../data/config/MetricConfig'

export const selectedVariableConfig1Atom = atom<VariableConfig | null>(null)
