import React from "react";
import Card from "@material-ui/core/Card";
import styles from "./Card.module.scss";
import Button from "@material-ui/core/Button";
import { CardContent } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";
import { usePopover } from "../utils/usePopover";
import { MetricQuery, MetricQueryResponse } from "../data/query/MetricQuery";
import { WithMetadataAndMetrics } from "../data/react/WithLoadingOrErrorUI";
import { Sources } from "./ui/Sources";
import { MapOfDatasetMetadata } from "../data/utils/DatasetTypes";

function CardWrapper(props: {
  title?: JSX.Element;
  infoPopover?: JSX.Element;
  hideFooter?: boolean;
  queries?: MetricQuery[];
  children: (
    queryResponses: MetricQueryResponse[],
    metadata: MapOfDatasetMetadata
  ) => JSX.Element;
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
        return (
          <Card raised={true} className={styles.ChartCard}>
            {optionalTitle}
            {props.children(queryResponses, metadata)}
            {!props.hideFooter && props.queries && (
              <CardContent className={styles.CardFooter}>
                <Sources queryResponses={queryResponses} metadata={metadata} />
              </CardContent>
            )}
          </Card>
        );
      }}
    </WithMetadataAndMetrics>
  );
}

export default CardWrapper;
