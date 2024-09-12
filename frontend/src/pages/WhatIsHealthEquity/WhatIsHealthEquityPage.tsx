import { useEffect, useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Link, useLocation, Outlet } from 'react-router-dom'
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
          value={WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK}
          label='FAQs'
          component={Link}
          to={WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK}
        />
      </Tabs>

      {/* RENDER SELECTED TAB'S COMPONENT FROM REACT ROUTER */}
      <Outlet />
    </div>
  )
}
