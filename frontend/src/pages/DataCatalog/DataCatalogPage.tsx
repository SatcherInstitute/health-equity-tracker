import React, { useEffect, useState } from "react";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import {
  clearSearchParams,
  DATASET_PRE_FILTERS,
  useSearchParams,
} from "../../utils/urlutils";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Alert from "@material-ui/lab/Alert";
import styles from "./DataCatalogPage.module.scss";

function DataCatalogPage() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const params = useSearchParams();
  const datasets = params[DATASET_PRE_FILTERS]
    ? params[DATASET_PRE_FILTERS].split(",")
    : [];
  useEffect(() => {
    clearSearchParams([DATASET_PRE_FILTERS]);
  }, []);
  return (
    <div className={styles.DataCatalogPage}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        style={{ marginTop: "40px" }}
      >
        <Tab label="Downloads" />
        <Tab label="Methodology" />
      </Tabs>
      {value === 0 && (
        <>
          <div style={{ width: "600px", margin: "auto" }}>
            <h1>View and download Health Equity Tracker data sources</h1>
          </div>
          <p>
            Here you can access and download the data sources that are displayed
            in the charts on the Health Equity Tracker. Want to explore what
            each data set can show us about different health outcomes?{" "}
            <a href="/ExploreData">Go Explore Now</a>
          </p>
          <DatasetExplorer preFilterDatasetIds={datasets} />
        </>
      )}
      {value === 1 && (
        <div style={{ width: "600px", textAlign: "left" }}>
          <h3>What principles guide you?</h3>
          <p>
            It is essential that this work and all the products, as a result of
            it are done consistently in an ethical manner. One of the core
            values of the Health Equity Task Force charged with developing the
            Health Equity Tracker, is the importance of working in a way that
            garners public trust. Here are some of the principles that the EPTC
            is working to make sure are in place. We created these standards for
            the work now and moving forward.
          </p>
          <b>Guiding questions:</b>
          <ul>
            <li>Do we have open access and input in place?</li>
            <li>Is there transparency among stakeholders?</li>
            <li>
              Are we using valid and current data that is reflective of the
              realities?
            </li>
            <li>
              Is the community a part of the ownership and authorship of this
              work?
            </li>
            <li>
              Have we created a tool that has real value for all stakeholders
              including the communities?
            </li>
            <li>Are we holding our partners accountable?</li>
          </ul>
          <h3>What are the limitations of the data?</h3>
          <p>
            Unfortunately, with these publically available data sets, there are
            crucial pieces missing, including but not limited to: comprehensive
            city-, census tract-, and county-level data; comprehensive race and
            ethnicity breakdowns; comprehensive gender and age breakdowns by
            county, etc.
          </p>
          <b>Known limitations in the data</b>
          <ul>
            <li>
              Data may be hidden in counties with smaller numbers of COVID-19
              cases, hospitalizations and deaths in order to protect the privacy
              of affected individuals.
            </li>
            <li>
              Racial and ethnic categorization is often at the discretion of
              healthcare professionals and may not be accurate.
            </li>
            <li>
              Racial and ethnic categories differ by source and can obscure
              severe inequity by inappropriately aggregating different
              communities with distinct experiences into a single overly large
              category (e.g. “Other,” “Asian”).
            </li>
            <li>
              US-wide statistics are aggregations of state-wide data. Where data
              has been withheld to protect privacy, and where data is missing
              (such as in states that do not report race/ethnicity breakdowns of
              COVID-19 statistics), US-wide aggregations may be incomplete and
              potentially skewed, if excluded populations differ significantly
              from the country as a whole.
            </li>
            <li>
              While we attempt to update our data sources with newly available
              data within a short time frame (typically a few days), please
              navigate to our data sources directly if you are seeking the
              newest data as soon as it is made available.
            </li>
          </ul>
          <h3>What data are we missing? </h3>
          <p>
            Our tracker is iterating and expanding to include additional health
            variables, social and political determinants of health, and
            increasing coverage at the state, county, and census-tract levels
          </p>

          <Alert severity="warning">
            Do you have information on health outcomes at the state and local
            level? <a href="/">We would love to hear from you</a>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default DataCatalogPage;
