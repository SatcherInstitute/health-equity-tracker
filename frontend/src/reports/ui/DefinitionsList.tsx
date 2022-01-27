import React from "react";

export default function DefinitionsList(props: {
  definedConditions: any; //VariableConfig[];
}): JSX.Element {
  // return (
  //   <ul id="definitionsList">
  //     {props.definedConditions.map((condition: VariableConfig) => (
  //       <li key={condition.variableFullDisplayName}>
  //         <b>{condition.variableFullDisplayName}</b>
  //         {": "}
  //         {condition.variableDefinition}
  //       </li>
  //     ))}
  //   </ul>
  // );

  return (
    <div id="definitionsList">
      {props.definedConditions.map((category: any) => {
        return (
          <>
            <b>{category.categoryTitle}</b>
            {category.categoryDefinition && (
              <p>{category.categoryDefinition}</p>
            )}
            <ul>
              {category.categoryConditions.map((conditions: any) => {
                console.log(conditions);
                return conditions.map((condition: any) => {
                  return (
                    <li key={condition.conditionName}>
                      <b>{condition.conditionName}</b>
                      {": "}
                      {condition.conditionDefinition}
                    </li>
                  );
                });
              })}
            </ul>
          </>
        );
      })}
    </div>
  );
}
