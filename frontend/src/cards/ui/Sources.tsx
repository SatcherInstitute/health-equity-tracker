import React, { Fragment } from "react";
import { MapOfDatasetMetadata } from "../../data/utils/DatasetTypes";
import {
  LinkWithStickyParams,
  DATA_SOURCE_PRE_FILTERS,
} from "../../utils/urlutils";
import { DATA_CATALOG_PAGE_LINK } from "../../utils/internalRoutes";
import { DataSourceMetadataMap } from "../../data/config/MetadataMap";
import { MetricQueryResponse } from "../../data/query/MetricQuery";

function insertPunctuation(idx: number, numSources: number) {
  let punctuation = "";
  // ADD COMMAS (INCL OXFORDS) FOR THREE OR MORE SOURCES
  if (numSources > 2 && idx < numSources - 1) punctuation += ", ";
  // ADD " AND " BETWEEN LAST TWO SOURCES
  if (numSources > 1 && idx === numSources - 2) punctuation += " and ";
  // ADD FINAL PERIOD
  if (idx === numSources - 1) punctuation += ".";
  return punctuation;
}

type DataSourceInfo = {
  name: string;
  updateTimes: Set<string>;
};

function getDataSourceMapFromDatasetIds(
  datasetIds: string[],
  metadata: MapOfDatasetMetadata
): Record<string, DataSourceInfo> {
  let dataSourceMap: Record<string, DataSourceInfo> = {};
  datasetIds.forEach((datasetId) => {
    const dataSourceId = metadata[datasetId]?.source_id || undefined;

    if (dataSourceId === undefined) {
      return;
    }
    if (!dataSourceMap[dataSourceId]) {
      dataSourceMap[dataSourceId] = {
        name: DataSourceMetadataMap[dataSourceId]?.data_source_name || "",
        updateTimes:
          metadata[datasetId].update_time === "unknown"
            ? new Set()
            : new Set([metadata[datasetId].update_time]),
      };
    } else if (metadata[datasetId].update_time !== "unknown") {
      dataSourceMap[dataSourceId].updateTimes = dataSourceMap[
        dataSourceId
      ].updateTimes.add(metadata[datasetId].update_time);
    }
  });
  return dataSourceMap;
}

export function Sources(props: {
  queryResponses: MetricQueryResponse[];
  metadata: MapOfDatasetMetadata;
  isAgeAdjustedTable?: boolean;
}) {
  // If all data is missing, no need to show sources.
  if (props.queryResponses.every((resp) => resp.dataIsMissing())) {
    return <></>;
  }

  let datasetIds = props.queryResponses.reduce(
    (accumulator: string[], response) =>
      accumulator.concat(response.consumedDatasetIds),
    []
  );

  // for Age Adj only, swap ACS source(s) for Census Pop Estimate
  if (props.isAgeAdjustedTable) {
    datasetIds = datasetIds.filter((datasetId) => !datasetId.includes("acs"));
    datasetIds.push("census_pop_estimates-race_and_ethnicity");
  }

  const dataSourceMap = getDataSourceMapFromDatasetIds(
    datasetIds,
    props.metadata
  );

  return (
    <>
      {Object.keys(dataSourceMap).length > 0 && <>Sources: </>}
      {Object.keys(dataSourceMap).map((dataSourceId, idx) => (
        <Fragment key={dataSourceId}>
          <LinkWithStickyParams
            target="_blank"
            to={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${dataSourceId}`}
          >
            {dataSourceMap[dataSourceId].name}
          </LinkWithStickyParams>{" "}
          {dataSourceMap[dataSourceId].updateTimes.size === 0 ? (
            <>(last update unknown) </>
          ) : (
            <>
              (updated{" "}
              {Array.from(dataSourceMap[dataSourceId].updateTimes).join(", ")})
            </>
          )}
          {insertPunctuation(idx, Object.keys(dataSourceMap).length)}
        </Fragment>
      ))}
    </>
  );
}
