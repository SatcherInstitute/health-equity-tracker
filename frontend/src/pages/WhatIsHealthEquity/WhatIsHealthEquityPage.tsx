import React, { lazy, useEffect } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useUrlSearchParams } from '../../utils/urlutils'
import {
  FAQ_TAB_LINK,
  RESOURCES_TAB_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from '../../utils/internalRoutes'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

// can't lazy load (yet)
// import EquityTab from './EquityTab'
// import FaqTab from './FaqTab'
import ResourcesTab from './ResourcesTab'

// Lazy
const FaqTab = lazy(async () => await import('./FaqTab'))
const EquityTab = lazy(async () => await import('./EquityTab'))

export default function WhatIsHealthEquityPage() {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))
  const [tabLayout, setTabLayout] = React.useState({})

  // when screen width changes, update tab spacing MUI attribute
  useEffect(() => {
    setTabLayout(pageIsWide ? { centered: true } : { variant: 'fullWidth' })
  }, [pageIsWide])

  return (
    <div>
      {/*  intercept old FAQ via query params for backwards compatible links */}
      {useUrlSearchParams().get('tab') === '1' && (
        <Redirect
          to={{
            pathname: FAQ_TAB_LINK,
          }}
        />
      )}
      <Route path="/">
        <Tabs
          {...tabLayout}
          indicatorColor="primary"
          textColor="primary"
          value={window.location.pathname}
        >
          <Tab
            value={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
            label="What Is Health Equity?"
            component={Link}
            to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
          />
          <Tab
            value={FAQ_TAB_LINK}
            label="FAQs"
            component={Link}
            to={FAQ_TAB_LINK}
          />
          <Tab
            value={RESOURCES_TAB_LINK}
            label="Resources"
            component={Link}
            to={RESOURCES_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${FAQ_TAB_LINK}/`}>
          <FaqTab />
        </Route>
        <Route path={`${RESOURCES_TAB_LINK}/`}>
          <ResourcesTab />
        </Route>
        <Route path={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/`}>
          <EquityTab />
        </Route>
      </Switch>
    </div>
  )
}
