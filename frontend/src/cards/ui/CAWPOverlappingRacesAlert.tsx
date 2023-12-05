import { CardContent } from '@mui/material'
import { type DataTypeConfig } from '../../data/config/MetricConfig'
import HetAlert from '../../styles/HetComponents/HetAlert'

interface CAWPOverlappingRacesAlertProps {
  dataTypeConfig: DataTypeConfig
}

export default function CAWPOverlappingRacesAlert(
  props: CAWPOverlappingRacesAlertProps
) {
  return (
    <CardContent>
      <HetAlert>
        Percentages reported for <b>{props.dataTypeConfig.fullDisplayName}</b>{' '}
        cannot be summed, as these race/ethnicity groupings are not mutually
        exclusive. Individuals who identify with more than one group (e.g. both
        "White" and "Latina") are represented in each corresponding category.
      </HetAlert>
    </CardContent>
  )
}
