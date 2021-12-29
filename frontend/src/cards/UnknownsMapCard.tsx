import React from "react";
import { CardContent } from "@material-ui/core";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { Fips, TERRITORY_CODES } from "../data/utils/Fips";
import { VariableConfig } from "../data/config/MetricConfig";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import { Row } from "../data/utils/DatasetTypes";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import MissingDataAlert from "./ui/MissingDataAlert";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import {
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  ALL,
} from "../data/utils/Constants";
import styles from "./Card.module.scss";
import Divider from "@material-ui/core/Divider";
import Alert from "@material-ui/lab/Alert";
import UnknownsAlert from "./ui/UnknownsAlert";

/* minimize layout shift */
const PRELOAD_HEIGHT = 748;

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
  const metricConfig = props.variableConfig.metrics["pct_share"];

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      props.updateFipsCallback(new Fips(clickedData.id));
    },
  };

  // TODO Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const mapGeoBreakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    props.currentBreakdown
  );
  const alertBreakdown = Breakdowns.forFips(props.fips).addBreakdown(
    props.currentBreakdown
  );

  const mapQuery = new MetricQuery([metricConfig.metricId], mapGeoBreakdowns);
  const alertQuery = new MetricQuery([metricConfig.metricId], alertBreakdown);

  const RACE_OR_ETHNICITY_TITLECASE = "Race Or Ethnicity";

  function getTitleTextArray() {
    return [
      `${metricConfig.fullCardTitleName}`,
      `With Unknown ${
        props.overrideAndWithOr
          ? RACE_OR_ETHNICITY_TITLECASE
          : BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
      }`,
    ];
  }

  function getTitleText() {
    return getTitleTextArray().join(" ");
  }

  return (
    <CardWrapper
      queries={[mapQuery, alertQuery]}
      title={<>{getTitleText()}</>}
      loadGeographies={true}
      minHeight={PRELOAD_HEIGHT}
    >
      {([mapQueryResponse, alertQueryResponse], metadata, geoData) => {
        const unknownRaces = mapQueryResponse
          .getValidRowsForField(props.currentBreakdown)
          .filter(
            (row: Row) =>
              row[props.currentBreakdown] === UNKNOWN_RACE ||
              row[props.currentBreakdown] === UNKNOWN
          );

        const unknownEthnicities = mapQueryResponse
          .getValidRowsForField(props.currentBreakdown)
          .filter(
            (row: Row) => row[props.currentBreakdown] === UNKNOWN_ETHNICITY
          );

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

        // this flag is in place when we expect data to be missing
        const dataIsMissing = mapQueryResponse.dataIsMissing();

        // the unknowns array is empty (can be because nothing is unknown like the BRFSS survey, or can be because nothing is reported)
        const unknownsArrayEmpty = unknowns.length === 0;

        // there is data for ALL but not by demographic groups
        const noDemographicInfo =
          mapQueryResponse
            .getValidRowsForField(props.currentBreakdown)
            .filter((row: Row) => row[props.currentBreakdown] !== ALL)
            .length === 0 &&
          mapQueryResponse
            .getValidRowsForField(props.currentBreakdown)
            .filter((row: Row) => row[props.currentBreakdown] === ALL).length >
            0;

        // this is the result of our suppressing states with too low COVID numbers
        const unknownsUndefined =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: Row) => unknown[metricConfig.metricId] === undefined
          );

        // console.log({ unknowns });
        // console.log({ dataIsMissing });
        // console.log({ unknownsArrayEmpty });
        // console.log({ noDemographicInfo });
        // console.log({ unknownsUndefined });

        /* Logic for UNKNOWN MAP CARD components */

        // show MISSING DATA ALERT if we expect the unknowns array to be empty, or if the unknowns are undefined (eg COVID suppressed states)
        const showMissingDataAlert =
          (unknownsArrayEmpty && dataIsMissing) ||
          (!unknownsArrayEmpty && unknownsUndefined);

        // show NO UNKNOWNS INFO BOX when everything is known, (eg the BRFSS survey)
        const showNoUnknownsInfo =
          unknownsArrayEmpty && !dataIsMissing && !unknownsUndefined;

        // show the UNKNOWNS MAP when there is actually unknowns data and it's not undefined/suppressed
        const showUnknownsMap = !unknownsArrayEmpty && !unknownsUndefined;

        return (
          <>
            <CardContent className={styles.SmallMarginContent}>
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
              />
            </CardContent>
            <Divider />

            {/* PERCENT REPORTING UNKNOWN ALERT - contains its own logic and divider/styling */}
            <UnknownsAlert
              queryResponse={alertQueryResponse}
              metricConfig={metricConfig}
              breakdownVar={props.currentBreakdown}
              displayType="map"
              known={false}
              overrideAndWithOr={
                props.currentBreakdown === "race_and_ethnicity"
              }
              raceEthDiffMap={
                mapQueryResponse
                  .getValidRowsForField(props.currentBreakdown)
                  .filter(
                    (row: Row) =>
                      row[props.currentBreakdown] === UNKNOWN_ETHNICITY
                  ).length !== 0
              }
              noDemographicInfoMap={noDemographicInfo}
            />

            <CardContent>
              {/* MISSING DATA ALERT */}
              {showMissingDataAlert && (
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
                  }
                  geoLevel={props.fips.getChildFipsTypeDisplayName()}
                />
              )}

              {/* NO UNKNOWNS INFO BOX */}
              {showNoUnknownsInfo && (
                <Alert severity="info">
                  No unknown values for{" "}
                  {BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]} reported
                  in this dataset.
                </Alert>
              )}
            </CardContent>
            {showUnknownsMap && (
              <CardContent>
                <ChoroplethMap
                  useSmallSampleMessage={
                    !mapQueryResponse.dataIsMissing() &&
                    (props.variableConfig.surveyCollectedData || false)
                  }
                  isUnknownsMap={true}
                  signalListeners={signalListeners}
                  metric={metricConfig}
                  legendTitle={getTitleTextArray()}
                  data={unknowns}
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="symlog"
                  scaleColorScheme="greenblue"
                  hideLegend={
                    mapQueryResponse.dataIsMissing() || unknowns.length <= 1
                  }
                  geoData={geoData}
                  filename={`${getTitleText()} in ${props.fips.getFullDisplayName()}`}
                />
                {props.fips.isUsa() && unknowns.length ? (
                  <div className={styles.TerritoryCirclesContainer}>
                    {TERRITORY_CODES.map((code) => {
                      const fips = new Fips(code);
                      return (
                        <div key={code} className={styles.TerritoryCircle}>
                          <ChoroplethMap
                            isUnknownsMap={true}
                            useSmallSampleMessage={
                              !mapQueryResponse.dataIsMissing() &&
                              (props.variableConfig.surveyCollectedData ||
                                false)
                            }
                            signalListeners={signalListeners}
                            metric={metricConfig}
                            legendTitle={metricConfig.fullCardTitleName}
                            data={unknowns}
                            showCounties={props.fips.isUsa() ? false : true}
                            fips={fips}
                            scaleType="symlog"
                            scaleColorScheme="greenblue"
                            hideLegend={true}
                            hideActions={true}
                            geoData={geoData}
                            overrideShapeWithCircle={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <></>
                )}
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
