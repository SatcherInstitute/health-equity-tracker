import React from "react";
import { CardContent } from "@material-ui/core";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { Fips, TERRITORY_CODES } from "../data/utils/Fips";
import { MetricId, VariableConfig } from "../data/config/MetricConfig";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import { Row } from "../data/utils/DatasetTypes";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import MissingDataAlert from "./ui/MissingDataAlert";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import {
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  ALL,
  RACE,
} from "../data/utils/Constants";
import styles from "./Card.module.scss";
import Divider from "@material-ui/core/Divider";
import Alert from "@material-ui/lab/Alert";
import UnknownsAlert from "./ui/UnknownsAlert";
import { useGuessPreloadHeight } from "../utils/hooks/useGuessPreloadHeight";
import { useLocation } from "react-router-dom";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { useCreateChartTitle } from "../utils/hooks/useCreateChartTitle";
import { CAWP_DATA_TYPES } from "../data/variables/CawpProvider";

export interface UnknownsMapCardProps {
  // Variable the map will evaluate for unknowns
  variableConfig: VariableConfig;
  // Breakdown value to evaluate for unknowns
  currentBreakdown: BreakdownVar;
  // Geographic region of maps
  fips: Fips;
  // Updates the madlib
  updateFipsCallback: (fips: Fips) => void;
  // replaces race AND ethnicity with race OR ethnicity on unknowns map title and alerts
  overrideAndWithOr?: Boolean;
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function UnknownsMapCard(props: UnknownsMapCardProps) {
  return (
    <UnknownsMapCardWithKey
      key={props.currentBreakdown + props.variableConfig.variableId}
      {...props}
    />
  );
}

function UnknownsMapCardWithKey(props: UnknownsMapCardProps) {
  const preloadHeight = useGuessPreloadHeight([700, 1000]);
  const metricConfig = props.variableConfig.metrics["pct_share"];
  const currentBreakdown = props.currentBreakdown;
  const breakdownString = `with unknown ${BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]}`;
  const isCawp = CAWP_DATA_TYPES.includes(props.variableConfig.variableId);
  const location = useLocation();
  const locationPhrase = `in ${props.fips.getSentenceDisplayName()}`;

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id));
        location.hash = `#unknown-demographic-map`;
      }
    },
  };

  // TODO Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const mapGeoBreakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    currentBreakdown
  );
  const alertBreakdown = Breakdowns.forFips(props.fips).addBreakdown(
    currentBreakdown
  );

  const mapQuery = new MetricQuery(
    [metricConfig.metricId],
    mapGeoBreakdowns,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawp ? "cross_sectional" : undefined
  );
  const alertQuery = new MetricQuery(
    [metricConfig.metricId],
    alertBreakdown,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawp ? "cross_sectional" : undefined
  );

  const { chartTitle, dataName, filename } = useCreateChartTitle(
    metricConfig,
    locationPhrase,
    breakdownString
  );

  const isCawpStateLeg =
    props.variableConfig.variableId === "women_state_legislatures";
  const isCawpCongress =
    props.variableConfig.variableId === "women_us_congress";

  let countColsToAdd: MetricId[] = [];
  if (isCawpCongress) countColsToAdd = ["women_this_race_us_congress_count"];
  if (isCawpStateLeg) countColsToAdd = ["women_this_race_state_leg_count"];

  const HASH_ID: ScrollableHashId = "unknown-demographic-map";

  return (
    <CardWrapper
      queries={[mapQuery, alertQuery]}
      title={<>{reportProviderSteps[HASH_ID].label}</>}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
    >
      {([mapQueryResponse, alertQueryResponse], metadata, geoData) => {
        // MOST of the items rendered in the card refer to the unknowns at the CHILD geo level,
        //  e.g. if you look at the United States, we are dealing with the Unknown pct_share at the state level
        // the exception is the <UnknownsAlert /> which presents the amount of unknown demographic at the SELECTED level
        const unknownRaces: Row[] = mapQueryResponse
          .getValidRowsForField(currentBreakdown)
          .filter(
            (row: Row) =>
              row[currentBreakdown] === UNKNOWN_RACE ||
              row[currentBreakdown] === UNKNOWN
          );

        const unknownEthnicities: Row[] = mapQueryResponse
          .getValidRowsForField(currentBreakdown)
          .filter((row: Row) => row[currentBreakdown] === UNKNOWN_ETHNICITY);

        // If a state provides both unknown race and ethnicity numbers
        // use the higher one
        const unknowns =
          unknownEthnicities.length === 0
            ? unknownRaces
            : unknownRaces.map((unknownRaceRow, index) => {
                return unknownRaceRow[metricConfig.metricId] >
                  unknownEthnicities[index][metricConfig.metricId] ||
                  unknownEthnicities[index][metricConfig.metricId] == null
                  ? unknownRaceRow
                  : unknownEthnicities[index];
              });

        const dataIsMissing = mapQueryResponse.dataIsMissing();
        const unknownsArrayEmpty = unknowns.length === 0;

        // there is some data but only for ALL but not by demographic groups
        const noDemographicInfo =
          mapQueryResponse
            .getValidRowsForField(currentBreakdown)
            .filter((row: Row) => row[currentBreakdown] !== ALL).length === 0 &&
          mapQueryResponse
            .getValidRowsForField(currentBreakdown)
            .filter((row: Row) => row[currentBreakdown] === ALL).length > 0;

        // when suppressing states with too low COVID numbers
        const unknownsUndefined =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: Row) => unknown[metricConfig.metricId] === undefined
          );

        // for data sets where some geos might contain `0` for every unknown pct_share, like CAWP US Congress National
        const unknownsAllZero =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: Row) => unknown[metricConfig.metricId] === 0
          );

        // show MISSING DATA ALERT if we expect the unknowns array to be empty (breakdowns/data unavailable),
        // or if the unknowns are undefined (eg COVID suppressed states)
        const showMissingDataAlert =
          (unknownsArrayEmpty && dataIsMissing) ||
          (!unknownsArrayEmpty && unknownsUndefined) ||
          noDemographicInfo;

        // show NO UNKNOWNS INFO BOX for an expected empty array of UNKNOWNS (eg the BRFSS survey)
        const showNoUnknownsInfo =
          unknownsArrayEmpty &&
          !dataIsMissing &&
          !unknownsUndefined &&
          !noDemographicInfo;

        // show the UNKNOWNS MAP when there is unknowns data and it's not undefined/suppressed
        const showingVisualization =
          !unknownsArrayEmpty && !unknownsUndefined && !unknownsAllZero;

        const hasChildGeo = props.fips.getChildFipsTypeDisplayName() !== "";

        return (
          <>
            <CardContent className={styles.SmallMarginContent}>
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                scrollToHashId="unknown-demographic-map"
              />
            </CardContent>
            <Divider />

            {/* PERCENT REPORTING UNKNOWN ALERT - contains its own logic and divider/styling */}
            {!unknownsAllZero && (
              <UnknownsAlert
                queryResponse={alertQueryResponse}
                metricConfig={metricConfig}
                breakdownVar={currentBreakdown}
                displayType="map"
                known={false}
                overrideAndWithOr={currentBreakdown === RACE}
                raceEthDiffMap={
                  mapQueryResponse
                    .getValidRowsForField(currentBreakdown)
                    .filter(
                      (row: Row) => row[currentBreakdown] === UNKNOWN_ETHNICITY
                    ).length !== 0
                }
                noDemographicInfoMap={noDemographicInfo}
                showingVisualization={showingVisualization}
                fips={props.fips}
              />
            )}

            <CardContent>
              {/* MISSING DATA ALERT */}
              {showMissingDataAlert && (
                <MissingDataAlert
                  dataName={dataName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]
                  }
                  isMapCard={true}
                  fips={props.fips}
                />
              )}

              {/* NO UNKNOWNS INFO BOX */}
              {(showNoUnknownsInfo || unknownsAllZero) && (
                <Alert severity="info" role="note">
                  No unknown values for{" "}
                  {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]}{" "}
                  reported in this dataset
                  {hasChildGeo && (
                    <>
                      {" "}
                      at the {props.fips.getChildFipsTypeDisplayName()} level
                    </>
                  )}
                  {"."}
                </Alert>
              )}
            </CardContent>
            {showingVisualization && (
              <CardContent>
                <ChoroplethMap
                  titles={{ chartTitle }}
                  isUnknownsMap={true}
                  signalListeners={signalListeners}
                  metric={metricConfig}
                  legendTitle={metricConfig?.unknownsVegaLabel || ""}
                  data={unknowns}
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="symlog"
                  scaleColorScheme="greenblue"
                  hideLegend={
                    mapQueryResponse.dataIsMissing() || unknowns.length <= 1
                  }
                  geoData={geoData}
                  filename={filename}
                  countColsToAdd={countColsToAdd}
                />
                {props.fips.isUsa() && unknowns.length > 0 && (
                  <div className={styles.TerritoryCirclesContainer}>
                    {TERRITORY_CODES.map((code) => {
                      const fips = new Fips(code);
                      return (
                        <div key={code} className={styles.TerritoryCircle}>
                          <ChoroplethMap
                            isUnknownsMap={true}
                            signalListeners={signalListeners}
                            metric={metricConfig}
                            data={unknowns}
                            showCounties={props.fips.isUsa() ? false : true}
                            fips={fips}
                            scaleType="symlog"
                            scaleColorScheme="greenblue"
                            hideLegend={true}
                            hideActions={true}
                            geoData={geoData}
                            overrideShapeWithCircle={true}
                            countColsToAdd={countColsToAdd}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
