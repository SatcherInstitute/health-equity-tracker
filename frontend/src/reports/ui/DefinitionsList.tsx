import { VariableConfig } from "../../data/config/MetricConfig";
import React from "react";

export default function DefinitionsList(props: {
  definedConditions: VariableConfig[];
}): JSX.Element {
  return (
    <ul>
      {props.definedConditions.map((condition: VariableConfig) => (
        <li key={condition.variableFullDisplayName}>
          <b>{condition.variableFullDisplayName}</b>
          {": "}
          {condition.variableDefinition}
        </li>
      ))}
    </ul>
  );
}
