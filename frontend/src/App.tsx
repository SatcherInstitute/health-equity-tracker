import React, { useState, useEffect } from "react";
import styles from "./App.module.scss";
import MaterialTheme from "./styles/MaterialTheme";
import AboutUsPage from "./pages/AboutUs/AboutUsPage";
import DataCatalogPage from "./pages/DataCatalog/DataCatalogPage";
import ExploreDataPage from "./pages/ExploreData/ExploreDataPage";
import LandingPage from "./pages/Landing/LandingPage";
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
  useDatasetStoreProvider,
  DatasetProvider,
  startMetadataLoad,
} from "./data/useDatasetStore";
import {
  LinkWithStickyParams,
  EXPLORE_DATA_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  ABOUT_US_PAGE_LINK,
} from "./utils/urlutils";
import { autoInitGlobals } from "./utils/globals";
import ReactTooltip from "react-tooltip";
import CssBaseline from "@material-ui/core/CssBaseline";

const MOBILE_BREAKPOINT = 600;

const PAGE_URL_TO_NAMES: Record<string, string> = {
  "/": "Homepage",
  [ABOUT_US_PAGE_LINK]: "About Us",
  [DATA_CATALOG_PAGE_LINK]: "Data Sources & Methodology",
  [EXPLORE_DATA_PAGE_LINK]: "Explore the Data",
};

autoInitGlobals();
startMetadataLoad();

function MobileAppToolbar() {
  const [open, setOpen] = useState(false);

  function ListItemLink(props: any) {
    return <ListItem button component="a" {...props} />;
  }

  return (
    <Toolbar>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer variant="persistent" anchor="left" open={open}>
        <Button onClick={() => setOpen(false)}>
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
    <Toolbar>
      <Typography variant="h6" className={styles.HomeLogo}>
        <LinkWithStickyParams to="/">
          Health Equity Tracker
        </LinkWithStickyParams>
      </Typography>
      {[EXPLORE_DATA_PAGE_LINK, DATA_CATALOG_PAGE_LINK, ABOUT_US_PAGE_LINK].map(
        (pageUrl, i) => (
          <Button className={styles.NavButton} key={i}>
            <LinkWithStickyParams to={pageUrl}>
              {PAGE_URL_TO_NAMES[pageUrl]}
            </LinkWithStickyParams>
          </Button>
        )
      )}
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

  const datasetStore = useDatasetStoreProvider();

  return (
    <ThemeProvider theme={MaterialTheme}>
      <ReactTooltip />
      <CssBaseline />
      <DatasetProvider value={datasetStore}>
        <div className={styles.App}>
          <div className={styles.Content}>
            <Router>
              <ScrollToTop />
              <AppBar position="static">
                {width > MOBILE_BREAKPOINT ? (
                  <AppToolbar />
                ) : (
                  <MobileAppToolbar />
                )}
              </AppBar>
              <Switch>
                <Route path={ABOUT_US_PAGE_LINK} component={AboutUsPage} />
                <Route
                  path={DATA_CATALOG_PAGE_LINK}
                  component={DataCatalogPage}
                />
                <Route
                  path={EXPLORE_DATA_PAGE_LINK}
                  component={ExploreDataPage}
                />
                <Route exact path="/" component={LandingPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </Router>
          </div>
          <Footer />
        </div>
      </DatasetProvider>
    </ThemeProvider>
  );
}

export default App;
