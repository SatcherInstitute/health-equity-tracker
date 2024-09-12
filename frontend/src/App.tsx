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
import { autoInitGlobals } from './utils/globals'
import {
  ABOUT_US_PAGE_LINK,
  OLD_CONTACT_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  OLD_OURTEAM_LINK,
  TERMS_OF_USE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
  OLD_AGE_ADJUSTMENT_LINK,
  METHODOLOGY_PAGE_LINK,
  AGE_ADJUSTMENT_LINK,
  GUN_VIOLENCE_POLICY,
  POLICY_PAGE_LINK,
  WIHE_FAQS_PATH,
  OLD_TERMS_OF_SERVICE_LINK,
  WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK,
  SHARE_YOUR_STORY_PATH,
} from './utils/internalRoutes'
import { HelmetProvider } from 'react-helmet-async'
import { useIsBreakpointAndUp } from './utils/hooks/useIsBreakpointAndUp'
import {
  Navigate,
  Routes,
  useLocation,
  BrowserRouter,
  Route,
} from 'react-router-dom'

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
import Banner from './reports/ui/Banner'
import PolicyPage from './pages/Policy/policyComponents/PolicyPage'
import AllPosts from './pages/News/AllPosts'
import ShareYourStory from './pages/News/ShareYourStory'
import SinglePost from './pages/News/SinglePost'
import { routeConfigs as policyRouteConfigs } from './pages/Policy/policyContent/routeConfigs'
import { routeConfigs as methodologyRouteConfigs } from './pages/Methodology/methodologyContent/routeConfigs'
import EquityTab from './pages/WhatIsHealthEquity/EquityTab'
import FaqTab from './pages/WhatIsHealthEquity/FaqTab'

const ExploreDataPage = React.lazy(
  async () => await import('./pages/ExploreData/ExploreDataPage'),
)
const Footer = React.lazy(async () => await import('./Footer'))
const LandingPage = React.lazy(
  async () => await import('./pages/Landing/LandingPage'),
)
const NotFoundPage = React.lazy(
  async () => await import('./pages/NotFoundPage'),
)
const TermsOfUsePage = React.lazy(
  async () => await import('./pages/TermsOfUsePage/TermsOfUsePage'),
)
const DataCatalogPage = React.lazy(
  async () => await import('./pages/DataCatalog/DataCatalogPage'),
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

            <div className='h-full relative'>
              <BrowserRouter>
                <Banner />
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
                  <main id='main' className='scroll-smooth'>
                    <Routes>
                      <Route
                        path={ABOUT_US_PAGE_LINK}
                        element={<AboutUsPage />}
                      />
                      <Route
                        path={OLD_OURTEAM_LINK}
                        element={<AboutUsPage />}
                      />
                      <Route
                        path={OLD_CONTACT_LINK}
                        element={<AboutUsPage />}
                      />
                      <Route
                        path={DATA_CATALOG_PAGE_LINK}
                        element={<DataCatalogPage />}
                      />

                      <Route
                        path={EXPLORE_DATA_PAGE_LINK}
                        element={
                          <ErrorBoundaryDropParams
                            fallback={<ExploreDataFallback />}
                          >
                            <ExploreDataPage isMobile={isSm} />
                          </ErrorBoundaryDropParams>
                        }
                      />

                      {/* WHAT IS HEALTH EQUITY ROUTES */}
                      <Route
                        path={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
                        element={<WhatIsHealthEquityPage />}
                      >
                        <Route path={WIHE_FAQS_PATH} element={<FaqTab />} />
                        <Route path={''} element={<EquityTab />} />
                      </Route>

                      {/* NESTED METHODOLOGY ROUTES */}
                      <Route
                        path={METHODOLOGY_PAGE_LINK}
                        element={<MethodologyPage />}
                      >
                        <>
                          {methodologyRouteConfigs.map((route) => (
                            <Route
                              key={route.path}
                              path={route.path}
                              element={route.component}
                            />
                          ))}
                        </>
                      </Route>

                      {/* NESTED POLICY ROUTES */}

                      <Route
                        path={POLICY_PAGE_LINK}
                        element={<Navigate to={GUN_VIOLENCE_POLICY} />}
                      />
                      <Route path={POLICY_PAGE_LINK} element={<PolicyPage />}>
                        <>
                          {policyRouteConfigs.map((route) => (
                            <Route
                              key={route.path}
                              path={route.path}
                              element={route.component}
                            />
                          ))}
                        </>
                      </Route>

                      {/* NESTED NEWS ROUTES */}
                      <Route path={NEWS_PAGE_LINK} element={<NewsPage />}>
                        <Route
                          path={SHARE_YOUR_STORY_TAB_LINK}
                          element={<ShareYourStory />}
                        />
                        <Route path={''} element={<AllPosts />} />
                        <Route path={`:slug`} element={<SinglePost />} />
                      </Route>

                      <Route
                        path={TERMS_OF_USE_PAGE_LINK}
                        element={<TermsOfUsePage />}
                      />

                      {/* Redirect the old URLs for possible outside links */}
                      <Route
                        path={OLD_TERMS_OF_SERVICE_LINK}
                        element={<Navigate to={TERMS_OF_USE_PAGE_LINK} />}
                      />
                      <Route
                        path={WIHE_FAQS_PATH}
                        element={
                          <Navigate to={WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK} />
                        }
                      />
                      <Route
                        path={SHARE_YOUR_STORY_PATH}
                        element={
                          <Navigate to={SHARE_YOUR_STORY_TAB_LINK} />
                        }
                      />

                      <Route
                        path={OLD_AGE_ADJUSTMENT_LINK}
                        element={<Navigate to={AGE_ADJUSTMENT_LINK} />}
                      />
                      <Route path='/' element={<LandingPage />} />

                      {/* Catch-all route */}
                      <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                  </main>
                </Suspense>
              </BrowserRouter>
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
