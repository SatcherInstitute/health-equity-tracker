import React, { useState } from "react";
import CardWrapper from "./CardWrapper";
import {
  Breakdowns,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips, ACS_2010_FIPS } from "../data/utils/Fips";
import { Box, CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
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
import { ALL } from "../data/utils/Constants";
import {
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

  return (
    <CardWrapper minHeight={PRELOAD_HEIGHT} queries={[raceQuery, ageQuery]}>
      {([raceQueryResponse, ageQueryResponse]) => {
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

            {props.fips.needsACS2010() && (
              <CardContent>
                <Alert severity="warning">
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
                    <Alert severity="info" className={styles.PopulationAlert}>
                      These racial categories are defined by the ACS and US
                      Census Bureau. While it is the standard for CDC reporting,
                      the definition of these categories often results in not
                      counting or miscounting people in underrepresented groups.
                      <Button
                        onClick={() => props.jumpToData()}
                        className={styles.InfoLinkButton}
                      >
                        Read about missing data.
                      </Button>
                    </Alert>
                    <Grid container justify="flex-start">
                      {raceQueryResponse
                        .getValidRowsForField("race_and_ethnicity")
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
                        breakdownVar="race_and_ethnicity"
                        showLegend={false}
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
                          geoLevel={props.fips.getFipsTypeDisplayName()}
                        />
                      ) : (
                        <SimpleHorizontalBarChart
                          data={ageQueryResponse.data}
                          metric={POP_CONFIG.metrics.pct_share}
                          breakdownVar="age"
                          showLegend={false}
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
