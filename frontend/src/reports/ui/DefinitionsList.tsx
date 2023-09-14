/*
Receives list of dataType objects for which definitions should be displayed;
Retrieves their parent categories (with optional category definitions)
*/

import { type DataTypeConfig } from '../../data/config/MetricConfig'
import { CATEGORIES_LIST, type Category } from '../../utils/MadLibs'

export interface DefinitionsListProps {
  dataTypesToDefine: Array<[string, DataTypeConfig[]]>
}

export default function DefinitionsList(
  props: DefinitionsListProps
): JSX.Element {
  // collect relevant categories
  const relevantCategoriesSet = new Set<Category>()
  props.dataTypesToDefine.forEach((dataType) => {
    const matchingCategory = CATEGORIES_LIST.find((category) =>
      category.options.includes(dataType[0])
    )
    matchingCategory && relevantCategoriesSet.add(matchingCategory)
  })
  const relevantCategories: Category[] = Array.from(relevantCategoriesSet)

  return (
    <div id="definitionsList">
      {/* for each category */}
      {relevantCategories.map((category: Category) => {
        // sort requested dataTypes into their categories
        const dataTypesForThisCategory = props.dataTypesToDefine.filter(
          (dataType: any) => category.options.includes(dataType[0])
        )

        return (
          <div key={category.title}>
            {/* display category name and optional category definition */}
            <b>{category.title}</b>
            {category.definition && <p>{category.definition}</p>}

            <ul>
              {
                // for all matching conditions
                dataTypesForThisCategory.map((dataType) => {
                  // list their data types and definitions
                  return dataType[1].map((dataTypeConfig: DataTypeConfig) => {
                    const hasAddedInfo = Boolean(
                      dataTypeConfig?.dataTypeDescription
                    )
                    return (
                      <li key={dataTypeConfig?.fullDisplayName}>
                        <b>{dataTypeConfig?.fullDisplayName ?? 'Data Type'}</b>
                        <ul>
                          <li>
                            {hasAddedInfo && (
                              <>
                                <b>Measurement Definition:</b>{' '}
                              </>
                            )}

                            {dataTypeConfig.dataTypeDefinition}
                          </li>
                          {hasAddedInfo && (
                            <li>
                              <b>Clinical Importance:</b>{' '}
                              {dataTypeConfig.dataTypeDescription}
                            </li>
                          )}
                        </ul>
                      </li>
                    )
                  })
                })
              }
            </ul>
          </div>
        )
      })}
    </div>
  )
}
