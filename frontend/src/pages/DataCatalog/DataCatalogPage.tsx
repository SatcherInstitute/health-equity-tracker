import React, { useState } from "react";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import { DATASET_PRE_FILTERS, useSearchParams } from "../../utils/urlutils";
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
            It is essential that all products - including this website - are
            developed and served equitably and ethically. Garnering public trust
            is a key principle of our work. In addition, we curated the
            following questions to help develop this tool and for future
            reference.
          </p>
          <b>Guiding questions:</b>
          <ul>
            <li>Is it easy to access and input data?</li>
            <li>Is communication between stakeholders transparent?</li>
            <li>
              Is the data correct and recent enough to reflect current lived
              experiences?
            </li>
            <li>
              Is the community a part of the ownership and authorship of this
              work?
            </li>
            <li>
              Have we created a tool that has real value for all stakeholders
              including the communities?{" "}
            </li>
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
              To protect the privacy of affected individuals, COVID-19 data may
              be hidden in counties with smaller numbers of COVID-19 cases,
              hospitalizations and deaths.
            </li>
            <li>
              Racial and ethnic categories are often at the discretion of
              healthcare professionals and may not be accurate.
            </li>
            <li>
              Specific racial and ethnic categories (e.g. “Native Hawaiian,”
              “Alaska Native”) differ by source and can be inappropriately
              obscured by broader categories (e.g. “Other,” “Asian”).
            </li>
            <li>
              National statistics are aggregations of state-wide data. If state
              data is not available, these aggregations may be incomplete and
              potentially skewed.
            </li>
            <li>
              We typically refresh our data sources with newly available data
              within a few days. Seeking the latest information? Please navigate
              to the data sources directly.
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
