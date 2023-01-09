import React from "react";
import CardWrapper from "./CardWrapper";
import { Breakdowns, BreakdownVar } from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips, ACS_2010_FIPS } from "../data/utils/Fips";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import { MetricId } from "../data/config/MetricConfig";
import { ALL, RACE } from "../data/utils/Constants";
import Alert from "@material-ui/lab/Alert";
import SviAlert from "./ui/SviAlert";

/* minimize layout shift */
const PRELOAD_HEIGHT = 139;

export interface PopulationCardProps {
  fips: Fips;
}

export function PopulationCard(props: PopulationCardProps) {
  const populationId = ACS_2010_FIPS.includes(props.fips.code)
    ? "population_2010"
    : "population";

  const metricIds: MetricId[] = [populationId];

  const populationQuery = new MetricQuery(
    metricIds,
    Breakdowns.forFips(props.fips)
  );

  const queries = [populationQuery];

  return (
    <CardWrapper
      minHeight={PRELOAD_HEIGHT}
      queries={queries}
      scrollToHash="location-info"
      hideNH={true}
    >
      {([queryResponse]) => {
        console.log(queryResponse);
        const svi =
          props.fips.isCounty() &&
          queryResponse.data.map((row) => row?.["svi"]);

        const totalPopulation = queryResponse.data.find(
          (r) => r?.[RACE] === ALL
        );

        const totalPopulationSize = totalPopulation
          ? totalPopulation[populationId].toLocaleString("en")
          : "Data Missing";

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
                  {queryResponse && (
                    <SviAlert
                      svi={1}
                      sviQueryResponse={queryResponse}
                      fips={props.fips}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>

            {props.fips.needsACS2010() && (
              <CardContent>
                <Alert severity="warning" role="note">
                  Population data for U.S. Virgin Islands, Guam, and the
                  Northern Mariana Islands is from 2010; interpret metrics with
                  caution.
                </Alert>
              </CardContent>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
