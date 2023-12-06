import { CardContent } from '@mui/material'
import HetNotice from '../../styles/HetComponents/HetNotice'

function Hiv2020Alert() {
  return (
    <CardContent>
      <HetNotice kind='data-integrity'>
        Due to COVID-19's effects on HIV testing, care services, and case
        surveillance, approach 2020 data with care. Disruptions may skew usual
        trends.
      </HetNotice>
    </CardContent>
  )
}

export default Hiv2020Alert
