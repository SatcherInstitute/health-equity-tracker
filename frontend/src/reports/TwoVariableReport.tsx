import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment, useRef } from "react";
import LazyLoad from "react-lazyload";
import { AgeAdjustedTableCard } from "../cards/AgeAdjustedTableCard";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { MapCard } from "../cards/MapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { TableCard } from "../cards/TableCard";
import { UnknownsMapCard } from "../cards/UnknownsMapCard";
import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
  VariableId,
  COVID_VAXX,
} from "../data/config/MetricConfig";
import { BreakdownVar, DEMOGRAPHIC_BREAKDOWNS } from "../data/query/Breakdowns";
import { RACE } from "../data/utils/Constants";
import { Fips } from "../data/utils/Fips";
import {
  CardId,
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  HIGHLIGHT_SCROLL_DELAY,
  psSubscribe,
  setParameter,
  swapOldParams,
} from "../utils/urlutils";
import { highlightMatch, jumpToCard } from "./OneVariableReport";
import NoDataAlert from "./ui/NoDataAlert";
import ReportToggleControls from "./ui/ReportToggleControls";

/* Takes dropdownVar and fips inputs for each side-by-side column.
Input values for each column can be the same. */
function TwoVariableReport(props: {
  key: string;
  dropdownVarId1: DropdownVarId;
  dropdownVarId2: DropdownVarId;
  fips1: Fips;
  fips2: Fips;
  updateFips1Callback: (fips: Fips) => void;
  updateFips2Callback: (fips: Fips) => void;
  jumpToDefinitions: Function;
  jumpToData: Function;
  targetScrollRef?: CardId;
}) {
  const mapCompareRef = useRef<HTMLInputElement>(null);
  const barCompareRef = useRef<HTMLInputElement>(null);
  const unknownsCompareRef = useRef<HTMLInputElement>(null);
  const disparityCompareRef = useRef<HTMLInputElement>(null);
  const tableCompareRef = useRef<HTMLInputElement>(null);
  const ageAdjCompareRef = useRef<HTMLInputElement>(null);

  let target: any = null;

  // handle incoming #hash link request
  useEffect(() => {
    switch (props.targetScrollRef) {
      case "#map":
        /* eslint-disable react-hooks/exhaustive-deps */
        target = mapCompareRef;
        break;
      case "#bar":
        target = barCompareRef;
        break;
      case "#unknowns":
        target = unknownsCompareRef;
        break;
      case "#disparity":
        target = disparityCompareRef;
        break;
      case "#table":
        target = tableCompareRef;
        break;
      case "#age-adjusted":
        target = ageAdjCompareRef;
        break;
    }

    window.setTimeout(() => {
      jumpToCard(target);
    }, HIGHLIGHT_SCROLL_DELAY);
    // remove hash from URL
    // eslint-disable-next-line no-restricted-globals
    history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
  }, [props.targetScrollRef]);

  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, RACE)
  );

  const [variableConfig1, setVariableConfig1] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId1)
      ? METRIC_CONFIG[props.dropdownVarId1][0]
      : null
  );
  const [variableConfig2, setVariableConfig2] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId2)
      ? METRIC_CONFIG[props.dropdownVarId2][0]
      : null
  );

  const setVariableConfigWithParam1 = (v: VariableConfig) => {
    setParameter(DATA_TYPE_1_PARAM, v.variableId);
    setVariableConfig1(v);
  };

  const setVariableConfigWithParam2 = (v: VariableConfig) => {
    setParameter(DATA_TYPE_2_PARAM, v.variableId);
    setVariableConfig2(v);
  };

  const setDemoWithParam = (str: BreakdownVar) => {
    setParameter(DEMOGRAPHIC_PARAM, str);
    setCurrentBreakdown(str);
  };

  useEffect(() => {
    const readParams = () => {
      const demoParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldParams(val);
          return METRIC_CONFIG[props.dropdownVarId1].find(
            (cfg) => cfg.variableId === val
          );
        }
      );
      const demoParam2 = getParameter(
        DATA_TYPE_2_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldParams(val);
          return METRIC_CONFIG[props.dropdownVarId2].find(
            (cfg) => cfg.variableId === val
          );
        }
      );

      const demo: BreakdownVar = getParameter(DEMOGRAPHIC_PARAM, RACE);
      setVariableConfig1(
        demoParam1 ? demoParam1 : METRIC_CONFIG[props.dropdownVarId1][0]
      );
      setVariableConfig2(
        demoParam2 ? demoParam2 : METRIC_CONFIG[props.dropdownVarId2][0]
      );
      setCurrentBreakdown(demo);
    };
    const psSub = psSubscribe(readParams, "twovar");
    readParams();
    return () => {
      if (psSub) {
        psSub.unsubscribe();
      }
    };
  }, [props.dropdownVarId1, props.dropdownVarId2]);

  if (variableConfig1 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId1} />
      </Grid>
    );
  }
  if (variableConfig2 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId2} />
      </Grid>
    );
  }

  const breakdownIsShown = (breakdownVar: string) =>
    currentBreakdown === breakdownVar;

  return (
    <Grid container spacing={1} alignItems="flex-start">
      {/* POPULATION CARD(S) AND 2 SETS OF TOGGLE CONTROLS */}
      {props.fips1.code === props.fips2.code ? (
        <Grid item xs={12} id="populationCard">
          {/*  SINGLE POPULATION CARD FOR EXPLORE RELATIONSHIPS REPORT */}
          <PopulationCard jumpToData={props.jumpToData} fips={props.fips1} />

          {/* 2 SETS OF DEMOGRAPHIC AND DATA TYPE TOGGLES */}
          <Grid container>
            {!(
              props.dropdownVarId1 === COVID_VAXX && props.fips1.isCounty()
            ) && (
              <Grid item xs={12} sm={6}>
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId1}
                  variableConfig={variableConfig1}
                  setVariableConfig={setVariableConfigWithParam1}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setDemoWithParam}
                />
              </Grid>
            )}
            {!(
              props.dropdownVarId2 === COVID_VAXX && props.fips2.isCounty()
            ) && (
              <Grid item xs={12} sm={6}>
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId2}
                  variableConfig={variableConfig2}
                  setVariableConfig={setVariableConfigWithParam2}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setDemoWithParam}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      ) : (
        <>
          <Grid item xs={12} sm={6} id="populationCard">
            {/* FIRST POPULATION CARD FOR COMPARE RATES REPORT */}
            <PopulationCard jumpToData={props.jumpToData} fips={props.fips1} />
            {!(
              props.dropdownVarId1 === COVID_VAXX && props.fips1.isCounty()
            ) && (
              /* FIRST TOGGLE(S) FOR COMPARE RATES REPORT */
              <ReportToggleControls
                dropdownVarId={props.dropdownVarId1}
                variableConfig={variableConfig1}
                setVariableConfig={setVariableConfigWithParam1}
                currentBreakdown={currentBreakdown}
                setCurrentBreakdown={setDemoWithParam}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* SECOND POPULATION CARD FOR COMPARE RATES REPORT */}
            <PopulationCard jumpToData={props.jumpToData} fips={props.fips2} />
            {!(
              props.dropdownVarId2 === COVID_VAXX && props.fips2.isCounty()
            ) && (
              /* SECOND TOGGLE(S) FOR COMPARE RATES REPORT */
              <ReportToggleControls
                dropdownVarId={props.dropdownVarId2}
                variableConfig={variableConfig2}
                setVariableConfig={setVariableConfigWithParam2}
                currentBreakdown={currentBreakdown}
                setCurrentBreakdown={setDemoWithParam}
              />
            )}
          </Grid>
        </>
      )}

      {/* SIDE-BY-SIDE 100K MAP CARDS */}
      <RowOfTwoOptionalMetrics
        innerRef={mapCompareRef}
        highlightClass={highlightMatch("#map", props.targetScrollRef)}
        variableConfig1={variableConfig1}
        variableConfig2={variableConfig2}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          variableConfig: VariableConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void
        ) => (
          <MapCard
            variableConfig={variableConfig}
            fips={fips}
            updateFipsCallback={(fips: Fips) => {
              updateFips(fips);
            }}
            currentBreakdown={currentBreakdown}
            jumpToDefinitions={props.jumpToDefinitions}
            jumpToData={props.jumpToData}
          />
        )}
      />

      {/* SIDE-BY-SIDE 100K BAR GRAPH CARDS */}
      {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
        !breakdownIsShown(breakdownVar) ? null : (
          <Fragment key={breakdownVar}>
            <RowOfTwoOptionalMetrics
              innerRef={barCompareRef}
              highlightClass={highlightMatch("#bar", props.targetScrollRef)}
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <SimpleBarChartCard
                  variableConfig={variableConfig}
                  breakdownVar={breakdownVar}
                  fips={fips}
                />
              )}
            />
          </Fragment>
        )
      )}

      {/* SIDE-BY-SIDE UNKNOWNS MAP CARDS */}
      <RowOfTwoOptionalMetrics
        innerRef={unknownsCompareRef}
        highlightClass={highlightMatch("#unknowns", props.targetScrollRef)}
        variableConfig1={variableConfig1}
        variableConfig2={variableConfig2}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          variableConfig: VariableConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void
        ) => (
          <UnknownsMapCard
            overrideAndWithOr={currentBreakdown === RACE}
            variableConfig={variableConfig}
            fips={fips}
            updateFipsCallback={(fips: Fips) => {
              updateFips(fips);
            }}
            currentBreakdown={currentBreakdown}
          />
        )}
      />

      {/* SIDE-BY-SIDE DISPARITY BAR GRAPH (COMPARE TO POPULATION) CARDS */}

      {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
        !breakdownIsShown(breakdownVar) ? null : (
          <Fragment key={breakdownVar}>
            <RowOfTwoOptionalMetrics
              innerRef={disparityCompareRef}
              highlightClass={highlightMatch(
                "#disparity",
                props.targetScrollRef
              )}
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <DisparityBarChartCard
                  variableConfig={variableConfig}
                  breakdownVar={breakdownVar}
                  fips={fips}
                />
              )}
            />
          </Fragment>
        )
      )}

      {/* SIDE-BY-SIDE DATA TABLE CARDS */}
      {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
        !breakdownIsShown(breakdownVar) ? null : (
          <RowOfTwoOptionalMetrics
            innerRef={tableCompareRef}
            highlightClass={highlightMatch("#table", props.targetScrollRef)}
            key={breakdownVar}
            variableConfig1={variableConfig1}
            variableConfig2={variableConfig2}
            fips1={props.fips1}
            fips2={props.fips2}
            updateFips1={props.updateFips1Callback}
            updateFips2={props.updateFips2Callback}
            createCard={(
              variableConfig: VariableConfig,
              fips: Fips,
              updateFips: (fips: Fips) => void
            ) => (
              <TableCard
                fips={fips}
                variableConfig={variableConfig}
                breakdownVar={breakdownVar}
              />
            )}
          />
        )
      )}

      {/* SIDE-BY-SIDE AGE-ADJUSTED TABLE CARDS */}

      <RowOfTwoOptionalMetrics
        innerRef={ageAdjCompareRef}
        highlightClass={highlightMatch("#age-adjusted", props.targetScrollRef)}
        // specific data type
        variableConfig1={variableConfig1}
        variableConfig2={variableConfig2}
        // parent variable
        dropdownVarId1={props.dropdownVarId1}
        dropdownVarId2={props.dropdownVarId2}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          variableConfig: VariableConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void,
          dropdownVarId?: DropdownVarId
        ) => (
          <AgeAdjustedTableCard
            fips={fips}
            variableConfig={variableConfig}
            breakdownVar={currentBreakdown}
            dropdownVarId={dropdownVarId}
          />
        )}
      />
    </Grid>
  );
}

function RowOfTwoOptionalMetrics(props: {
  innerRef: any;
  // id: string;
  variableConfig1: VariableConfig | undefined;
  variableConfig2: VariableConfig | undefined;
  fips1: Fips;
  fips2: Fips;
  updateFips1?: (fips: Fips) => void;
  updateFips2?: (fips: Fips) => void;
  createCard: (
    variableConfig: VariableConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void,
    dropdownVarId?: DropdownVarId
  ) => JSX.Element;
  dropdownVarId1?: DropdownVarId;
  dropdownVarId2?: DropdownVarId;
  highlightClass: any;
}) {
  if (!props.variableConfig1 && !props.variableConfig2) {
    return <></>;
  }

  // Needed for type safety, used when the card does not need to use the fips update callback
  const unusedFipsCallback = () => {};

  return (
    <Grid container {...props.highlightClass}>
      <Grid ref={props.innerRef} item xs={12} sm={6}>
        <LazyLoad offset={800} once>
          {props.variableConfig1 && (
            <>
              {props.createCard(
                props.variableConfig1,
                props.fips1,
                props.updateFips1 || unusedFipsCallback,
                props.dropdownVarId1
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
      <Grid item xs={12} sm={6}>
        <LazyLoad offset={800} once>
          {props.variableConfig2 && (
            <>
              {props.createCard(
                props.variableConfig2,
                props.fips2,
                props.updateFips2 || unusedFipsCallback,
                props.dropdownVarId2
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
    </Grid>
  );
}

export default TwoVariableReport;
