import React, { useState } from "react";
import {
  MultiSelectDatasetFilter,
  SingleSelectDatasetFilter,
} from "./DatasetFilter";
import DataSourceListing from "./DataSourceListing";
import styles from "./DatasetExplorer.module.scss";
import { DataSourceMetadataMap } from "../../../data/config/MetadataMap";
import { DataSourceMetadata } from "../../../data/utils/DatasetTypes";
import Button from "@material-ui/core/Button";
import { DATA_CATALOG_PAGE_LINK } from "../../../utils/urlutils";
import { WithMetadata } from "../../../data/react/WithLoadingOrErrorUI";

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
  const [activeFilter, setActiveFilter] = useState<Filters>({
    [NAME_FILTER_ID]: props.preFilterDataSourceIds,
  });

  function createFilter(
    metadata: Record<string, DataSourceMetadata>,
    id: string,
    propertySelector: (metadata: DataSourceMetadata) => string,
    placeholder: string,
    allOption: string
  ) {
    return (
      <div className={styles.Filter}>
        <SingleSelectDatasetFilter
          dataSources={metadata}
          onSelectionChange={(filtered) => {
            setActiveFilter({
              ...activeFilter,
              [id]: filtered,
            });
          }}
          propertySelector={propertySelector}
          placeholder={placeholder}
          allOption={allOption}
        />
      </div>
    );
  }

  return (
    <div className={styles.DatasetExplorer}>
      <div className={styles.DatasetList}>
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

            const defaultDataSourceNames = props.preFilterDataSourceIds
              .filter((datasetId) => !!datasetMetadata[datasetId])
              .map((datasetId) => datasetMetadata[datasetId].name);

            return (
              <>
                {!viewingSubsetOfSources && (
                  <>
                    <div className={styles.FilterContainer}>
                      <div className={styles.Filter}>
                        <MultiSelectDatasetFilter
                          dataSources={DataSourceMetadataMap}
                          onSelectionChange={(filtered) => {
                            setActiveFilter({
                              ...activeFilter,
                              [NAME_FILTER_ID]: filtered,
                            });
                          }}
                          propertySelector={(metadata) =>
                            metadata.data_source_name
                          }
                          placeholder={"Search variables..."}
                          defaultValues={defaultDataSourceNames}
                        />
                      </div>
                    </div>
                    <div className={styles.FilterContainer}>
                      <div className={styles.FilterTitle}>Filter by...</div>
                      {createFilter(
                        DataSourceMetadataMap,
                        "geographic_filter",
                        (metadata) => metadata.geographic_level,
                        "geographic level...",
                        "All"
                      )}
                      {createFilter(
                        DataSourceMetadataMap,
                        "demographic_filter",
                        (metadata) => metadata.demographic_granularity,
                        "demographic level...",
                        "All"
                      )}
                    </div>
                  </>
                )}
                {filteredDatasets.map((source_id, index) => (
                  <div className={styles.Dataset} key={index}>
                    <div className={styles.DatasetListItem}>
                      <DataSourceListing
                        key={DataSourceMetadataMap[source_id].id}
                        source_metadata={DataSourceMetadataMap[source_id]}
                        dataset_metadata={datasetMetadata}
                      />
                    </div>
                  </div>
                ))}
                {/* TODO clear filters instead of reloading the page. */}
                {viewingSubsetOfSources && (
                  <Button
                    href={DATA_CATALOG_PAGE_LINK}
                    color="primary"
                    variant="contained"
                  >
                    View All Datasets
                  </Button>
                )}
              </>
            );
          }}
        </WithMetadata>
      </div>
    </div>
  );
}

export default DatasetExplorer;
