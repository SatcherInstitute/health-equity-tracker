import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  AGE_ADJUSTMENT_SLUG,
  METHODOLOGY_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Link, Route, Switch } from 'react-router-dom'

// can't lazy load (yet) due to scss loading issues
import MethodologyTab from './OldMethodologyTab'
import AgeAdjustmentTab from './OldAgeAdjustmentTab'
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
            value={METHODOLOGY_PAGE_LINK}
            label='Methodology'
            component={Link}
            to={METHODOLOGY_PAGE_LINK}
          />
          <Tab
            value={AGE_ADJUSTMENT_SLUG}
            label='Age-Adjustment'
            component={Link}
            to={AGE_ADJUSTMENT_SLUG}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${METHODOLOGY_PAGE_LINK}/`}>
          <MethodologyTab />
        </Route>

        <Route path={`${AGE_ADJUSTMENT_SLUG}/`}>
          <AgeAdjustmentTab />
        </Route>
      </Switch>
    </div>
  )
}
