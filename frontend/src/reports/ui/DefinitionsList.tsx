/* 
Receives list of variable objects for which definitions should be displayed;
Retrieves their parent categories (with optional category definitions)
*/

import React from "react";
import { DropdownVarId, VariableConfig } from "../../data/config/MetricConfig";
import { CATEGORIES_LIST, Category } from "../../utils/MadLibs";

export interface DefinitionsListProps {
  variablesToDefine: [string, VariableConfig[]][];
}

export default function DefinitionsList(
  props: DefinitionsListProps
): JSX.Element {
  // collect relevant categories
  let relevantCategoriesSet: Set<Category> = new Set();
  props.variablesToDefine.forEach((variable) => {
    const matchingCategory = CATEGORIES_LIST.find((category) =>
      category.options.includes(variable[0] as DropdownVarId)
    );
    matchingCategory && relevantCategoriesSet.add(matchingCategory);
  });
  const relevantCategories: Category[] = Array.from(relevantCategoriesSet);

  return (
    <div id="definitionsList">
      {/* for each category */}
      {relevantCategories.map((category: Category) => {
        // sort requested variables into their categories
        const variablesForThisCategory = props.variablesToDefine.filter(
          (variable: any) => category.options.includes(variable[0])
        );
        return (
          <div key={category.title}>
            {/* display category name and optional category definition */}
            <b>{category.title}</b>
            {category.definition && <p>{category.definition}</p>}

            <ul>
              {
                // for all matching conditions
                variablesForThisCategory.map((variable) => {
                  // list their data types and definitions
                  return variable[1].map((dataType: VariableConfig) => {
                    return (
                      <li key={dataType.variableFullDisplayName}>
                        <b>{dataType.variableFullDisplayName}</b>
                        {": "}
                        {dataType.variableDefinition}
                      </li>
                    );
                  });
                })
              }
            </ul>
          </div>
        );
      })}
    </div>
  );
}
