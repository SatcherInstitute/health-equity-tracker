import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import React, { Suspense, useEffect, useState } from 'react'
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
import { LinkWithStickyParams, ReactRouterLinkButton } from './utils/urlutils'
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  FAQ_TAB_LINK,
  METHODOLOGY_TAB_LINK,
  OURTEAM_TAB_LINK,
  RESOURCES_TAB_LINK,
  TERMS_OF_USE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  AGE_ADJUSTMENT_TAB_LINK,
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from './utils/internalRoutes'
import AppBarLogo from './assets/AppbarLogo.png'
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
const DataCatalogTab = React.lazy(
  async () => await import('./pages/DataCatalog/DataCatalogTab')
)

export const MOBILE_BREAKPOINT = 600

const PAGE_URL_TO_NAMES: Record<string, string> = {
  '/': 'Home',
  [WHAT_IS_HEALTH_EQUITY_PAGE_LINK]: 'What is Health Equity?',
  [EXPLORE_DATA_PAGE_LINK]: 'Explore the Data',
  [DATA_CATALOG_PAGE_LINK]: 'Downloads & Methodology',
  [NEWS_PAGE_LINK]: 'News',
  [ABOUT_US_PAGE_LINK]: 'About Us',
}

autoInitGlobals()

function MobileAppToolbar() {
  const [open, setOpen] = useState(false)

  function ListItemLink(props: any) {
    return <ListItem component="a" {...props} />
  }

  return (
    <Toolbar>
      <a className={styles.SkipMainLink} href="#main">
        Skip to main content
      </a>
      <IconButton
        onClick={() => {
          setOpen(true)
        }}
        aria-label="Expand site navigation"
        size="large"
      >
        <MenuIcon className={styles.MenuIconForMobile} />
      </IconButton>
      <Drawer variant="persistent" anchor="left" open={open}>
        <Button
          aria-label="Collapse site navigation"
          onClick={() => {
            setOpen(false)
          }}
        >
          <ChevronLeftIcon />
        </Button>
        <nav>
          <List>
            {Object.keys(PAGE_URL_TO_NAMES).map((pageUrl, index) => (
              <ListItemLink href={pageUrl} key={index}>
                <ListItemText primary={PAGE_URL_TO_NAMES[pageUrl]} />
              </ListItemLink>
            ))}
          </List>
        </nav>
      </Drawer>
    </Toolbar>
  )
}

function AppToolbar() {
  return (
    <Toolbar className={styles.AppToolbar}>
      <a className={styles.SkipMainLink} href="#main">
        Skip to main content
      </a>
      <ReactRouterLinkButton url="/" className={styles.AppbarLogoImg}>
        <img
          src={AppBarLogo}
          className={styles.AppbarLogoImg}
          alt="Health Equity Tracker logo"
        />
      </ReactRouterLinkButton>
      <Typography variant="h1" className={styles.HomeLogo}>
        <LinkWithStickyParams to="/">
          Health Equity Tracker
        </LinkWithStickyParams>
      </Typography>
      <nav>
        {[
          WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
          EXPLORE_DATA_PAGE_LINK,
          NEWS_PAGE_LINK,
          DATA_CATALOG_PAGE_LINK,
          ABOUT_US_PAGE_LINK,
        ].map((pageUrl) => (
          <ReactRouterLinkButton
            key={pageUrl}
            url={pageUrl}
            className={styles.NavLink}
            displayName={PAGE_URL_TO_NAMES[pageUrl]}
          />
        ))}
      </nav>
    </Toolbar>
  )
}

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

function App() {
  const [width, setWidth] = useState(window.innerWidth)
  const isMobile = width < MOBILE_BREAKPOINT
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <HelmetProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={MaterialTheme}>
          <CookiesProvider>
            <CssBaseline />
            <div className={styles.App}>
              <div className={styles.Content}>
                <Router>
                  <AppBar position="static" elevation={0}>
                    {isMobile ? <MobileAppToolbar /> : <AppToolbar />}
                  </AppBar>
                  <ScrollToTop />
                  <Suspense
                    fallback={
                      <main className={styles.FallbackPage}>
                        <Box mt={10}>
                          <CircularProgress aria-label="loading" />
                        </Box>
                      </main>
                    }
                  >
                    <main>
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
                          <DataCatalogTab />
                        </Route>

                        <Route path={METHODOLOGY_TAB_LINK}>
                          <DataCatalogTab />
                        </Route>

                        <Route path={AGE_ADJUSTMENT_TAB_LINK}>
                          <DataCatalogTab />
                        </Route>

                        <Route path={EXPLORE_DATA_PAGE_LINK}>
                          <ErrorBoundaryDropParams
                            fallback={<ExploreDataFallback />}
                          >
                            <ExploreDataPage isMobile={isMobile} />
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
                          <NewsPage isMobile={isMobile} />
                        </Route>

                        <Route path={SHARE_YOUR_STORY_TAB_LINK}>
                          <NewsPage isMobile={isMobile} />
                        </Route>

                        <Route path={TERMS_OF_USE_PAGE_LINK}>
                          <TermsOfUsePage />
                        </Route>

                        {/* redirect the old URL for possible outside links */}
                        <Route path={`/termsofservice`}>
                          <Redirect to={TERMS_OF_USE_PAGE_LINK} />
                        </Route>

                        <Route path="/">
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

export default App
