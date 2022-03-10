import React from "react";
import { Alert } from "@material-ui/lab";
import {
  AGE_ADJ,
  LinkWithStickyParams,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "../../utils/urlutils";
import { BreakdownVarDisplayName } from "../../data/query/Breakdowns";
import { Fips } from "../../data/utils/Fips";
import { DropdownVarId, VariableConfig } from "../../data/config/MetricConfig";
import { dataTypeLinkMap } from "../AgeAdjustedTableCard";

interface MissingDataAlertProps {
  dataName: string;
  breakdownString: BreakdownVarDisplayName;
  noDemographicInfo?: boolean;
  isMapCard?: boolean;
  fips: Fips;
  setVariableConfigWithParam?: Function;
  dropdownVarId?: DropdownVarId;
  ageAdjustedDataTypes?: VariableConfig[];
}

function MissingDataAlert(props: MissingDataAlertProps) {
  // conditionally render the statement based on props
  const demographicPhrase = props.noDemographicInfo
    ? " demographic information for "
    : " ";
  const breakdownPhrase = props.noDemographicInfo ? (
    " "
  ) : (
    <>
      {" "}
      broken down by <b>{props.breakdownString}</b>{" "}
    </>
  );

  // supply name of lower level geo needed to create map
  const geoPhrase =
    props.isMapCard && !props.fips.isCounty()
      ? `at the ${props.fips.getChildFipsTypeDisplayName()} level `
      : "";

  return (
    <Alert severity="warning" role="note">
      We do not currently have
      {demographicPhrase}
      <b>{props.dataName}</b>
      {breakdownPhrase}
      {geoPhrase}
      for <b>{props.fips.getDisplayName()}</b>. Learn more about how this lack
      of data impacts{" "}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
      {". "}
      {props.ageAdjustedDataTypes && props.ageAdjustedDataTypes.length > 0 && (
        <AltDataTypesMessage
          setVariableConfigWithParam={props.setVariableConfigWithParam}
          ageAdjustedDataTypes={props.ageAdjustedDataTypes}
        />
      )}
    </Alert>
  );
}

export default MissingDataAlert;

interface AltDataTypesMessageProps {
  ageAdjustedDataTypes: VariableConfig[];
  setVariableConfigWithParam?: any;
}
function AltDataTypesMessage(props: AltDataTypesMessageProps) {
  if (!props.ageAdjustedDataTypes) return <></>;
  return (
    <>
      Age-adjusted ratios are available (at the national and state levels) for
      these alternate data types:{" "}
      {props.ageAdjustedDataTypes.map((dataType, i) => {
        return (
          <span key={dataType.variableDisplayName}>
            <a href={dataTypeLinkMap[dataType.variableId] + "#" + AGE_ADJ}>
              {dataType.variableFullDisplayName}
            </a>
            {i < props.ageAdjustedDataTypes.length - 1 && ", "}
            {i === props.ageAdjustedDataTypes.length - 1 && "."}
          </span>
        );
      })}
    </>
  );
}
