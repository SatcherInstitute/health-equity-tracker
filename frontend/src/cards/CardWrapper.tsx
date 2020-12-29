import React from "react";
import Card from "@material-ui/core/Card";
import styles from "./Card.module.scss";
import {
  LinkWithStickyParams,
  DATASET_PRE_FILTERS,
  DATA_CATALOG_PAGE_LINK,
} from "../utils/urlutils";
import { CardContent } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { WithMetrics } from "../data/WithLoadingOrErrorUI";
import { MetricQuery } from "../data/MetricQuery";
import CircularProgress from "@material-ui/core/CircularProgress";
import useDatasetStore from "../data/useDatasetStore";

function CardWrapper(props: {
  datasetIds: string[];
  titleText?: string;
  hideFooter?: boolean;
  queries?: MetricQuery[];
  children: () => JSX.Element;
}) {
  const optionalTitle = props.titleText ? (
    <>
      <CardContent>
        <Typography className={styles.CardHeader}>{props.titleText}</Typography>
      </CardContent>
      <Divider />
    </>
  ) : null;
  const datasetStore = useDatasetStore();

  return (
    <WithMetrics
      queries={props.queries ? props.queries : []}
      loadingComponent={
        <Card raised={true} className={styles.ChartCard}>
          {optionalTitle}
          <CardContent>
            <CircularProgress />
          </CardContent>
        </Card>
      }
    >
      {() => {
        return (
          <Card raised={true} className={styles.ChartCard}>
            {optionalTitle}
            {props.children()}
            {!props.hideFooter && (
              <CardContent className={styles.CardFooter}>
                Sources:{" "}
                {props.datasetIds.map((datasetId) => (
                  <>
                    {datasetId ===
                      "acs_state_population_by_race_nonstandard" && (
                      <>Population and demographic data from </>
                    )}
                    <LinkWithStickyParams
                      target="_blank"
                      to={`${DATA_CATALOG_PAGE_LINK}?${DATASET_PRE_FILTERS}=${datasetId}`}
                    >
                      {datasetStore.metadata[datasetId].data_source_name}
                      {". "}
                    </LinkWithStickyParams>
                  </>
                ))}
                <span className={styles.UpdateTime}>
                  Data last updated:{" "}
                  {props.datasetIds.map((datasetId) => (
                    <>
                      {datasetStore.metadata[datasetId].data_source_name} (
                      {datasetStore.metadata[datasetId].update_time}){" "}
                    </>
                  ))}
                </span>
              </CardContent>
            )}
          </Card>
        );
      }}
    </WithMetrics>
  );
}

export default CardWrapper;
