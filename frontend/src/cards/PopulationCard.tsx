import React from "react";
import CardWrapper from "./CardWrapper";
import { Breakdowns } from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips } from "../data/utils/Fips";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import { MetricId } from "../data/config/MetricConfig";
import Alert from "@material-ui/lab/Alert";
import SviAlert from "./ui/SviAlert";

/* minimize layout shift */
const PRELOAD_HEIGHT = 139;

export interface PopulationCardProps {
  fips: Fips;
}

export function PopulationCard(props: PopulationCardProps) {
  const metricIds: MetricId[] = ["population"];
  if (props.fips.isCounty()) metricIds.push("svi");
  const breakdown = Breakdowns.forFips(props.fips);
  const query = new MetricQuery(metricIds, breakdown);
  const queries = [query];

  return (
    <CardWrapper
      minHeight={PRELOAD_HEIGHT}
      queries={queries}
      scrollToHash="location-info"
      hideNH={true}
    >
      {([queryResponse]) => {
        const { population, svi } = queryResponse?.data?.[0] ?? {};
        const totalPopulationSize =
          population?.toLocaleString("en") ?? "Data Missing";

        return (
          <CardContent className={styles.PopulationCardContent}>
            <Grid
              container
              className={styles.PopulationCard}
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid item xs={12} md={9} xl={10}>
                <Grid container justifyContent="flex-start" alignItems="center">
                  <Grid item>
                    <div className={styles.PopulationCardTitle}>
                      {props.fips.getFullDisplayName()}
                      <div className={styles.VerticalDivider} />
                    </div>
                  </Grid>
                  <Grid item>
                    <Grid container>
                      <Grid item>
                        <span className={styles.TotalPopulationKey}>
                          Population:
                        </span>
                      </Grid>
                      <Grid item>
                        <span className={styles.TotalPopulationValue}>
                          {totalPopulationSize}
                        </span>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid className={styles.SviContainer}>
                <Grid>
                  {props.fips.isCounty() && (
                    <SviAlert
                      svi={svi}
                      sviQueryResponse={queryResponse}
                      fips={props.fips}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
