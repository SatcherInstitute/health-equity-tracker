import '@fontsource/taviraj/200.css'
import '@fontsource/taviraj/300.css'
import '@fontsource/taviraj/400.css'
import '@fontsource/taviraj/500.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/dm-sans'
import '@fontsource/roboto'
import '@fontsource/roboto-condensed'

// TODO: Delete these imports if possible once MUI is removed/isolated in HetComponents
import CssBaseline from '@mui/material/CssBaseline'
import MaterialTheme from './styles/MaterialTheme'
import { CircularProgress, StyledEngineProvider } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import React, { Suspense, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom'
import { autoInitGlobals } from './utils/globals'
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_SECTION_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  FAQ_TAB_LINK,
  OURTEAM_SECTION_LINK,
  TERMS_OF_USE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
  OLD_AGE_ADJUSTMENT_LINK,
  METHODOLOGY_PAGE_LINK,
  AGE_ADJUSTMENT_LINK,
} from './utils/internalRoutes'
import { HelmetProvider } from 'react-helmet-async'
import { useIsBreakpointAndUp } from './utils/hooks/useIsBreakpointAndUp'

// these make CSS modules which are imported by other components,
// so they must load first and not be lazy loaded
import AboutUsPage from './pages/AboutUs/AboutUsPage'
import WhatIsHealthEquityPage from './pages/WhatIsHealthEquity/WhatIsHealthEquityPage'
import ErrorBoundaryDropParams from './ErrorBoundaryDropParams'
import ExploreDataFallback from './pages/ExploreData/ExploreDataFallback'
import NewsPage from './pages/News/NewsPage'
import SkipLink from './SkipLink'
import MethodologyPage from './pages/Methodology/methodologyComponents/MethodologyPage'
import HetAppBar from './styles/HetComponents/HetAppBar'

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
          <CssBaseline />
          <div className='relative min-h-full bg-white text-center'>
            <SkipLink />

            <div className='h-full pb-footer'>
              <Router>
                <HetAppBar />
                <ScrollToTop />
                <Suspense
                  fallback={
                    <main className='min-h-screen'>
                      <CircularProgress
                        className='mt-10'
                        aria-label='loading'
                      />
                    </main>
                  }
                >
                  <main className='scroll-smooth'>
                    <Switch>
                      <Route path={ABOUT_US_PAGE_LINK}>
                        <AboutUsPage />
                      </Route>

                      <Route path={OURTEAM_SECTION_LINK}>
                        <AboutUsPage />
                      </Route>

                      <Route path={CONTACT_SECTION_LINK}>
                        <AboutUsPage />
                      </Route>

                      <Route path={DATA_CATALOG_PAGE_LINK}>
                        <DataCatalogPage />
                      </Route>

                      <Route path={METHODOLOGY_PAGE_LINK}>
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

                      <Route path={OLD_AGE_ADJUSTMENT_LINK}>
                        <Redirect to={AGE_ADJUSTMENT_LINK} />
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
        </ThemeProvider>
      </StyledEngineProvider>
    </HelmetProvider>
  )
}
