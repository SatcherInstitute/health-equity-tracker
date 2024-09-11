import { useEffect, useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  FAQ_TAB_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Route, Routes, Link, useLocation } from 'react-router-dom-v5-compat'

// can't lazy load (yet) due to loading issues
import EquityTab from './EquityTab'
import FaqTab from './FaqTab'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

export default function WhatIsHealthEquityPage() {
  const isSm = useIsBreakpointAndUp('sm')
  const location = useLocation()

  const [tabLayout, setTabLayout] = useState({})

  // when screen width changes, update tab spacing MUI attribute
  useEffect(() => {
    setTabLayout(isSm ? { centered: true } : { variant: 'fullWidth' })
  }, [isSm])

  return (
    <div>
      <Tabs
        {...tabLayout}
        indicatorColor='primary'
        textColor='primary'
        value={location.pathname}
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

      <Routes>
        <Route path={FAQ_TAB_LINK} element={<FaqTab />} />
        <Route path={WHAT_IS_HEALTH_EQUITY_PAGE_LINK} element={<EquityTab />} />
      </Routes>
    </div>
  )
}
