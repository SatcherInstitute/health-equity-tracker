import React, { useEffect } from "react";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import {
  clearSearchParams,
  DATASET_PRE_FILTERS,
  useSearchParams,
} from "../../utils/urlutils";

function DataCatalogPage() {
  const params = useSearchParams();
  const datasets = params[DATASET_PRE_FILTERS]
    ? params[DATASET_PRE_FILTERS].split(",")
    : [];
  useEffect(() => {
    clearSearchParams([DATASET_PRE_FILTERS]);
  }, []);
  return (
    <React.Fragment>
      <DatasetExplorer preFilterDatasetIds={datasets} />
    </React.Fragment>
  );
}

export default DataCatalogPage;
