import { CardContent, Alert } from '@mui/material'
import { type DataTypeConfig } from '../../data/config/MetricConfig'

interface CAWPOverlappingRacesAlertProps {
  dataTypeConfig: DataTypeConfig
}

export default function CAWPOverlappingRacesAlert(
  props: CAWPOverlappingRacesAlertProps
) {
  return (
    <CardContent>
      <Alert severity="info" role="note">
        Percentages reported for <b>{props.dataTypeConfig.fullDisplayName}</b>{' '}
        cannot be summed, as these race/ethnicity groupings are not mutually
        exclusive. Individuals who identify with more than one group (e.g. both
        "White" and "Latina") are represented in each corresponding category.
      </Alert>
    </CardContent>
  )
}
