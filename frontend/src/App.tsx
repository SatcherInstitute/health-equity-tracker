import React, { useState, useEffect } from "react";
import styles from "./App.module.scss";
import MaterialTheme from "./styles/MaterialTheme";
import { AboutUsPage } from "./pages/AboutUs/AboutUsPage";
import DataCatalogTab from "./pages/DataCatalog/DataCatalogTab";
import ExploreDataPage from "./pages/ExploreData/ExploreDataPage";
import LandingPage from "./pages/Landing/LandingPage";
import WhatIsHealthEquityPage from "./pages/WhatIsHealthEquity/WhatIsHealthEquityPage";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./Footer";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { ThemeProvider } from "@material-ui/styles";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from "react-router-dom";
import {
  LinkWithStickyParams,
  EXPLORE_DATA_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  ABOUT_US_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  TERMS_OF_SERVICE_PAGE_LINK,
} from "./utils/urlutils";
import { autoInitGlobals, getEnvironment } from "./utils/globals";
import ReactTooltip from "react-tooltip";
import CssBaseline from "@material-ui/core/CssBaseline";
import PreLaunchSiteContent from "./pages/Landing/PreLaunchSiteContent";
import TermsOfServicePage from "./pages/TermsOfServicePage/TermsOfServicePage";

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
      <IconButton onClick={() => setOpen(true)}
                  aria-label="Expand site navigation">
        <MenuIcon className={styles.MenuIconForMobile} />
      </IconButton>
      <Drawer variant="persistent" anchor="left" open={open}>
        <Button aria-label="Collapse site navigation"
          onClick={() => setOpen(false)}>
          <ChevronLeftIcon />
        </Button>
        <List>
          {Object.keys(PAGE_URL_TO_NAMES).map((pageUrl, index) => (
            <ListItemLink href={pageUrl} key={index}>
              <ListItemText primary={PAGE_URL_TO_NAMES[pageUrl]} />
            </ListItemLink>
          ))}
        </List>
      </Drawer>
    </Toolbar>
  );
}

function AppToolbar() {
  return (
      <Toolbar className={styles.AppToolbar}>
        <LinkWithStickyParams to="/">
          <img src="img/AppbarLogo.png"
               className={styles.AppbarLogoImg}
               alt=""/>
        </LinkWithStickyParams>
        <Typography variant="h1" className={styles.HomeLogo}>
          <LinkWithStickyParams to="/">
            Health Equity Tracker
          </LinkWithStickyParams>
        </Typography>
        {[
        WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
        EXPLORE_DATA_PAGE_LINK,
        DATA_CATALOG_PAGE_LINK,
        ABOUT_US_PAGE_LINK,
        ].map((pageUrl, i) => (
            <LinkWithStickyParams to={pageUrl} class={styles.NavLink}>
                {PAGE_URL_TO_NAMES[pageUrl]}
            </LinkWithStickyParams>
        ))}
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
      <div className={styles.App}>
        <div className={styles.Content}>
          <Router>
            <a className={styles.SkipMainLink} href="#main">Skip to main content</a>
            <ScrollToTop />
            <header>
              <AppBar position="static" elevation={0}>
                {width > MOBILE_BREAKPOINT ? (
                    <AppToolbar />
                ) : (
                    <MobileAppToolbar />
                )}
              </AppBar>
            </header>
            <main>
              <Switch>
                <Route path={ABOUT_US_PAGE_LINK} component={AboutUsPage} />
                <Route path={DATA_CATALOG_PAGE_LINK} component={DataCatalogTab} />
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
          </Router>
        </div>
        <footer>
          <Footer />
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
