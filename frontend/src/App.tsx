import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";
import { ThemeProvider } from "@material-ui/styles";
import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import ReactTooltip from "react-tooltip";
import styles from "./App.module.scss";
import MaterialTheme from "./styles/MaterialTheme";
import { autoInitGlobals } from "./utils/globals";
import {
  ABOUT_US_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  LinkWithStickyParams,
  ReactRouterLinkButton,
  TERMS_OF_SERVICE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "./utils/urlutils";

// the following components make CSS modules which are imported by other components, so they must load first
import AboutUsPage from "./pages/AboutUs/AboutUsPage";
import WhatIsHealthEquityPage from "./pages/WhatIsHealthEquity/WhatIsHealthEquityPage";

const ExploreDataPage = React.lazy(
  () => import("./pages/ExploreData/ExploreDataPage")
);
const Footer = React.lazy(() => import("./Footer"));

const LandingPage = React.lazy(() => import("./pages/Landing/LandingPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const TermsOfServicePage = React.lazy(
  () => import("./pages/TermsOfServicePage/TermsOfServicePage")
);

const DataCatalogTab = React.lazy(
  () => import("./pages/DataCatalog/DataCatalogTab")
);

const MOBILE_BREAKPOINT = 600;

const PAGE_URL_TO_NAMES: Record<string, string> = {
  "/": "Homepage",
  [WHAT_IS_HEALTH_EQUITY_PAGE_LINK]: "What is Health Equity?",
  [EXPLORE_DATA_PAGE_LINK]: "Explore the Data",
  [DATA_CATALOG_PAGE_LINK]: "Downloads & Methodology",
  [ABOUT_US_PAGE_LINK]: "About Us",
};

autoInitGlobals();

function MobileAppToolbar() {
  const [open, setOpen] = useState(false);

  function ListItemLink(props: any) {
    return <ListItem button component="a" {...props} />;
  }

  return (
    <Toolbar>
      <IconButton
        onClick={() => setOpen(true)}
        aria-label="Expand site navigation"
      >
        <MenuIcon className={styles.MenuIconForMobile} />
      </IconButton>
      <Drawer variant="persistent" anchor="left" open={open}>
        <Button
          aria-label="Collapse site navigation"
          onClick={() => setOpen(false)}
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
  );
}

function AppToolbar() {
  return (
    <Toolbar className={styles.AppToolbar}>
      <ReactRouterLinkButton url="/" className={styles.AppbarLogoImg}>
        <img
          src="img/appbar/AppbarLogo.png"
          className={styles.AppbarLogoImg}
          alt="Health Equity Tracker logo"
          role="link"
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
  );
}

// TODO - this could be pulled into a hook
// https://reactrouter.com/web/api/Hooks/uselocation
// https://github.com/ReactTraining/react-router/issues/7015
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ThemeProvider theme={MaterialTheme}>
      <CookiesProvider>
        <ReactTooltip />
        <CssBaseline />
        <div className={styles.App}>
          <div className={styles.Content}>
            <Router>
              <Suspense fallback={<i></i>}>
                <a className={styles.SkipMainLink} href="#main">
                  Skip to main content
                </a>
                <ScrollToTop />
                <AppBar position="static" elevation={0}>
                  {width > MOBILE_BREAKPOINT ? (
                    <AppToolbar />
                  ) : (
                    <MobileAppToolbar />
                  )}
                </AppBar>
                <main>
                  <Switch>
                    <Route
                      path={ABOUT_US_PAGE_LINK}
                      render={() => <AboutUsPage />}
                    />

                    <Route
                      path={DATA_CATALOG_PAGE_LINK}
                      render={() => <DataCatalogTab />}
                    />

                    <Route
                      path={EXPLORE_DATA_PAGE_LINK}
                      render={() => <ExploreDataPage />}
                    />

                    <Route
                      path={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
                      render={() => <WhatIsHealthEquityPage />}
                    />

                    <Route
                      path={TERMS_OF_SERVICE_PAGE_LINK}
                      render={() => <TermsOfServicePage />}
                    />

                    <Route exact path="/" render={() => <LandingPage />} />
                    {/* CATCH ALL OTHER ROUTES AND SERVE NOT FOUND PAGE */}
                    <Route render={() => <NotFoundPage />} />
                  </Switch>
                </main>
              </Suspense>{" "}
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
  );
}

export default App;
