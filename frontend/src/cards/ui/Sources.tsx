import React from "react";
import { MapOfDatasetMetadata } from "../../data/utils/DatasetTypes";
import {
  LinkWithStickyParams,
  DATA_SOURCE_PRE_FILTERS,
  DATA_CATALOG_PAGE_LINK,
} from "../../utils/urlutils";
import { DataSourceMetadataMap } from "../../data/config/MetadataMap";
import { MetricQueryResponse } from "../../data/query/MetricQuery";

type DataSourceInfo = {
  name: string;
  updateTimes: string[];
  includesHispanic: boolean;
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
            ? []
            : [metadata[datasetId].update_time],
        includesHispanic:
          DataSourceMetadataMap[dataSourceId]?.includes_hispanic || false,
      };
    } else if (metadata[datasetId].update_time !== "unknown") {
      dataSourceMap[dataSourceId].updateTimes = dataSourceMap[
        dataSourceId
      ].updateTimes.concat(metadata[datasetId].update_time);
    }
  });
  return dataSourceMap;
}

export function Sources(props: {
  queryResponses: MetricQueryResponse[];
  metadata: MapOfDatasetMetadata;
}) {
  const datasetIds = props.queryResponses.reduce(
    (accumulator: string[], response) =>
      accumulator.concat(response.consumedDatasetIds),
    []
  );

  const dataSourceMap = getDataSourceMapFromDatasetIds(
    datasetIds,
    props.metadata
  );

  const responseHasRaceData = props.queryResponses.some((response) => {
    return !response.isFieldMissing("race_and_ethnicity");
  });

  // Assumes that all data sources have the same value for includesHispanic
  // Data sources that don't have the same values should not be displayed together
  const dataSourceIncludesHispanic = Object.values(dataSourceMap).find(
    (dataSourceInfo) => dataSourceInfo.includesHispanic
  );
  const includesHispanicNote = dataSourceIncludesHispanic
    ? "Place holder text indicating that the race categories include hispanic"
    : "Place holder text indicating that the race categories DOES NOT include hispanic";

  return (
    <>
      {Object.keys(dataSourceMap).length > 0 && (
        <>
          Sources:
          {/* TODO- add commas and "and" between the data sources */}
          {Object.keys(dataSourceMap).map((dataSourceId) => (
            <>
              <LinkWithStickyParams
                target="_blank"
                to={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${dataSourceId}`}
              >
                {dataSourceMap[dataSourceId].name}{" "}
              </LinkWithStickyParams>
              {dataSourceMap[dataSourceId].updateTimes.length === 0 ? (
                <>(last update unknown) </>
              ) : (
                <>
                  (updated {dataSourceMap[dataSourceId].updateTimes.join(", ")}){" "}
                </>
              )}
            </>
          ))}
          {responseHasRaceData && (
            <>
              <br />
              <b>Notes</b>: {includesHispanicNote}
            </>
          )}
        </>
      )}
    </>
  );
}
