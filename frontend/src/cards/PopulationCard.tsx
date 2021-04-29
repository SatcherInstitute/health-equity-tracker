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
import { ALL } from "../data/utils/Constants";
import {
  excludeAll,
  onlyIncludeStandardRaces,
} from "../data/query/BreakdownFilter";
import MissingDataAlert from "./ui/MissingDataAlert";
import Hidden from "@material-ui/core/Hidden";
import { TAB_PARAM, WHAT_IS_HEALTH_EQUITY_PAGE_LINK } from "../utils/urlutils";
import { WIHE_FAQ_TAB_INDEX } from "../pages/WhatIsHealthEquity/WhatIsHealthEquityPage";
import Alert from "@material-ui/lab/Alert";

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
    Breakdowns.forFips(props.fips).andAge(excludeAll())
  );

  return (
    <CardWrapper queries={[raceQuery, ageQuery]}>
      {([raceQueryResponse, ageQueryResponse]) => {
        const totalPopulation = raceQueryResponse.data.find(
          (r) => r.race_and_ethnicity === ALL
        );
        const totalPopulationSize = totalPopulation
          ? totalPopulation["population"].toLocaleString("en")
          : "Data Missing";

        const CollapseButton = (
          <Button
            aria-label={
              expanded
                ? "collapse population profile card"
                : "expand population profile card"
            }
            onClick={() => setExpanded(!expanded)}
            color="primary"
          >
            {expanded ? "Collapse full profile" : "See full profile"}
            {expanded ? <ArrowDropUp /> : <ArrowDropDown />}
          </Button>
        );

        return (
          <CardContent className={styles.PopulationCardContent}>
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
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Grid container justify="flex-start" alignItems="center">
                  <Grid item>
                    <div className={styles.PopulationCardTitle}>
                      {props.fips.getFullDisplayName()}
                      <Hidden smDown>
                        <div className={styles.VerticalDivider} />
                      </Hidden>
                    </div>
                  </Grid>
                  <Grid item>
                    <Grid container>
                      <Grid item>
                        <span className={styles.TotalPopulationKey}>
                          Total Population:
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
              {!raceQueryResponse.dataIsMissing() && (
                <Grid item>{CollapseButton}</Grid>
              )}
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
                  <Grid item xs={12}>
                    <Alert severity="info" className={styles.PopulationAlert}>
                      These racial categories are defined by the ACS and US
                      Census Bureau. While it is the standard for CDC reporting,
                      the definition of these categories often results in not
                      counting or miscounting people in underrepresented groups.{" "}
                      <a
                        href={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}?${TAB_PARAM}=${WIHE_FAQ_TAB_INDEX}`}
                      >
                        Learn more
                      </a>
                      .
                    </Alert>
                    <Grid container>
                      {raceQueryResponse
                        .getValidRowsForField("race_and_ethnicity")
                        .filter((r) => r.race_and_ethnicity !== ALL)
                        .sort((a, b) => {
                          return b.race_and_ethnicity - a.race_and_ethnicity;
                        })
                        .map((row) => (
                          <Grid item className={styles.PopulationMetric}>
                            <span>{row.race_and_ethnicity}</span>
                            <br />
                            <span className={styles.PopulationMetricValue}>
                              {row.population_pct}%
                            </span>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <span className={styles.PopulationChartTitle}>
                      Population by race
                    </span>
                    <SimpleHorizontalBarChart
                      data={raceQueryResponse.data.filter(
                        (r) => r.race_and_ethnicity !== ALL
                      )}
                      metric={POPULATION_VARIABLE_CONFIG.metrics.pct_share}
                      breakdownVar="race_and_ethnicity"
                      showLegend={false}
                      hideActions={true}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                <Hidden smUp>{CollapseButton}</Hidden>
              </AnimateHeight>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
