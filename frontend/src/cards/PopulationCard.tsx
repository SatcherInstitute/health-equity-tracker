import React, { useState } from "react";
import { Alert } from "@material-ui/lab";
import CardWrapper from "./CardWrapper";
import { Breakdowns } from "../data/Breakdowns";
import { MetricId } from "../data/variableProviders";
import { MetricQuery } from "../data/MetricQuery";
import { Fips } from "../utils/madlib/Fips";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import AnimateHeight from "react-animate-height";
import Button from "@material-ui/core/Button";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import { POPULATION_VARIABLE_CONFIG } from "../data/MetricConfig";

export interface PopulationCardProps {
  fips: Fips;
}

export function PopulationCard(props: PopulationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const variableIds: MetricId[] = ["population", "population_pct"];
  const raceQuery = new MetricQuery(
    variableIds,
    Breakdowns.forFips(props.fips).andRace(/*includeTotal=*/ true)
  );
  const ageQuery = new MetricQuery(
    variableIds,
    Breakdowns.forFips(props.fips).andAge()
  );

  return (
    <CardWrapper queries={[raceQuery, ageQuery]} hideFooter={true}>
      {([raceQueryResponse, ageQueryResponse]) => {
        const totalPopulation = raceQueryResponse.data.find(
          (r) => r.race_and_ethnicity === "Total"
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
              <Alert severity="warning">
                Missing data means that we don't know the full story.
              </Alert>
            )}
            {/* Because the Vega charts are using responsive width based on the window resizing,
                we manually trigger a resize when the div size changes so vega chart will 
                render with the right size. This means the vega chart won't appear until the 
                AnimateHeight is finished expanding */}
            {!raceQueryResponse.dataIsMissing() && (
              <AnimateHeight
                duration={500}
                height={expanded ? "auto" : 70}
                onAnimationEnd={() => window.dispatchEvent(new Event("resize"))}
              >
                <Grid
                  container
                  className={styles.PopulationCard}
                  justify="space-around"
                >
                  <Grid item>
                    <span>Total Population</span>
                    <span className={styles.TotalPopulationValue}>
                      {totalPopulationSize}
                    </span>
                  </Grid>
                  {/* TODO- calculate median age */}
                  <Grid item className={styles.PopulationMetric}>
                    <span>Median Age</span>
                    <span className={styles.PopulationMetricValue}>??</span>
                  </Grid>
                  {/* TODO- properly align these */}
                  {raceQueryResponse.data
                    .filter((r) => r.race_and_ethnicity !== "Total")
                    .map((row) => (
                      <Grid item className={styles.PopulationMetric}>
                        <span>{row.race_and_ethnicity}</span>
                        <span className={styles.PopulationMetricValue}>
                          {row.population_pct}%
                        </span>
                      </Grid>
                    ))}
                </Grid>
                <Grid container>
                  <Grid item xs={6}>
                    <span className={styles.PopulationChartTitle}>
                      Population by race
                    </span>
                    <SimpleHorizontalBarChart
                      data={raceQueryResponse.data.filter(
                        (r) => r.race_and_ethnicity !== "Total"
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
                      <Alert severity="warning">Age data missing.</Alert>
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
