import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import MethodologyTab from "./MethodologyTab";
import { DATA_SOURCE_PRE_FILTERS, useSearchParams } from "../../utils/urlutils";
import {
  DATA_CATALOG_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
  AGE_ADJUSTMENT_TAB_LINK,
} from "../../utils/internalRoutes";
import styles from "../AboutUs/AboutUsPage.module.scss";
import { Link, Route, Switch } from "react-router-dom";
import FeedbackBox from "../ui/FeedbackBox";
import AgeAdjustmentTab from "./AgeAdjustmentTab";
import TestingMethodologyTab from "./TestingMethodology";

function DataCatalogTab() {
  const params = useSearchParams();
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(",")
    : [];
  return (
    <div className={styles.AboutUsPage}>
      <Route path="/">
        <Tabs
          centered
          indicatorColor="primary"
          textColor="primary"
          value={window.location.pathname}
        >
          <Tab
            value={DATA_CATALOG_PAGE_LINK}
            label="Data Downloads"
            component={Link}
            to={DATA_CATALOG_PAGE_LINK}
          />
          <Tab
            value={METHODOLOGY_TAB_LINK}
            label="Methodology"
            component={Link}
            to={METHODOLOGY_TAB_LINK}
          />
          <Tab
            value={AGE_ADJUSTMENT_TAB_LINK}
            label="Age-Adjustment"
            component={Link}
            to={AGE_ADJUSTMENT_TAB_LINK}
          />
          <Tab
            value={AGE_ADJUSTMENT_TAB_LINK}
            label="Testing"
            component={Link}
            to={AGE_ADJUSTMENT_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${METHODOLOGY_TAB_LINK}/`}>
          <MethodologyTab />
        </Route>
        <Route path={`${DATA_CATALOG_PAGE_LINK}/`}>
          <DatasetExplorer preFilterDataSourceIds={datasets} />
        </Route>
        {/* <Route path={`${AGE_ADJUSTMENT_TAB_LINK}/`}>
          <AgeAdjustmentTab />
        </Route> */}
        <Route path={`${AGE_ADJUSTMENT_TAB_LINK}/`}>
          <TestingMethodologyTab />
        </Route>
      </Switch>
      <FeedbackBox />
    </div>
  );
}

export default DataCatalogTab;
