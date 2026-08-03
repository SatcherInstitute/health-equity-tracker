import type {
  DataTypeConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import { formatSubPopString } from '../../data/config/MetricConfigUtils'
import type { Fips } from '../../data/utils/Fips'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

interface GeneralPopulationComparisonAlertProps {
  dataTypeConfig: DataTypeConfig
  populationConfig: MetricConfig
  fips: Fips
}

export default function GeneralPopulationComparisonAlert(
  props: GeneralPopulationComparisonAlertProps,
) {
  const subPopulation = formatSubPopString({
    ageSubPopulationLabel: props.dataTypeConfig.ageSubPopulationLabel,
    otherSubPopulationLabel: props.dataTypeConfig.otherSubPopulationLabel,
  })

  return (
    <HetNotice kind='data-integrity'>
      <HetTerm>
        {props.populationConfig.columnTitleHeader ??
          props.populationConfig.shortLabel}
      </HetTerm>{' '}
      figures here represent{' '}
      {props.populationConfig.generalPopulationLabel ?? 'everyone'} in{' '}
      {props.fips.getSentenceDisplayName()}, and are provided for context only.
      These are not the figures used to calculate{' '}
      {props.dataTypeConfig.fullDisplayNameInline ??
        props.dataTypeConfig.fullDisplayName}{' '}
      rates, which measure only {subPopulation || 'a narrower group'}.
    </HetNotice>
  )
}
