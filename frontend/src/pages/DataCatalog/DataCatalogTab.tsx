import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import MethodologyTab from "./MethodologyTab";
import {
  DATA_CATALOG_PAGE_LINK,
  DATA_SOURCE_PRE_FILTERS,
  useSearchParams,
  METHODOLOGY_TAB_LINK,
} from "../../utils/urlutils";
import styles from "../AboutUs/AboutUsPage.module.scss";
import { Link, Route, Switch } from "react-router-dom";

function DataCatalogTab() {
  const params = useSearchParams();
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(",")
    : [];
  return (
    <div className={styles.AboutUsPage}>
      <Route
        path="/"
        render={(history) => (
          <Tabs
            centered
            indicatorColor="primary"
            textColor="primary"
            value={history.location.pathname}
          >
            <Tab
              value={DATA_CATALOG_PAGE_LINK}
              label="Data Downloads"
              component={Link}
              to={DATA_CATALOG_PAGE_LINK}
            />
            <Tab
              value={`${METHODOLOGY_TAB_LINK}`}
              label="Methodology"
              component={Link}
              to={`${METHODOLOGY_TAB_LINK}`}
            />
          </Tabs>
        )}
      />

      <Switch>
        <Route path={`${METHODOLOGY_TAB_LINK}/`}>
          <MethodologyTab />
        </Route>
        <Route path={`${DATA_CATALOG_PAGE_LINK}/`}>
          <DatasetExplorer preFilterDataSourceIds={datasets} />
        </Route>
      </Switch>
    </div>
  );
}

export default DataCatalogTab;
