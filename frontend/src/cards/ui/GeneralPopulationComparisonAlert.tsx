import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { formatSubPopString } from '../../data/config/MetricConfigUtils'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

interface GeneralPopulationComparisonAlertProps {
  dataTypeConfig: DataTypeConfig
  populationColumnTitle: string
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
      <HetTerm>{props.populationColumnTitle}</HetTerm> covers everyone here, not
      just the {subPopulation || 'narrower group'} this rate measures. Use it
      for rough context, not an exact comparison.
    </HetNotice>
  )
}
