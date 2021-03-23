import React from "react";
import Card from "@material-ui/core/Card";
import styles from "./Card.module.scss";
import Button from "@material-ui/core/Button";
import {
  LinkWithStickyParams,
  DATA_SOURCE_PRE_FILTERS,
  DATA_CATALOG_PAGE_LINK,
} from "../utils/urlutils";
import { CardContent } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";
import { usePopover } from "../utils/usePopover";
import { DataSourceMetadataMap } from "../data/config/MetadataMap";
import { MapOfDatasetMetadata } from "../data/utils/DatasetTypes";
import { MetricQuery, MetricQueryResponse } from "../data/query/MetricQuery";
import { WithMetadataAndMetrics } from "../data/react/WithLoadingOrErrorUI";

type DataSourceInfo = {
  name: string;
  updateTimes: string[];
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
      };
    } else if (metadata[datasetId].update_time !== "unknown") {
      dataSourceMap[dataSourceId].updateTimes = dataSourceMap[
        dataSourceId
      ].updateTimes.concat(metadata[datasetId].update_time);
    }
  });
  return dataSourceMap;
}

function CardWrapper(props: {
  title?: JSX.Element;
  infoPopover?: JSX.Element;
  hideFooter?: boolean;
  queries?: MetricQuery[];
  children: (queryResponses: MetricQueryResponse[]) => JSX.Element;
}) {
  const popover = usePopover();
  const queries = props.queries ? props.queries : [];

  const optionalTitle = props.title ? (
    <>
      <CardContent>
        <Typography className={styles.CardHeader}>
          {props.title}
          {props.infoPopover && (
            <Button onClick={popover.open} className={styles.InfoIconButton}>
              <InfoIcon color="primary" />
            </Button>
          )}
        </Typography>
        <Popover
          open={popover.isOpen}
          anchorEl={popover.anchor}
          onClose={popover.close}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <div className={styles.CardInfoPopover}>{props.infoPopover}</div>
        </Popover>
      </CardContent>
      <Divider />
    </>
  ) : null;

  const loadingComponent = (
    <Card raised={true} className={styles.ChartCard}>
      {optionalTitle}
      <CardContent>
        <CircularProgress />
      </CardContent>
    </Card>
  );

  return (
    <WithMetadataAndMetrics
      queries={queries}
      loadingComponent={loadingComponent}
    >
      {(metadata, queryResponses) => {
        const allConsumedDatasetIds = queryResponses.reduce(
          (accumulator: string[], response) =>
            accumulator.concat(response.consumedDatasetIds),
          []
        );
        const dataSourceMap = getDataSourceMapFromDatasetIds(
          allConsumedDatasetIds,
          metadata
        );

        return (
          <Card raised={true} className={styles.ChartCard}>
            {optionalTitle}
            {props.children(queryResponses)}
            {!props.hideFooter && props.queries && (
              <CardContent className={styles.CardFooter}>
                {Object.keys(dataSourceMap).length > 0 && <>Sources: </>}
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
                        (updated{" "}
                        {dataSourceMap[dataSourceId].updateTimes.join(", ")}){" "}
                      </>
                    )}
                  </>
                ))}
              </CardContent>
            )}
          </Card>
        );
      }}
    </WithMetadataAndMetrics>
  );
}

export default CardWrapper;
