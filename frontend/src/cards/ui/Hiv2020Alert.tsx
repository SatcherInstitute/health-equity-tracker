import { CardContent, Alert } from '@mui/material'

function Hiv2020Alert() {
  return (
    <CardContent>
      <Alert severity="warning" role="note">
        Due to COVID-19's effects on HIV testing, care services, and case
        surveillance, approach 2020 data with care. Disruptions may skew usual
        trends.
      </Alert>
    </CardContent>
  )
}

export default Hiv2020Alert
