import React, { useEffect } from "react";
import DatasetExplorer from "./dataset_explorer/DatasetExplorer";
import {
  clearSearchParams,
  DATA_SOURCE_PRE_FILTERS,
  useSearchParams,
} from "../../utils/urlutils";

function DataCatalogPage() {
  const params = useSearchParams();
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(",")
    : [];
  useEffect(() => {
    clearSearchParams([DATA_SOURCE_PRE_FILTERS]);
  }, []);
  return (
    <React.Fragment>
      <DatasetExplorer preFilterDataSourceIds={datasets} />
    </React.Fragment>
  );
}

export default DataCatalogPage;
