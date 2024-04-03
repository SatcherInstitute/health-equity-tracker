import { useEffect, useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useUrlSearchParams } from '../../utils/urlutils'
import {
  FAQ_TAB_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Link, Navigate, Route, Routes } from 'react-router-dom'

// can't lazy load (yet) due to loading issues
import EquityTab from './EquityTab'
import FaqTab from './FaqTab'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

export default function WhatIsHealthEquityPage() {
  const isSm = useIsBreakpointAndUp('sm')

  const [tabLayout, setTabLayout] = useState({})

  // when screen width changes, update tab spacing MUI attribute
  useEffect(() => {
    setTabLayout(isSm ? { centered: true } : { variant: 'fullWidth' })
  }, [isSm])

  return (
    <div>
      {/*  intercept old FAQ via query params for backwards compatible links */}
      {useUrlSearchParams().get('tab') === '1' && (
        <Navigate
          to={{
            pathname: FAQ_TAB_LINK,
          }}
        />
      )}
      <Route path='/'>
        <Tabs
          {...tabLayout}
          indicatorColor='primary'
          textColor='primary'
          value={window.location.pathname}
        >
          <Tab
            value={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
            label='What Is Health Equity?'
            component={Link}
            to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
          />
          <Tab
            value={FAQ_TAB_LINK}
            label='FAQs'
            component={Link}
            to={FAQ_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Routes>
        <Route path={`${FAQ_TAB_LINK}/`} element={<FaqTab />} />
        <Route path={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/`} element={<EquityTab />} />
      </Routes>
    </div>
  )
}
