import { CardContent, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Alert from "@material-ui/lab/Alert";
import React, { useState } from "react";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { VariableConfig } from "../data/config/MetricConfig";
import { exclude, onlyInclude } from "../data/query/BreakdownFilter";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
  BreakdownVarDisplayName,
} from "../data/query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../data/query/MetricQuery";
import { AgeSorterStrategy } from "../data/sorting/AgeSorterStrategy";
import {
  ALL,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  DemographicGroup,
  RACE,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import { getHighestN, getLowestN } from "../data/utils/datasetutils";
import { Fips, TERRITORY_CODES } from "../data/utils/Fips";
import {
  COMBINED_INCARCERATION_STATES_LIST,
  COMBINED_QUALIFIER,
  PRIVATE_JAILS_QUALIFIER,
} from "../data/variables/IncarcerationProvider";
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from "../data/variables/CawpProvider";
import { useAutoFocusDialog } from "../utils/hooks/useAutoFocusDialog";
import styles from "./Card.module.scss";
import CardWrapper from "./CardWrapper";
import DropDownMenu from "./ui/DropDownMenu";
import { HighestLowestList } from "./ui/HighestLowestList";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import MissingDataAlert from "./ui/MissingDataAlert";
import { MultiMapDialog } from "./ui/MultiMapDialog";
import { MultiMapLink } from "./ui/MultiMapLink";
import { RateInfoAlert } from "./ui/RateInfoAlert";
import { findVerboseRating } from "./ui/SviAlert";
import { useGuessPreloadHeight } from "../utils/hooks/useGuessPreloadHeight";
import { createSubtitle } from "../charts/utils";
import { useLocation } from "react-router-dom";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { useCreateChartTitle } from "../utils/hooks/useCreateChartTitle";

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
  const preloadHeight = useGuessPreloadHeight([750, 1050]);

  const metricConfig = props.variableConfig.metrics["per100k"];
  const locationName = props.fips.getSentenceDisplayName();
  const currentBreakdown = props.currentBreakdown;

  const isPrison = props.variableConfig.variableId === "prison";
  const isJail = props.variableConfig.variableId === "jail";
  const isIncarceration = isJail || isPrison;

  const location = useLocation();

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id));
        location.hash = `#${HASH_ID}`;
      }
    },
  };

  const [listExpanded, setListExpanded] = useState(false);
  const [activeBreakdownFilter, setActiveBreakdownFilter] =
    useState<DemographicGroup>(ALL);

  const [smallMultiplesDialogOpen, setSmallMultiplesDialogOpen] =
    useAutoFocusDialog();

  const metricQuery = (geographyBreakdown: Breakdowns) =>
    new MetricQuery(
      metricConfig.metricId,
      geographyBreakdown
        .copy()
        .addBreakdown(
          currentBreakdown,
          currentBreakdown === RACE
            ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY)
            : exclude(UNKNOWN)
        ),
      /* variableId */ props.variableConfig.variableId
    );

  const queries = [
    metricQuery(Breakdowns.forChildrenFips(props.fips)),
    metricQuery(Breakdowns.forFips(props.fips)),
  ];

  if (!props.fips.isUsa()) {
    const sviBreakdowns = Breakdowns.byCounty().andAge(onlyInclude("All"));
    sviBreakdowns.filterFips = props.fips;

    const sviQuery = new MetricQuery(
      /* MetricId(s) */ "svi",
      /* Breakdowns */ sviBreakdowns,
      /* variableId */ "svi"
    );
    queries.push(sviQuery);
  }

  const selectedRaceSuffix = CAWP_DETERMINANTS.includes(metricConfig.metricId)
    ? ` Identifying as ${getWomenRaceLabel(activeBreakdownFilter).replace(
        "All ",
        ""
      )}`
    : "";

  let qualifierMessage = "";
  if (isPrison) qualifierMessage = COMBINED_QUALIFIER;
  if (isJail) qualifierMessage = PRIVATE_JAILS_QUALIFIER;

  let qualifierItems: string[] = [];
  if (isIncarceration) qualifierItems = COMBINED_INCARCERATION_STATES_LIST;

  const chartTitle = useCreateChartTitle(metricConfig, locationName);
  const subtitle = createSubtitle({ currentBreakdown, activeBreakdownFilter });

  const filename = `${metricConfig.chartTitle}${
    activeBreakdownFilter === "All" ? "" : ` for ${activeBreakdownFilter}`
  } in ${props.fips.getSentenceDisplayName()}`;

  const HASH_ID: ScrollableHashId = "rate-map";

  return (
    <CardWrapper
      queries={queries}
      title={<>{reportProviderSteps[HASH_ID].label}</>}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
    >
      {(queryResponses, metadata, geoData) => {
        // contains data rows for sub-geos (if viewing US, this data will be STATE level)
        const mapQueryResponse: MetricQueryResponse = queryResponses[0];
        // contains data rows current level (if viewing US, this data will be US level)
        const overallQueryResponse = queryResponses[1];
        const sviQueryResponse: MetricQueryResponse = queryResponses[2] || null;

        const sortArgs =
          props.currentBreakdown === "age"
            ? ([new AgeSorterStrategy([ALL]).compareFn] as any)
            : [];

        const fieldValues = mapQueryResponse.getFieldValues(
          /* fieldName: BreakdownVar */ props.currentBreakdown,
          /* relevantMetric: MetricId */ metricConfig.metricId
        );

        const breakdownValues = fieldValues.withData.sort.apply(
          fieldValues.withData,
          sortArgs
        );

        let dataForActiveBreakdownFilter = mapQueryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) => row[props.currentBreakdown] === activeBreakdownFilter
          );

        const dataForSvi: Row[] = sviQueryResponse
          ? sviQueryResponse
              .getValidRowsForField("svi")
              .filter((row) =>
                dataForActiveBreakdownFilter.find(
                  ({ fips }) => row.fips === fips
                )
              )
          : [];

        if (!props.fips.isUsa()) {
          dataForActiveBreakdownFilter = dataForActiveBreakdownFilter.map(
            (row) => {
              const thisCountySviRow = dataForSvi.find(
                (sviRow) => sviRow.fips === row.fips
              );
              return {
                ...row,
                rating: findVerboseRating(thisCountySviRow?.svi),
              };
            }
          );
        }

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
        const filterOptions: Record<
          BreakdownVarDisplayName,
          DemographicGroup[]
        > = {
          [BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]]:
            breakdownValues,
        };

        const hideGroupDropdown =
          Object.values(filterOptions).toString() === ALL;

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
              breakdownValuesNoData={fieldValues.noData}
            />

            <CardContent className={styles.SmallMarginContent}>
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                ariaLabel={
                  props.variableConfig.variableFullDisplayName as string
                }
                scrollToHashId={HASH_ID}
              />
            </CardContent>

            {!mapQueryResponse.dataIsMissing() && !hideGroupDropdown && (
              <>
                <Divider />
                <CardContent className={styles.SmallMarginContent}>
                  <Grid
                    container
                    justifyContent="space-between"
                    align-items="flex-end"
                  >
                    <Grid item>
                      <DropDownMenu
                        idSuffix={`-${props.fips.code}-${props.variableConfig.variableId}`}
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
                <RateInfoAlert
                  overallQueryResponse={overallQueryResponse}
                  currentBreakdown={props.currentBreakdown}
                  activeBreakdownFilter={activeBreakdownFilter}
                  metricConfig={metricConfig}
                  fips={props.fips}
                  setSmallMultiplesDialogOpen={setSmallMultiplesDialogOpen}
                  variableConfig={props.variableConfig}
                />
              )}

            {(mapQueryResponse.dataIsMissing() ||
              dataForActiveBreakdownFilter.length === 0) && (
              <CardContent>
                <MissingDataAlert
                  dataName={metricConfig.chartTitle || metricConfig.shortLabel}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
                  }
                  isMapCard={true}
                  fips={props.fips}
                />
              </CardContent>
            )}

            {!mapQueryResponse.dataIsMissing() &&
              dataForActiveBreakdownFilter.length === 0 &&
              activeBreakdownFilter !== "All" && (
                <CardContent>
                  <Alert severity="warning" role="note">
                    Insufficient data available for filter:{" "}
                    <b>{activeBreakdownFilter}</b>.{" "}
                    <MultiMapLink
                      setSmallMultiplesDialogOpen={setSmallMultiplesDialogOpen}
                      currentBreakdown={props.currentBreakdown}
                      currentVariable={
                        props.variableConfig.variableFullDisplayName
                      }
                    />
                  </Alert>
                </CardContent>
              )}

            {metricConfig && dataForActiveBreakdownFilter.length > 0 && (
              <>
                <CardContent>
                  <ChoroplethMap
                    signalListeners={signalListeners}
                    titles={{ chartTitle, subtitle }}
                    metric={metricConfig}
                    legendTitle={metricConfig.shortLabel.toLowerCase()}
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
                    scaleType="quantize"
                    geoData={geoData}
                    // include card title, selected sub-group if any, and specific location in SAVE AS PNG filename
                    filename={filename}
                  />
                  {/* generate additional VEGA canvases for territories on national map */}
                  {props.fips.isUsa() && (
                    <div className={styles.TerritoryCirclesContainer}>
                      {TERRITORY_CODES.map((code) => {
                        const fips = new Fips(code);
                        return (
                          <div className={styles.TerritoryCircle} key={code}>
                            <ChoroplethMap
                              signalListeners={signalListeners}
                              titles={{ chartTitle, subtitle }}
                              metric={metricConfig}
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
                              scaleType="quantize"
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
                        selectedRaceSuffix={selectedRaceSuffix}
                        metricConfig={metricConfig}
                        listExpanded={listExpanded}
                        setListExpanded={setListExpanded}
                        highestRatesList={highestRatesList}
                        lowestRatesList={lowestRatesList}
                        fipsTypePluralDisplayName={props.fips.getPluralChildFipsTypeDisplayName()}
                        qualifierItems={qualifierItems}
                        qualifierMessage={qualifierMessage}
                      />
                    )}
                </CardContent>
              </>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
