import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import React, { Suspense, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import styles from './App.module.scss'
import MaterialTheme from './styles/MaterialTheme'
import { autoInitGlobals } from './utils/globals'
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  FAQ_TAB_LINK,
  OURTEAM_TAB_LINK,
  RESOURCES_TAB_LINK,
  TERMS_OF_USE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
  OLD_METHODOLOGY_PAGE_LINK,
  OLD_AGE_ADJUSTMENT_LINK,
  NEW_METHODOLOGY_PAGE_LINK,
} from './utils/internalRoutes'
import { HelmetProvider } from 'react-helmet-async'
import { Box, CircularProgress, StyledEngineProvider } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

// these make CSS modules which are imported by other components,
// so they must load first and not be lazy loaded
import AboutUsPage from './pages/AboutUs/AboutUsPage'
import WhatIsHealthEquityPage from './pages/WhatIsHealthEquity/WhatIsHealthEquityPage'
import ErrorBoundaryDropParams from './ErrorBoundaryDropParams'
import ExploreDataFallback from './pages/ExploreData/ExploreDataFallback'
import NewsPage from './pages/News/NewsPage'
import SkipLink from './SkipLink'
import OldMethodologyPage from './pages/DataCatalog/OldMethodologyPage'
import MethodologyPage from './pages/Methodology/methodologyComponents/MethodologyPage'
import { useIsBreakpointAndUp } from './utils/hooks/useIsBreakpointAndUp'
import HetMobileAppToolbar from './styles/HetComponents/HetMobileAppToolbar'
import HetAppToolbar from './styles/HetComponents/HetAppToolbar'

const ExploreDataPage = React.lazy(
  async () => await import('./pages/ExploreData/ExploreDataPage')
)
const Footer = React.lazy(async () => await import('./Footer'))
const LandingPage = React.lazy(
  async () => await import('./pages/Landing/LandingPage')
)
const NotFoundPage = React.lazy(
  async () => await import('./pages/NotFoundPage')
)
const TermsOfUsePage = React.lazy(
  async () => await import('./pages/TermsOfUsePage/TermsOfUsePage')
)
const DataCatalogPage = React.lazy(
  async () => await import('./pages/DataCatalog/DataCatalogPage')
)

autoInitGlobals()

// TODO: this could be pulled into a hook
// https://reactrouter.com/web/api/Hooks/uselocation
// https://github.com/ReactTraining/react-router/issues/7015
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  const isSm = useIsBreakpointAndUp('sm')

  return (
    <HelmetProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={MaterialTheme}>
          <CookiesProvider>
            <CssBaseline />
            <div className={styles.App}>
              <SkipLink />

              <div className={styles.Content}>
                <Router>
                  <AppBar position='static' elevation={0}>
                    <div className='smMd:hidden'>
                      <HetMobileAppToolbar />
                    </div>
                    <div className='hidden  smMd:block'>
                      <HetAppToolbar />
                    </div>
                  </AppBar>
                  <ScrollToTop />
                  <Suspense
                    fallback={
                      <main className={styles.FallbackPage}>
                        <Box mt={10}>
                          <CircularProgress aria-label='loading' />
                        </Box>
                      </main>
                    }
                  >
                    <main className='scroll-smooth'>
                      <Switch>
                        <Route path={ABOUT_US_PAGE_LINK}>
                          <AboutUsPage />
                        </Route>

                        <Route path={OURTEAM_TAB_LINK}>
                          <AboutUsPage />
                        </Route>

                        <Route path={CONTACT_TAB_LINK}>
                          <AboutUsPage />
                        </Route>

                        <Route path={DATA_CATALOG_PAGE_LINK}>
                          <DataCatalogPage />
                        </Route>

                        {/* VISIBLE - OLDER METHODOLOGY CONTENT */}

                        <Route path={OLD_METHODOLOGY_PAGE_LINK}>
                          <OldMethodologyPage />
                        </Route>

                        <Route path={OLD_AGE_ADJUSTMENT_LINK}>
                          <OldMethodologyPage />
                        </Route>

                        {/* HIDDEN FOR NOW - NEWER METHODOLOGY REWRITE CONTENT */}

                        <Route path={NEW_METHODOLOGY_PAGE_LINK}>
                          <MethodologyPage />
                        </Route>

                        <Route path={EXPLORE_DATA_PAGE_LINK}>
                          <ErrorBoundaryDropParams
                            fallback={<ExploreDataFallback />}
                          >
                            <ExploreDataPage isMobile={isSm} />
                          </ErrorBoundaryDropParams>
                        </Route>

                        <Route path={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
                          <WhatIsHealthEquityPage />
                        </Route>

                        <Route path={FAQ_TAB_LINK}>
                          <WhatIsHealthEquityPage />
                        </Route>

                        <Route path={RESOURCES_TAB_LINK}>
                          <WhatIsHealthEquityPage />
                        </Route>

                        <Route path={NEWS_PAGE_LINK}>
                          <NewsPage isMobile={isSm} />
                        </Route>

                        <Route path={SHARE_YOUR_STORY_TAB_LINK}>
                          <NewsPage isMobile={isSm} />
                        </Route>

                        <Route path={TERMS_OF_USE_PAGE_LINK}>
                          <TermsOfUsePage />
                        </Route>

                        {/* redirect the old URL for possible outside links */}
                        <Route path={'/termsofservice'}>
                          <Redirect to={TERMS_OF_USE_PAGE_LINK} />
                        </Route>

                        <Route path='/'>
                          <LandingPage />
                        </Route>

                        {/* CATCH ALL OTHER ROUTES AND SERVE NOT FOUND PAGE */}
                        <Route>
                          <NotFoundPage />
                        </Route>
                      </Switch>
                    </main>
                  </Suspense>
                </Router>
              </div>
              <footer>
                <Suspense fallback={<span></span>}>
                  <Footer />
                </Suspense>
              </footer>
            </div>
          </CookiesProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </HelmetProvider>
  )
}
