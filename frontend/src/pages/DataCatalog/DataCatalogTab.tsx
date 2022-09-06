import React from "react";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import MethodologyTab from "./MethodologyTab";
import { DATA_SOURCE_PRE_FILTERS, useSearchParams } from "../../utils/urlutils";
import {
  DATA_CATALOG_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
  AGE_ADJUSTMENT_TAB_LINK,
} from "../../utils/internalRoutes";
import styles from "../AboutUs/AboutUsPage.module.scss";
import { Route, Switch } from "react-router-dom";
import FeedbackBox from "../ui/FeedbackBox";
import AgeAdjustmentTab from "./AgeAdjustmentTab";
import MethodologyBanner from "./MethodologyBanner";

function DataCatalogTab() {
  const params = useSearchParams();
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(",")
    : [];
  return (
    <div className={styles.AboutUsPage}>
      <MethodologyBanner />

      <Switch>
        <Route path={`${METHODOLOGY_TAB_LINK}/`}>
          <MethodologyTab />
        </Route>
        <Route path={`${DATA_CATALOG_PAGE_LINK}/`}>
          <DatasetExplorer preFilterDataSourceIds={datasets} />
        </Route>
        <Route path={`${AGE_ADJUSTMENT_TAB_LINK}/`}>
          <AgeAdjustmentTab />
        </Route>
      </Switch>
      <FeedbackBox />
    </div>
  );
}

export default DataCatalogTab;
