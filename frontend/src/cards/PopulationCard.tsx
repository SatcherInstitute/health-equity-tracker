import React, { useState } from "react";
import CardWrapper from "./CardWrapper";
import {
  Breakdowns,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips, ACS_2010_FIPS } from "../data/utils/Fips";
import { Box, CardContent, Popper } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import variables from "../styles/variables.module.scss";
import AnimateHeight from "react-animate-height";
import Button from "@material-ui/core/Button";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import {
  formatFieldValue,
  MetricId,
  POPULATION_VARIABLE_CONFIG,
  POPULATION_VARIABLE_CONFIG_2010,
} from "../data/config/MetricConfig";
import { ALL, RACE } from "../data/utils/Constants";
import {
  onlyInclude,
  onlyIncludeDecadeAgeBrackets,
  onlyIncludeStandardRaces,
} from "../data/query/BreakdownFilter";
import MissingDataAlert from "./ui/MissingDataAlert";
import Hidden from "@material-ui/core/Hidden";
import Alert from "@material-ui/lab/Alert";

export const POPULATION_BY_RACE = "Population by race and ethnicity";
export const POPULATION_BY_AGE = "Population by age";
/* minimize layout shift */
const PRELOAD_HEIGHT = 139;

export interface PopulationCardProps {
  fips: Fips;
  jumpToData: Function;
}

export function PopulationCard(props: PopulationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const metricIds: MetricId[] = ACS_2010_FIPS.includes(props.fips.code)
    ? ["population_2010", "population_pct_2010"]
    : ["population", "population_pct"];

  const POPULATION = ACS_2010_FIPS.includes(props.fips.code)
    ? "population_2010"
    : "population";

  const POPULATION_PCT = ACS_2010_FIPS.includes(props.fips.code)
    ? "population_pct_2010"
    : "population_pct";

  const POP_CONFIG = ACS_2010_FIPS.includes(props.fips.code)
    ? POPULATION_VARIABLE_CONFIG_2010
    : POPULATION_VARIABLE_CONFIG;

  const raceQuery = new MetricQuery(
    metricIds,
    Breakdowns.forFips(props.fips).andRace(onlyIncludeStandardRaces())
  );
  const ageQuery = new MetricQuery(
    metricIds,
    Breakdowns.forFips(props.fips).andAge(onlyIncludeDecadeAgeBrackets())
  );

  const queries = [raceQuery, ageQuery];

  if (props.fips.isCounty()) {
    const sviQuery = new MetricQuery(
      "svi",
      Breakdowns.forFips(props.fips).andAge(onlyInclude("All"))
    );
    queries.push(sviQuery);
  }

  const findRating = (svi: number) => {
    if (svi < 0.34) {
      return "low";
    }
    if (svi > 0.67) {
      return "high";
    } else return "medium";
  };

  const findColor = (rating: string) => {
    if (rating === "high") {
      return "#d32f2f";
    }
    if (rating === "low") {
      return variables.altGreen;
    } else return "#d85c47";
  };

  return (
    <CardWrapper minHeight={PRELOAD_HEIGHT} queries={queries}>
      {([raceQueryResponse, ageQueryResponse, sviQueryResponse]) => {
        console.log(sviQueryResponse);
        const svi =
          props.fips.isCounty() &&
          sviQueryResponse.data.find((a) => a.age === ALL)?.svi;

        const rating = findRating(svi);
        const color = findColor(rating);
        const totalPopulation = raceQueryResponse.data.find(
          (r) => r.race_and_ethnicity === ALL
        );

        const totalPopulationSize = totalPopulation
          ? totalPopulation[POPULATION].toLocaleString("en")
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
            <Grid
              container
              className={styles.PopulationCard}
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid item>
                <Grid container justifyContent="flex-start" alignItems="center">
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

            {svi && (
              <Alert severity="info">
                This county has a social vulnerability index of <b>{svi}</b>;
                which indicates a{" "}
                <a href="testing" style={{ textDecorationColor: color }}>
                  <span style={{ color: color, fontWeight: "bold" }}>
                    {rating} level of vulernability.
                  </span>
                </a>{" "}
              </Alert>
            )}

            {props.fips.needsACS2010() && (
              <CardContent>
                <Alert severity="warning" role="note">
                  Population data for U.S. Virgin Islands, Guam, and the
                  Northern Mariana Islands is from 2010; interpret metrics with
                  caution.
                </Alert>
              </CardContent>
            )}

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
                    <Alert
                      severity="info"
                      role="note"
                      className={styles.PopulationAlert}
                    >
                      These racial categories are defined by the ACS and US
                      Census Bureau. While it is the standard for CDC reporting,
                      the definition of these categories often results in not
                      counting or miscounting people in underrepresented groups.{" "}
                      <a
                        href="#missingDataInfo"
                        onClick={() => props.jumpToData()}
                      >
                        Read about missing data
                      </a>
                      .
                    </Alert>
                    <Grid container justifyContent="space-between">
                      {raceQueryResponse
                        .getValidRowsForField(RACE)
                        .filter((r) => r.race_and_ethnicity !== ALL)
                        .sort((a, b) => {
                          return b.race_and_ethnicity - a.race_and_ethnicity;
                        })
                        .map((row) => (
                          <Grid
                            item
                            xs={6}
                            sm={3}
                            lg={1}
                            key={row.race_and_ethnicity}
                            className={styles.PopulationMetric}
                          >
                            <div>{row.race_and_ethnicity}</div>

                            <div className={styles.PopulationMetricValue}>
                              {formatFieldValue(
                                "pct_share",
                                row[POPULATION_PCT]
                              )}
                            </div>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box mt={3}>
                      <span className={styles.PopulationChartTitle}>
                        {POPULATION_BY_RACE}
                      </span>
                      <SimpleHorizontalBarChart
                        data={raceQueryResponse.data.filter(
                          (r) => r.race_and_ethnicity !== ALL
                        )}
                        metric={POP_CONFIG.metrics.pct_share}
                        breakdownVar={RACE}
                        showLegend={false}
                        usePercentSuffix={true}
                        filename={`${POPULATION_BY_RACE} in ${props.fips.getFullDisplayName()}`}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box m={3}>
                      <span className={styles.PopulationChartTitle}>
                        Population by age
                      </span>
                      {ageQueryResponse.dataIsMissing() ? (
                        <MissingDataAlert
                          dataName={POP_CONFIG.variableDisplayName}
                          breakdownString={BREAKDOWN_VAR_DISPLAY_NAMES["age"]}
                          fips={props.fips}
                        />
                      ) : (
                        <SimpleHorizontalBarChart
                          data={ageQueryResponse.data}
                          metric={POP_CONFIG.metrics.pct_share}
                          breakdownVar="age"
                          showLegend={false}
                          usePercentSuffix={true}
                          filename={`${POPULATION_BY_AGE} in ${props.fips.getFullDisplayName()}`}
                        />
                      )}
                    </Box>
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
