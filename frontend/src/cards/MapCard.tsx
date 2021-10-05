import { CardContent, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Alert from "@material-ui/lab/Alert";
import React, { useState } from "react";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { VariableConfig, formatFieldValue } from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { AgeSorterStrategy } from "../data/sorting/AgeSorterStrategy";
import {
  ALL,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_RACE,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import { getHighestN, getLowestN } from "../data/utils/datasetutils";
import { Fips, TERRITORY_CODES } from "../data/utils/Fips";
import { useAutoFocusDialog } from "../utils/useAutoFocusDialog";
import styles from "./Card.module.scss";
import CardWrapper from "./CardWrapper";
import DropDownMenu from "./ui/DropDownMenu";
import { HighestLowestList } from "./ui/HighestLowestList";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import MissingDataAlert from "./ui/MissingDataAlert";
import { MultiMapDialog } from "./ui/MultiMapDialog";

const SIZE_OF_HIGHEST_LOWEST_RATES_LIST = 5;

export interface MapCardProps {
  key?: string;
  fips: Fips;
  variableConfig: VariableConfig;
  updateFipsCallback: (fips: Fips) => void;
  currentBreakdown: BreakdownVar;
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function MapCard(props: MapCardProps) {
  return (
    <MapCardWithKey
      key={props.currentBreakdown + props.variableConfig.variableId}
      {...props}
    />
  );
}

function MapCardWithKey(props: MapCardProps) {
  const metricConfig = props.variableConfig.metrics["per100k"];

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      props.updateFipsCallback(new Fips(clickedData.id));
    },
  };

  const [listExpanded, setListExpanded] = useState(false);
  const [activeBreakdownFilter, setActiveBreakdownFilter] = useState<string>(
    ALL
  );

  const [
    smallMultiplesDialogOpen,
    setSmallMultiplesDialogOpen,
  ] = useAutoFocusDialog();

  const metricQuery = (geographyBreakdown: Breakdowns) =>
    new MetricQuery(
      metricConfig.metricId,
      geographyBreakdown
        .copy()
        .addBreakdown(
          props.currentBreakdown,
          props.currentBreakdown === "race_and_ethnicity"
            ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE)
            : exclude(UNKNOWN)
        )
    );

  const queries = [
    metricQuery(Breakdowns.forChildrenFips(props.fips)),
    metricQuery(Breakdowns.forFips(props.fips)),
  ];

  return (
    <CardWrapper
      queries={queries}
      title={<>{metricConfig.fullCardTitleName}</>}
      loadGeographies={true}
    >
      {(queryResponses, metadata, geoData) => {
        const mapQueryResponse = queryResponses[0];
        const overallQueryResponse = queryResponses[1];

        const sortArgs =
          props.currentBreakdown === "age"
            ? ([new AgeSorterStrategy([ALL]).compareFn] as any)
            : [];
        const breakdownValues = mapQueryResponse.getUniqueFieldValues(
          props.currentBreakdown
        );
        breakdownValues.sort.apply(breakdownValues, sortArgs);

        const dataForActiveBreakdownFilter = mapQueryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) => row[props.currentBreakdown] === activeBreakdownFilter
          );
        const highestRatesList = getHighestN(
          dataForActiveBreakdownFilter,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_RATES_LIST
        );
        const lowestRatesList = getLowestN(
          dataForActiveBreakdownFilter,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_RATES_LIST
        );

        // Create and populate a map of breakdown display name to options
        const filterOptions: Record<string, string[]> = {
          [BREAKDOWN_VAR_DISPLAY_NAMES[
            props.currentBreakdown
          ]]: breakdownValues,
        };

        return (
          <>
            <MultiMapDialog
              fips={props.fips}
              metricConfig={metricConfig}
              useSmallSampleMessage={
                !mapQueryResponse.dataIsMissing() &&
                (props.variableConfig.surveyCollectedData || false)
              }
              data={mapQueryResponse.getValidRowsForField(
                metricConfig.metricId
              )}
              breakdown={props.currentBreakdown}
              handleClose={() => setSmallMultiplesDialogOpen(false)}
              open={smallMultiplesDialogOpen}
              breakdownValues={breakdownValues}
              fieldRange={mapQueryResponse.getFieldRange(metricConfig.metricId)}
              queryResponses={queryResponses}
              metadata={metadata}
              geoData={geoData}
            />
            <CardContent className={styles.SmallMarginContent}>
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                ariaLabel={
                  props.variableConfig.variableFullDisplayName as string
                }
              />
            </CardContent>

            {!mapQueryResponse.dataIsMissing() && (
              <>
                <Divider />
                <CardContent className={styles.SmallMarginContent}>
                  <Grid
                    container
                    justify="space-between"
                    align-items="flex-end"
                  >
                    <Grid item>
                      <DropDownMenu
                        value={activeBreakdownFilter}
                        options={filterOptions}
                        onOptionUpdate={(
                          newBreakdownDisplayName,
                          filterSelection
                        ) => {
                          // This DropDownMenu instance only supports changing active breakdown filter
                          // It doesn't support changing breakdown type
                          if (filterSelection) {
                            setActiveBreakdownFilter(filterSelection);
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </>
            )}

            {!mapQueryResponse.dataIsMissing() &&
              !!dataForActiveBreakdownFilter.length && (
                <>
                  <Divider />
                  <CardContent>
                    <Alert severity="info">
                      {/* EXAMPLE TEXT OUTPUT:  */}
                      <b>
                        {/* 9,543 */}
                        {formatFieldValue(
                          metricConfig.type,
                          overallQueryResponse!.data.find(
                            (row) =>
                              row[props.currentBreakdown] ===
                              activeBreakdownFilter
                          )![metricConfig.metricId]
                        )}
                      </b>{" "}
                      {/* cases per 100k */}
                      {metricConfig.shortVegaLabel}
                      {/* for  */}
                      {activeBreakdownFilter !== "All" && " for"}
                      {/* [ ages 30-39] */}
                      {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                        props.currentBreakdown
                      ] === "age" &&
                        activeBreakdownFilter !== "All" &&
                        ` ages ${activeBreakdownFilter}`}
                      {/* [Asian (non Hispanic) individuals] */}
                      {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                        props.currentBreakdown
                      ] !== "age" &&
                        activeBreakdownFilter !== "All" &&
                        ` ${activeBreakdownFilter} individuals`}
                      {" in  "}
                      {/* in */}
                      {/* (the) */}
                      {props.fips.getDisplayName() === "United States" &&
                        "the "}
                      {/* United States */}
                      {props.fips.getDisplayName()}
                      {". "}
                      {/* LINK: Compare across XYZ */}
                      <span
                        onClick={() => setSmallMultiplesDialogOpen(true)}
                        role="button"
                        className={styles.CompareAcrossLink}
                        aria-label={
                          "Compare " +
                          props.variableConfig.variableFullDisplayName +
                          " across " +
                          BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                            props.currentBreakdown
                          ] +
                          " groups"
                        }
                      >
                        Compare across{" "}
                        {
                          BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                            props.currentBreakdown
                          ]
                        }{" "}
                        groups
                      </span>
                      .
                    </Alert>
                  </CardContent>
                </>
              )}

            {mapQueryResponse.dataIsMissing() && (
              <CardContent>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
                  }
                  geoLevel={props.fips.getChildFipsTypeDisplayName()}
                />
              </CardContent>
            )}
            {!mapQueryResponse.dataIsMissing() &&
              dataForActiveBreakdownFilter.length === 0 && (
                <CardContent>
                  <Alert severity="warning">
                    No data available for filter: <b>{activeBreakdownFilter}</b>
                  </Alert>
                </CardContent>
              )}

            {metricConfig && (
              <CardContent>
                <ChoroplethMap
                  useSmallSampleMessage={
                    !mapQueryResponse.dataIsMissing() &&
                    (props.variableConfig.surveyCollectedData || false)
                  }
                  signalListeners={signalListeners}
                  metric={metricConfig}
                  legendTitle={metricConfig.fullCardTitleName}
                  data={
                    listExpanded
                      ? highestRatesList.concat(lowestRatesList)
                      : dataForActiveBreakdownFilter
                  }
                  hideMissingDataTooltip={listExpanded}
                  legendData={dataForActiveBreakdownFilter}
                  hideLegend={
                    mapQueryResponse.dataIsMissing() ||
                    dataForActiveBreakdownFilter.length <= 1
                  }
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="quantile"
                  geoData={geoData}
                  // include card title, selected sub-group if any, and specific location in SAVE AS PNG filename
                  filename={`${metricConfig.fullCardTitleName}${
                    activeBreakdownFilter === "All"
                      ? ""
                      : ` for ${activeBreakdownFilter}`
                  } in ${props.fips.getDisplayName()}${
                    // include the state name if the location is a county
                    props.fips.isCounty()
                      ? `, ${props.fips.getParentFips().getFullDisplayName()}`
                      : ""
                  }`}
                />
                {/* generate additional VEGA canvases for territories on national map */}
                {props.fips.isUsa() && (
                  <div className={styles.TerritoryCirclesContainer}>
                    {TERRITORY_CODES.map((code) => {
                      const fips = new Fips(code);
                      return (
                        <div className={styles.TerritoryCircle} key={code}>
                          <ChoroplethMap
                            useSmallSampleMessage={
                              !mapQueryResponse.dataIsMissing() &&
                              (props.variableConfig.surveyCollectedData ||
                                false)
                            }
                            signalListeners={signalListeners}
                            metric={metricConfig}
                            legendTitle={metricConfig.fullCardTitleName}
                            data={
                              listExpanded
                                ? highestRatesList.concat(lowestRatesList)
                                : dataForActiveBreakdownFilter
                            }
                            hideMissingDataTooltip={listExpanded}
                            legendData={dataForActiveBreakdownFilter}
                            hideLegend={true}
                            hideActions={true}
                            showCounties={props.fips.isUsa() ? false : true}
                            fips={fips}
                            scaleType="quantile"
                            geoData={geoData}
                            overrideShapeWithCircle={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {!mapQueryResponse.dataIsMissing() &&
                  dataForActiveBreakdownFilter.length > 1 && (
                    <HighestLowestList
                      variableConfig={props.variableConfig}
                      metricConfig={metricConfig}
                      listExpanded={listExpanded}
                      setListExpanded={setListExpanded}
                      highestRatesList={highestRatesList}
                      lowestRatesList={lowestRatesList}
                      fipsTypePluralDisplayName={props.fips.getPluralChildFipsTypeDisplayName()}
                    />
                  )}
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
