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
      <HetTerm>{props.populationColumnTitle}</HetTerm> comes from this area's
      general population, while{' '}
      <HetTerm>{props.dataTypeConfig.fullDisplayName}</HetTerm> is measured only
      among {subPopulation || 'a narrower group'}. The two columns describe
      different populations, so read the comparison as a rough sense of who
      lives here, not as a precise share of the group the rate covers.
    </HetNotice>
  )
}
