import React from "react";
import CardWrapper from "./CardWrapper";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips, ACS_2010_FIPS } from "../data/utils/Fips";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import { MetricId } from "../data/config/MetricConfig";
import { ALL, RACE } from "../data/utils/Constants";
import { onlyInclude } from "../data/query/BreakdownFilter";
import Alert from "@material-ui/lab/Alert";
import SviAlert from "./ui/SviAlert";

export const POPULATION_BY_RACE = "Population by race and ethnicity";
export const POPULATION_BY_AGE = "Population by age";
/* minimize layout shift */
const PRELOAD_HEIGHT = 139;

export interface PopulationCardProps {
  fips: Fips;
  currentBreakdown: BreakdownVar;
}

export function PopulationCard(props: PopulationCardProps) {
  const metricIds: MetricId[] = ACS_2010_FIPS.includes(props.fips.code)
    ? ["population_2010", "population_pct_2010"]
    : ["population", "population_pct"];

  const POPULATION = ACS_2010_FIPS.includes(props.fips.code)
    ? "population_2010"
    : "population";

  const raceQuery = new MetricQuery(
    metricIds,
    Breakdowns.forFips(props.fips).andRace(onlyInclude("All"))
  );

  const queries = [raceQuery];

  if (props.fips.isCounty()) {
    const sviQuery = new MetricQuery(
      "svi",
      Breakdowns.forFips(props.fips).andAge(onlyInclude("All"))
    );
    queries.push(sviQuery);
  }

  return (
    <CardWrapper
      minHeight={PRELOAD_HEIGHT}
      queries={queries}
      scrollToHash="location-info"
      hideNH={true}
    >
      {([raceQueryResponse, sviQueryResponse]) => {
        const svi =
          props.fips.isCounty() &&
          sviQueryResponse.data.find((a) => a.age === ALL)?.svi;

        const totalPopulation = raceQueryResponse.data.find(
          (r) => r?.[RACE] === ALL
        );

        const totalPopulationSize = totalPopulation
          ? totalPopulation[POPULATION].toLocaleString("en")
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

              <Grid
                item
                xs={12}
                md={3}
                xl={2}
                container
                className={styles.ViewPopulationLink}
              >
                <a href="#population-vs-distribution">
                  View population by{" "}
                  {
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                      props.currentBreakdown
                    ]
                  }
                </a>
              </Grid>

              <Grid className={styles.SviContainer}>
                <Grid>
                  {sviQueryResponse && (
                    <SviAlert
                      svi={svi}
                      sviQueryResponse={sviQueryResponse}
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
