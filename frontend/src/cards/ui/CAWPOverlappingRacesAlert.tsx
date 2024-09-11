import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

interface CAWPOverlappingRacesAlertProps {
  dataTypeConfig: DataTypeConfig
}

export default function CAWPOverlappingRacesAlert(
  props: CAWPOverlappingRacesAlertProps,
) {
  return (
    <HetNotice>
      Percentages reported for{' '}
      <HetTerm>{props.dataTypeConfig.fullDisplayName}</HetTerm> cannot be
      summed, as these race/ethnicity groupings are not mutually exclusive.
      Individuals who identify with more than one group (e.g. both "White" and
      "Latina") are represented in each corresponding category.
    </HetNotice>
  )
}
