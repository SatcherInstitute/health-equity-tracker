import React from "react";
import Card from "@material-ui/core/Card";
import styles from "./Card.module.scss";
import Button from "@material-ui/core/Button";
import {
  LinkWithStickyParams,
  DATASET_PRE_FILTERS,
  DATA_CATALOG_PAGE_LINK,
} from "../utils/urlutils";
import { CardContent } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { WithMetadataAndMetrics } from "../data/WithLoadingOrErrorUI";
import { MetricQuery, MetricQueryResponse } from "../data/MetricQuery";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";
import { usePopover } from "../utils/usePopover";

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
        const consumedDatasetIds = queryResponses.reduce(
          (accumulator: string[], response) =>
            accumulator.concat(response.consumedDatasetIds),
          []
        );

        return (
          <Card raised={true} className={styles.ChartCard}>
            {optionalTitle}
            {props.children(queryResponses)}
            {!props.hideFooter && props.queries && (
              <CardContent className={styles.CardFooter}>
                {consumedDatasetIds.length > 0 && <>Sources: </>}
                {/* TODO- add commas and "and" between the data sources */}
                {consumedDatasetIds.map((datasetId) => (
                  <>
                    <LinkWithStickyParams
                      target="_blank"
                      to={`${DATA_CATALOG_PAGE_LINK}?${DATASET_PRE_FILTERS}=${datasetId}`}
                    >
                      {metadata[datasetId].data_source_name}{" "}
                    </LinkWithStickyParams>
                    {metadata[datasetId].update_time === "unknown" ? (
                      <>(last update unknown) </>
                    ) : (
                      <>(updated {metadata[datasetId].update_time}) </>
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
