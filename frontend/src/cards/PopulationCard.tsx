import React, { useState } from "react";
import CardWrapper from "./CardWrapper";
import {
  Breakdowns,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips } from "../data/utils/Fips";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import AnimateHeight from "react-animate-height";
import Button from "@material-ui/core/Button";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import {
  MetricId,
  POPULATION_VARIABLE_CONFIG,
} from "../data/config/MetricConfig";
import { TOTAL } from "../data/utils/Constants";
import {
  excludeTotal,
  onlyIncludeStandardRaces,
} from "../data/query/BreakdownFilter";
import MissingDataAlert from "./ui/MissingDataAlert";

export interface PopulationCardProps {
  fips: Fips;
}

export function PopulationCard(props: PopulationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const metricIds: MetricId[] = ["population", "population_pct"];
  const raceQuery = new MetricQuery(
    metricIds,
    Breakdowns.forFips(props.fips).andRace(onlyIncludeStandardRaces())
  );
  // TODO when ACS by age gets more age buckets, update this to specify which
  // ones we want.
  const ageQuery = new MetricQuery(
    metricIds,
    Breakdowns.forFips(props.fips).andAge(excludeTotal())
  );

  return (
    <CardWrapper queries={[raceQuery, ageQuery]}>
      {([raceQueryResponse, ageQueryResponse]) => {
        const totalPopulation = raceQueryResponse.data.find(
          (r) => r.race_and_ethnicity === TOTAL
        );
        const totalPopulationSize = totalPopulation
          ? totalPopulation["population"].toLocaleString("en")
          : "Data Missing";

        return (
          <CardContent>
            {!raceQueryResponse.dataIsMissing() && (
              <Button
                aria-label="expand description"
                onClick={() => setExpanded(!expanded)}
                color="primary"
                className={styles.ExpandPopulationCardButton}
              >
                {expanded ? "Collapse full profile" : "See full profile"}
                {expanded ? <ArrowDropUp /> : <ArrowDropDown />}
              </Button>
            )}
            <span className={styles.PopulationCardTitle}>
              {props.fips.getFullDisplayName()}
            </span>
            {raceQueryResponse.dataIsMissing() && (
              <MissingDataAlert
                dataName={POPULATION_VARIABLE_CONFIG.variableDisplayName}
                breakdownString={
                  BREAKDOWN_VAR_DISPLAY_NAMES["race_and_ethnicity"]
                }
              />
            )}
            <Grid
              container
              className={styles.PopulationCard}
              justify="flex-start"
              alignItems="flex-start"
            >
              <Grid item>
                <span>Total Population</span>
                <span className={styles.TotalPopulationValue}>
                  {totalPopulationSize}
                </span>
              </Grid>
              {/* TODO- calculate median age 
                <Grid item className={styles.PopulationMetric}>
                <span>Median Age</span>
                <span className={styles.PopulationMetricValue}>??</span>
                </Grid>
                */}
              {raceQueryResponse
                .getValidRowsForField("race_and_ethnicity")
                .filter((r) => r.race_and_ethnicity !== TOTAL)
                .sort((a, b) => {
                  return b.population - a.population;
                })
                .map((row) => (
                  <Grid item className={styles.PopulationMetric}>
                    <span>{row.race_and_ethnicity}</span>
                    <span className={styles.PopulationMetricValue}>
                      {row.population_pct}%
                    </span>
                  </Grid>
                ))}
            </Grid>
            {/* Because the Vega charts are using responsive width based on the window resizing,
                we manually trigger a resize when the div size changes so vega chart will 
                render with the right size. This means the vega chart won't appear until the 
                AnimateHeight is finished expanding */}
            {!raceQueryResponse.dataIsMissing() && (
              <AnimateHeight
                duration={500}
                height={expanded ? "auto" : 0}
                onAnimationEnd={() => window.dispatchEvent(new Event("resize"))}
              >
                <Grid container>
                  <Grid item xs={6}>
                    <span className={styles.PopulationChartTitle}>
                      Population by race
                    </span>
                    <SimpleHorizontalBarChart
                      data={raceQueryResponse.data.filter(
                        (r) => r.race_and_ethnicity !== TOTAL
                      )}
                      metric={POPULATION_VARIABLE_CONFIG.metrics.pct_share}
                      breakdownVar="race_and_ethnicity"
                      showLegend={false}
                      hideActions={true}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <span className={styles.PopulationChartTitle}>
                      Population by age
                    </span>
                    {ageQueryResponse.dataIsMissing() ? (
                      <MissingDataAlert
                        dataName={
                          POPULATION_VARIABLE_CONFIG.variableDisplayName
                        }
                        breakdownString={BREAKDOWN_VAR_DISPLAY_NAMES["age"]}
                      />
                    ) : (
                      <SimpleHorizontalBarChart
                        data={ageQueryResponse.data}
                        metric={POPULATION_VARIABLE_CONFIG.metrics.pct_share}
                        breakdownVar="age"
                        showLegend={false}
                        hideActions={true}
                      />
                    )}
                  </Grid>
                </Grid>
              </AnimateHeight>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
