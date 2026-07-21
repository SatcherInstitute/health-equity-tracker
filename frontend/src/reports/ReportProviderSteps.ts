import type { ScrollableHashId } from '../utils/hooks/useStepObserver'

interface StepLabelInfo {
  pluralOnCompare: boolean
  label: string
  hasContrastSection?: boolean
}

export const reportProviderSteps: Record<ScrollableHashId, StepLabelInfo> = {
  'rate-map': {
    label: 'Rate map',
    pluralOnCompare: true,
    hasContrastSection: true,
  },
  'rates-over-time': {
    label: 'Rates over time',
    pluralOnCompare: false,
    hasContrastSection: true,
  },
  'rate-chart': {
    label: 'Rate chart',
    pluralOnCompare: true,
    hasContrastSection: true,
  },
  'unknown-demographic-map': {
    label: 'Unknown demographic map',
    pluralOnCompare: true,
  },
  'inequities-over-time': {
    label: 'Inequities over time',
    pluralOnCompare: false,
    hasContrastSection: true,
  },
  'population-vs-distribution': {
    label: 'Population vs. distribution',
    pluralOnCompare: false,
    hasContrastSection: true,
  },
  'data-table': {
    label: 'Data table',
    pluralOnCompare: true,
    hasContrastSection: true,
  },
  'age-adjusted-ratios': {
    label: 'Age-adjusted ratios',
    pluralOnCompare: true,
    hasContrastSection: true,
  },
  'definitions-missing-data': {
    label: 'Definitions & missing data',
    pluralOnCompare: false,
  },
  'multimap-modal': {
    label: '',
    pluralOnCompare: false,
  },
}
