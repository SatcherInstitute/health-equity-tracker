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
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import ReactTooltip from "react-tooltip";
import styles from "./App.module.scss";
import Footer from "./Footer";
import { AboutUsPage } from "./pages/AboutUs/AboutUsPage";
import DataCatalogTab from "./pages/DataCatalog/DataCatalogTab";
import ExploreDataPage from "./pages/ExploreData/ExploreDataPage";
import LandingPage from "./pages/Landing/LandingPage";
import PreLaunchSiteContent from "./pages/Landing/PreLaunchSiteContent";
import NotFoundPage from "./pages/NotFoundPage";
import TermsOfServicePage from "./pages/TermsOfServicePage/TermsOfServicePage";
import { WhatIsHealthEquityPage } from "./pages/WhatIsHealthEquity/WhatIsHealthEquityPage";
import MaterialTheme from "./styles/MaterialTheme";
import { autoInitGlobals, getEnvironment } from "./utils/globals";
import {
  ABOUT_US_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  LinkWithStickyParams,
  ReactRouterLinkButton,
  TERMS_OF_SERVICE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "./utils/urlutils";

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
        <img src="img/AppbarLogo.png" className={styles.AppbarLogoImg} alt="" />
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
        ].map((pageUrl, i) => (
          <ReactRouterLinkButton
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

  if (!getEnvironment().enableFullSiteContent()) {
    return <PreLaunchSiteContent />;
  }

  return (
    <ThemeProvider theme={MaterialTheme}>
      <ReactTooltip />
      <CssBaseline />
      <Router>
        <div className={styles.App}>
          <div className={styles.Content}>
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
                <Route path={ABOUT_US_PAGE_LINK} component={AboutUsPage} />
                <Route
                  path={DATA_CATALOG_PAGE_LINK}
                  component={DataCatalogTab}
                />
                <Route
                  path={EXPLORE_DATA_PAGE_LINK}
                  component={ExploreDataPage}
                />
                <Route
                  path={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
                  component={WhatIsHealthEquityPage}
                />
                <Route
                  path={TERMS_OF_SERVICE_PAGE_LINK}
                  component={TermsOfServicePage}
                />
                <Route exact path="/" component={LandingPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </main>
          </div>
          <footer>
            <Footer />
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
