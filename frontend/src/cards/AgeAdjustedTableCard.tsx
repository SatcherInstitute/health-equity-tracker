import React from "react";
import { AgeAdjustedTableChart } from "../charts/AgeAdjustedTableChart";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { CardContent } from "@material-ui/core";
import {
  MetricConfig,
  MetricId,
  VariableConfig,
  getAgeAdjustedRatioMetric,
  DropdownVarId,
  METRIC_CONFIG,
} from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  ALL,
  WHITE_NH,
  MULTI_OR_OTHER_STANDARD_NH,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import styles from "./Card.module.scss";
import MissingDataAlert from "./ui/MissingDataAlert";
import { METHODOLOGY_TAB_LINK } from "../utils/urlutils";
import { Link } from "react-router-dom";

/* minimize layout shift */
const PRELOAD_HEIGHT = 600;

// choose demographic groups to exclude from the table
const exclusionList = [ALL, NON_HISPANIC, WHITE_NH, MULTI_OR_OTHER_STANDARD_NH];

export interface AgeAdjustedTableCardProps {
  fips: Fips;
  variableConfig: VariableConfig;
  breakdownVar: BreakdownVar;
  dropdownVarId?: DropdownVarId;
  setVariableConfigWithParam?: Function;
}

export function AgeAdjustedTableCard(props: AgeAdjustedTableCardProps) {
  const metrics = getAgeAdjustedRatioMetric(props.variableConfig);

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    RACE,
    exclude(...exclusionList)
  );

  let metricConfigs: Record<string, MetricConfig> = {};
  metrics.forEach((metricConfig) => {
    metricConfigs[metricConfig.metricId] = metricConfig;
  });

  const metricIds = Object.keys(metricConfigs) as MetricId[];
  const query = new MetricQuery(metricIds as MetricId[], breakdowns);
  const ratioId = metricIds[0];

  const cardTitle = (
    <>{`Age-Adjusted Ratio of ${
      props.variableConfig.variableFullDisplayName
    } Compared to White (Non-Hispanic) in ${props.fips.getFullDisplayName()}`}</>
  );

  // collect data types from the currently selected condition that offer age-adjusted ratios
  const ageAdjustedDataTypes: VariableConfig[] = METRIC_CONFIG[
    props.dropdownVarId!
  ].filter((dataType) => {
    return dataType?.metrics["age_adjusted_ratio"]?.ageAdjusted;
  });

  return (
    <CardWrapper
      isAgeAdjustedTable={true}
      minHeight={PRELOAD_HEIGHT}
      queries={[query]}
      title={cardTitle}
    >
      {([queryResponse]) => {
        let knownData = queryResponse.data.filter((row: Row) => {
          return (
            // remove unknowns
            row[RACE] !== UNKNOWN &&
            row[RACE] !== UNKNOWN_RACE &&
            row[RACE] !== UNKNOWN_ETHNICITY
          );
        });

        const isWrongBreakdownVar = props.breakdownVar === "sex";
        const noRatios = knownData.every((row) => row[ratioId] === undefined);

        return (
          <>
            <CardContent>
              {/* Always show info on what age-adj is */}
              <Alert severity="info" role="note">
                Age-adjustment placeholder text.{" "}
                <Link to={METHODOLOGY_TAB_LINK}>
                  Learn how we calculated these ratios
                </Link>
                .
              </Alert>
            </CardContent>

            <Divider />

            {/*  Values are null OR demographic is SEX; implying values could be age-adjusted but aren't  */}
            {(isWrongBreakdownVar ||
              queryResponse.shouldShowMissingDataMessage(
                metricIds as MetricId[]
              )) && (
              <CardContent>
                <MissingDataAlert
                  dataName={
                    props.variableConfig.metrics.age_adjusted_ratio
                      .fullCardTitleName + " "
                  }
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </CardContent>
            )}

            {/* Values are intentionally undefined; implying they can't/won't be age-adjusted */}
            {!queryResponse.shouldShowMissingDataMessage(
              metricIds as MetricId[]
            ) &&
              noRatios && (
                <CardContent>
                  <Alert severity="warning" role="note">
                    Because outcomes for{" "}
                    <b>{props.variableConfig.variableFullDisplayName}</b> are
                    not heavily influenced by age, we do not provide
                    age-adjusted numbers.{" "}
                    {ageAdjustedDataTypes.length > 0 && (
                      <AltDataTypesMessage
                        setVariableConfigWithParam={
                          props.setVariableConfigWithParam
                        }
                        ageAdjustedDataTypes={ageAdjustedDataTypes}
                        dropdownVarId={props.dropdownVarId}
                      />
                    )}
                  </Alert>
                </CardContent>
              )}

            {/* values are present or partially null, implying we have at least some age-adjustments */}
            {!queryResponse.dataIsMissing() &&
              !noRatios &&
              props.breakdownVar !== "sex" && (
                <div className={styles.TableChart}>
                  <AgeAdjustedTableChart
                    data={knownData}
                    metrics={Object.values(metricConfigs)}
                  />
                </div>
              )}
          </>
        );
      }}
    </CardWrapper>
  );
}

interface AltDataTypesMessageProps {
  ageAdjustedDataTypes: VariableConfig[];
  setVariableConfigWithParam?: any;
  dropdownVarId?: DropdownVarId;
}

function AltDataTypesMessage(props: AltDataTypesMessageProps) {
  if (!props.ageAdjustedDataTypes) return <></>;

  return (
    <>
      Age-adjusted ratios are currently available for the following{" "}
      {props.dropdownVarId} data types:{" "}
      {props.ageAdjustedDataTypes.map((dataType, i) => {
        return (
          <span key={dataType.variableDisplayName}>
            <a
              href="#dataType"
              onClick={(e) => {
                e.preventDefault();
                props.setVariableConfigWithParam(dataType);
              }}
              role="button"
              className={styles.CompareAcrossLink}
            >
              {" "}
              <b>{dataType.variableFullDisplayName}</b>
            </a>

            {/* proper punctuation */}
            {i < props.ageAdjustedDataTypes.length - 1 && ", "}
            {i === props.ageAdjustedDataTypes.length - 1 && "."}
          </span>
        );
      })}
    </>
  );
}
