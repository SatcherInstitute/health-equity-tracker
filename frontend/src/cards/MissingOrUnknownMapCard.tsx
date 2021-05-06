import React from "react";
import { Fips } from "../data/utils/Fips";
import { VariableConfig } from "../data/config/MetricConfig";
import { BreakdownVar } from "../data/query/Breakdowns";
import { MissingDataMapCard } from "./MissingDataMapCard";
import { UnknownsMapCard } from "./UnknownsMapCard";

export interface MissingOrUnknownMapCardProps {
  // Variable the map will evaluate for unknowns
  variableConfig: VariableConfig;
  // Breakdown value to evaluate for unknowns
  currentBreakdown: BreakdownVar;
  // Geographic region of maps
  fips: Fips;
  // Updates the madlib
  updateFipsCallback: (fips: Fips) => void;
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function MissingOrUnknownMapCard(props: MissingOrUnknownMapCardProps) {
  return (
    <MissingOrUnknownMapCardWithKey
      key={props.currentBreakdown + props.variableConfig.variableId}
      {...props}
    />
  );
}

function MissingOrUnknownMapCardWithKey(props: MissingOrUnknownMapCardProps) {
  if (props.variableConfig.swapMissingDataForUnknownsMap) {
    return <MissingDataMapCard {...props} />;
  } else {
    return <UnknownsMapCard {...props} />;
  }
}
