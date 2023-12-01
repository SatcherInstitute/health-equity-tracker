import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  OLD_AGE_ADJUSTMENT_LINK,
  OLD_METHODOLOGY_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Link, Route, Switch } from 'react-router-dom'

// can't lazy load (yet) due to scss loading issues
import OldMethodologyTab from './OldMethodologyTab'
import OldAgeAdjustmentTab from './OldAgeAdjustmentTab'
import { useMediaQuery, useTheme } from '@mui/material'

export default function OldMethodologyPage() {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <div className='mx-auto min-h-screen max-w-lg'>
      <Route path='/'>
        <Tabs
          centered={pageIsWide}
          indicatorColor='primary'
          textColor='primary'
          value={window.location.pathname}
          variant={pageIsWide ? 'standard' : 'fullWidth'}
          scrollButtons={pageIsWide ? 'auto' : undefined}
        >
          <Tab
            value={OLD_METHODOLOGY_PAGE_LINK}
            label='Methodology'
            component={Link}
            to={OLD_METHODOLOGY_PAGE_LINK}
          />
          <Tab
            value={OLD_AGE_ADJUSTMENT_LINK}
            label='Age-Adjustment'
            component={Link}
            to={OLD_AGE_ADJUSTMENT_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${OLD_METHODOLOGY_PAGE_LINK as string}/`}>
          <OldMethodologyTab />
        </Route>

        <Route path={`${OLD_AGE_ADJUSTMENT_LINK as string}/`}>
          <OldAgeAdjustmentTab />
        </Route>
      </Switch>
    </div>
  )
}
