import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import MethodologyTab from "./MethodologyTab";
import { DATA_SOURCE_PRE_FILTERS, useSearchParams } from "../../utils/urlutils";
import styles from "../AboutUs/AboutUsPage.module.scss";

function DataCatalogTab() {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };

  const params = useSearchParams();
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(",")
    : [];
  return (
    <div className={styles.AboutUsPage}>
      <Tabs
        value={tabIndex}
        tabIndex={tabIndex}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Data Downloads" />
        <Tab label="Methodology" />
      </Tabs>
      {tabIndex === 0 && (
        <React.Fragment>
          <DatasetExplorer preFilterDataSourceIds={datasets} />
        </React.Fragment>
      )}
      {tabIndex === 1 && <MethodologyTab />}
    </div>
  );
}

export default DataCatalogTab;
