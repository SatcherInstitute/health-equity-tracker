import '@fontsource/taviraj/200.css'
import '@fontsource/taviraj/300.css'
import '@fontsource/taviraj/400.css'
import '@fontsource/taviraj/500.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/dm-sans'
import '@fontsource/roboto'
import '@fontsource/roboto-condensed'

import { CircularProgress, StyledEngineProvider } from '@mui/material'
// TODO: Delete these imports if possible once MUI is removed/isolated in HetComponents
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import React, { Suspense, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import methodologyRouteConfigs from './pages/Methodology/methodologyContent/methodologyRouteConfigs'
import NewsAndStoriesPage from './pages/News/NewsAndStoriesPage'
import policyRouteConfigs from './pages/Policy/policyContent/policyRouteConfigs'
import { wiheConfigs } from './pages/WhatIsHealthEquity/wiheComponents/WIHECardMenu'
import MaterialTheme from './styles/MaterialTheme'
import { autoInitGlobals } from './utils/globals'
import { useIsBreakpointAndUp } from './utils/hooks/useIsBreakpointAndUp'
import {
  ABOUT_US_PAGE_LINK,
  AGE_ADJUSTMENT_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  FULL_FAQS_LINK,
  GUN_VIOLENCE_POLICY,
  METHODOLOGY_PAGE_LINK,
  NEWS_PAGE_LINK,
  OLD_AGE_ADJUSTMENT_LINK,
  OLD_CONTACT_LINK,
  OLD_OURTEAM_LINK,
  OLD_TERMS_OF_SERVICE_LINK,
  POLICY_PAGE_LINK,
  SHARE_YOUR_STORY_PATH,
  SHARE_YOUR_STORY_TAB_LINK,
  TERMS_OF_USE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from './utils/internalRoutes'

// Lazy Load components for code-splitting
const AboutUsPage = React.lazy(
  async () => await import('./pages/AboutUs/AboutUsPage'),
)
const WhatIsHealthEquityPage = React.lazy(
  async () => await import('./pages/WhatIsHealthEquity/WhatIsHealthEquityPage'),
)
const ErrorBoundaryDropParams = React.lazy(
  async () => await import('./ErrorBoundaryDropParams'),
)
const ExploreDataFallback = React.lazy(
  async () => await import('./pages/ExploreData/ExploreDataFallback'),
)
const NewsPage = React.lazy(async () => await import('./pages/News/NewsPage'))
const SkipLink = React.lazy(async () => await import('./SkipLink'))
const MethodologyPage = React.lazy(
  async () =>
    await import('./pages/Methodology/methodologyComponents/MethodologyPage'),
)
const HetAppBar = React.lazy(
  async () => await import('./styles/HetComponents/HetAppBar'),
)
const Banner = React.lazy(async () => await import('./reports/ui/Banner'))
const PolicyPage = React.lazy(
  async () => await import('./pages/Policy/policyComponents/PolicyPage'),
)
const AllPosts = React.lazy(
  async () => await import('./pages/News/NewsAndStoriesPage'),
)
const ShareYourStory = React.lazy(
  async () => await import('./pages/News/ShareYourStory'),
)
const SinglePost = React.lazy(
  async () => await import('./pages/News/SinglePost'),
)
const FaqsPage = React.lazy(async () => await import('./pages/FAQs/FaqsPage'))

const ExploreDataPage = React.lazy(
  async () => await import('./pages/ExploreData/ExploreDataPage'),
)
const Footer = React.lazy(async () => await import('./Footer'))
const LandingPage = React.lazy(
  async () => await import('./pages/Landing/LandingPage'),
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

            <div className='relative h-full'>
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
                      <Route path={FULL_FAQS_LINK} element={<FaqsPage />} />

                      {/* WHAT IS HEALTH EQUITY ROUTES */}
                      <Route
                        path={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
                        element={<WhatIsHealthEquityPage />}
                      >
                        <>
                          {wiheConfigs.map((route) => (
                            <Route
                              key={route.path}
                              path={route.path}
                              element={route.component}
                            />
                          ))}
                        </>
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
                        <Route path={''} element={<NewsAndStoriesPage />} />
                        <Route path='/news/:slug' element={<SinglePost />} />
                      </Route>

                      <Route
                        path={TERMS_OF_USE_PAGE_LINK}
                        element={<TermsOfUsePage />}
                      />

                      {/* Redirect the old URLs for possible outside links */}
                      <Route
                        path={OLD_OURTEAM_LINK}
                        element={<Navigate to={ABOUT_US_PAGE_LINK} />}
                      />
                      <Route
                        path={OLD_CONTACT_LINK}
                        element={<Navigate to={ABOUT_US_PAGE_LINK} />}
                      />
                      <Route
                        path={OLD_TERMS_OF_SERVICE_LINK}
                        element={<Navigate to={TERMS_OF_USE_PAGE_LINK} />}
                      />
                      <Route
                        path={SHARE_YOUR_STORY_PATH}
                        element={<Navigate to={SHARE_YOUR_STORY_TAB_LINK} />}
                      />

                      <Route
                        path={OLD_AGE_ADJUSTMENT_LINK}
                        element={<Navigate to={AGE_ADJUSTMENT_LINK} />}
                      />

                      {/* Catch-all route */}
                      <Route path='*' element={<LandingPage />} />
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
