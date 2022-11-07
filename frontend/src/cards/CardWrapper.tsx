import React from "react";
import Card from "@material-ui/core/Card";
import styles from "./Card.module.scss";
import Button from "@material-ui/core/Button";
import { CardContent, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";
import { usePopover } from "../utils/hooks/usePopover";
import { MetricQuery, MetricQueryResponse } from "../data/query/MetricQuery";
import { WithMetadataAndMetrics } from "../data/react/WithLoadingOrErrorUI";
import { Sources } from "./ui/Sources";
import { MapOfDatasetMetadata } from "../data/utils/DatasetTypes";
import CopyLinkButton from "./ui/CopyLinkButton";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { MetricConfig } from "../data/config/MetricConfig";

function CardWrapper(props: {
  // prevent layout shift as component loads
  minHeight?: number;
  title?: JSX.Element;
  // To have an info icon that opens additional info, pass a Popover such as <RaceInfoPopoverContent />
  infoPopover?: JSX.Element;
  hideFooter?: boolean;
  hideNH?: boolean;
  queries?: MetricQuery[];
  // Whether to load the geographies dataset for this card.
  loadGeographies?: boolean;
  children: (
    queryResponses: MetricQueryResponse[],
    metadata: MapOfDatasetMetadata,
    geoData?: Record<string, any>
  ) => JSX.Element;
  isAgeAdjustedTable?: boolean;
  scrollToHash: ScrollableHashId;
  configs: MetricConfig[];
}) {
  const popover = usePopover();
  const queries = props.queries ? props.queries : [];

  const optionalTitle = props.title ? (
    <>
      <CardContent>
        <Grid justifyContent="space-between" container>
          <Grid item xs={11}>
            <Typography component="h3" className={styles.CardHeader}>
              {props.title}
              {props.infoPopover && (
                <Button
                  onClick={popover.open}
                  className={styles.InfoIconButton}
                >
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
          </Grid>
          <Grid item>
            <CopyLinkButton scrollToHash={props.scrollToHash} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
    </>
  ) : null;

  const loadingComponent = (
    <Card
      raised={true}
      className={styles.ChartCard}
      style={{ minHeight: props.minHeight }}
    >
      {optionalTitle}
      <CardContent>
        <CircularProgress aria-label="loading" />
      </CardContent>
    </Card>
  );

  return (
    <WithMetadataAndMetrics
      queries={queries}
      loadingComponent={loadingComponent}
      loadGeographies={props.loadGeographies}
    >
      {(metadata, queryResponses, geoData) => {
        return (
          <Card
            raised={true}
            className={styles.ChartCard}
            component={"article"}
          >
            <header>{optionalTitle}</header>
            {props.children(queryResponses, metadata, geoData)}
            {!props.hideFooter && props.queries && (
              <CardContent className={styles.CardFooter} component={"footer"}>
                <Sources
                  isAgeAdjustedTable={props.isAgeAdjustedTable}
                  queryResponses={queryResponses}
                  metadata={metadata}
                  hideNH={props.hideNH}
                  configs={props.configs}
                />
              </CardContent>
            )}
          </Card>
        );
      }}
    </WithMetadataAndMetrics>
  );
}

export default CardWrapper;
