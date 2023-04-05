import { Alert, CardContent } from '@mui/material'

interface CountyUnavailableAlertProps {
  variableFullDisplayName: string
}

export default function CountyUnavailableAlert(
  props: CountyUnavailableAlertProps
) {
  return (
    <CardContent>
      <Alert severity="warning" role="note">
        Our data source for <b>{props.variableFullDisplayName.toLowerCase()}</b>{' '}
        does not include county-level data.
      </Alert>
    </CardContent>
  )
}
