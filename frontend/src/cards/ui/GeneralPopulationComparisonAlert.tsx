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
  // Required rather than read off populationConfig, where it is optional. The
  // sentence states this population as fact, so a default would be a claim.
  generalPopulationLabel: string
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
      figures here represent {props.generalPopulationLabel} in{' '}
      {props.fips.getSentenceDisplayName()}, and are provided for context only.
      These are not the figures used to calculate{' '}
      {props.dataTypeConfig.fullDisplayNameInline ??
        props.dataTypeConfig.fullDisplayName}{' '}
      rates, which measure only {subPopulation || 'a narrower group'}.
    </HetNotice>
  )
}
