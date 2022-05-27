import React from "react";
import DataSourceListing from "./DataSourceListing";
import styles from "./DatasetExplorer.module.scss";
import { DataSourceMetadataMap } from "../../../data/config/MetadataMap";
import { DataSourceMetadata } from "../../../data/utils/DatasetTypes";
import Button from "@material-ui/core/Button";
import {
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
} from "../../../utils/urlutils";
import { WithMetadata } from "../../../data/react/WithLoadingOrErrorUI";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Map of filter id to list of datasets selected by that filter, or empty list
// for filters that don't have anything selected.
type Filters = Record<string, string[]>;

// The id of the filter by dataset name. This is the only one that supports
// pre-filtering from url params.
const NAME_FILTER_ID = "name_filter";

/**
 * Returns the ids of the sources to display based on the provided filter. The
 * displayed sources are the intersection of each filter.
 */
function getFilteredSources(
  metadata: Record<string, DataSourceMetadata>,
  activeFilter: Filters
): string[] {
  const filters = Object.values(activeFilter);
  const reducer = (intersection: string[], nextFilter: string[]) => {
    if (nextFilter.length === 0) {
      return intersection;
    }
    return intersection.filter((x) => nextFilter.includes(x));
  };
  const allIds = Object.keys(metadata);
  return filters.reduce(reducer, allIds);
}

function DatasetExplorer(props: { preFilterDataSourceIds: string[] }) {
  const activeFilter = {
    [NAME_FILTER_ID]: props.preFilterDataSourceIds,
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Data Downloads - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Data Downloads</h2>
      <Grid container className={styles.DatasetExplorer}>
        <div className={styles.DatasetHeader}>
          <Typography
            id="main"
            className={styles.DataDownloadsHeaderText}
            variant="h3"
          >
            View and download Health Equity Tracker data sources
          </Typography>
          <p className={styles.DataDownloadsHeaderSubtext}>
            Here you can access and download the data sources that are displayed
            in the charts on the Health Equity Tracker. Want to explore what
            each data set can show us about different health outcomes?{" "}
            <a
              href={EXPLORE_DATA_PAGE_LINK}
              className={styles.DataDownloadsExploreLink}
            >
              Explore the data dashboard
            </a>
            <span aria-hidden={true}>.</span>
          </p>
        </div>
        <ul className={styles.DatasetList}>
          <WithMetadata>
            {(datasetMetadata) => {
              const filteredDatasets = getFilteredSources(
                DataSourceMetadataMap,
                activeFilter
              );
              // Check if more than the default filters are enabled to see if you're viewing
              // a subset of sources
              const viewingSubsetOfSources =
                Object.keys(activeFilter).length > 1 ||
                activeFilter[NAME_FILTER_ID].length > 0;

              return (
                <>
                  {filteredDatasets.map((source_id, index) => (
                    <li className={styles.DatasetListItem} key={index}>
                      <DataSourceListing
                        key={DataSourceMetadataMap[source_id].id}
                        source_metadata={DataSourceMetadataMap[source_id]}
                        dataset_metadata={datasetMetadata}
                      />
                    </li>
                  ))}
                  {viewingSubsetOfSources && (
                    <Box mt={5}>
                      <Button
                        href={DATA_CATALOG_PAGE_LINK}
                        color="primary"
                        variant="contained"
                      >
                        View All Datasets
                      </Button>
                    </Box>
                  )}
                </>
              );
            }}
          </WithMetadata>
        </ul>
      </Grid>
    </HelmetProvider>
  );
}

export default DatasetExplorer;
