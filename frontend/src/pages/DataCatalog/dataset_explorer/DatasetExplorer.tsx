import React, { useState } from "react";
import {
  MultiSelectDatasetFilter,
  SingleSelectDatasetFilter,
} from "./DatasetFilter";
import DatasetListing from "./DatasetListing";
import styles from "./DatasetExplorer.module.scss";
import { DatasetMetadata, MetadataMap } from "../../../data/utils/DatasetTypes";
import Button from "@material-ui/core/Button";
import { DATA_CATALOG_PAGE_LINK } from "../../../utils/urlutils";
import { WithMetadata } from "../../../data/react/WithLoadingOrErrorUI";
import useOnMetadataLoaded from "../../../data/react/useOnMetadataLoaded";

// Map of filter id to list of datasets selected by that filter, or empty list
// for filters that don't have anything selected.
type Filters = Record<string, string[]>;

// The id of the filter by dataset name. This is the only one that supports
// pre-filtering from url params.
const NAME_FILTER_ID = "name_filter";

/**
 * Returns the ids of the datasets to display based on the provided filter. The
 * displayed datasets are the intersection of each filter.
 */
function getFilteredDatasetIds(
  metadata: MetadataMap,
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

function DatasetExplorer(props: { preFilterDatasetIds: string[] }) {
  const [activeFilter, setActiveFilter] = useState<Filters>({
    [NAME_FILTER_ID]: props.preFilterDatasetIds,
  });

  // Once the metadata is loaded, update the filter to only include valid
  // dataset ids
  useOnMetadataLoaded((metadata) => {
    const validIds = props.preFilterDatasetIds.filter(
      (datasetId) => !!metadata[datasetId]
    );
    setActiveFilter((prevFilter) => {
      const names = prevFilter[NAME_FILTER_ID];
      const newNames = names.filter((name) => validIds.includes(name));
      return {
        ...prevFilter,
        [NAME_FILTER_ID]: newNames,
      };
    });
  });

  function createFilter(
    metadata: MetadataMap,
    id: string,
    propertySelector: (metadata: DatasetMetadata) => string,
    placeholder: string,
    allOption: string
  ) {
    return (
      <div className={styles.Filter}>
        <SingleSelectDatasetFilter
          datasets={metadata}
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
          {(metadata) => {
            const viewingSubsetOfDatasets =
              getFilteredDatasetIds(metadata, activeFilter).length === 1;

            const defaultDatasetNames = props.preFilterDatasetIds
              .filter((datasetId) => !!metadata[datasetId])
              .map((datasetId) => metadata[datasetId].name);

            return (
              <>
                {!viewingSubsetOfDatasets && (
                  <>
                    <div className={styles.FilterContainer}>
                      <div className={styles.Filter}>
                        <MultiSelectDatasetFilter
                          datasets={metadata}
                          onSelectionChange={(filtered) => {
                            setActiveFilter({
                              ...activeFilter,
                              [NAME_FILTER_ID]: filtered,
                            });
                          }}
                          propertySelector={(metadata) => metadata.name}
                          placeholder={"Search variables..."}
                          defaultValues={defaultDatasetNames}
                        />
                      </div>
                    </div>
                    <div className={styles.FilterContainer}>
                      <div className={styles.FilterTitle}>Filter by...</div>
                      {createFilter(
                        metadata,
                        "geographic_filter",
                        (metadata) => metadata.geographic_level,
                        "geographic level...",
                        "All"
                      )}
                      {createFilter(
                        metadata,
                        "demographic_filter",
                        (metadata) => metadata.demographic_granularity,
                        "demographic level...",
                        "All"
                      )}
                    </div>
                  </>
                )}
                {getFilteredDatasetIds(metadata, activeFilter).map(
                  (datasetId, index) => (
                    <div className={styles.Dataset} key={index}>
                      <div className={styles.DatasetListItem}>
                        <DatasetListing dataset={metadata[datasetId]} />
                      </div>
                    </div>
                  )
                )}
                {/* TODO clear filters instead of reloading the page. */}
                {viewingSubsetOfDatasets && (
                  <Button
                    href={DATA_CATALOG_PAGE_LINK}
                    color="primary"
                    variant="contained"
                  >
                    View All datasets
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
