import { CardContent } from '@mui/material'
import HetAlert from '../../styles/HetComponents/HetAlert'

function Hiv2020Alert() {
  return (
    <CardContent>
      <HetAlert kind='data-integrity'>
        Due to COVID-19's effects on HIV testing, care services, and case
        surveillance, approach 2020 data with care. Disruptions may skew usual
        trends.
      </HetAlert>
    </CardContent>
  )
}

export default Hiv2020Alert
