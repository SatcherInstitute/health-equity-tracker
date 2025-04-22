/*
Receives list of dataType objects for which definitions should be displayed;
Retrieves their parent categories (with optional category definitions)
*/

import type { DropdownVarId } from '../../data/config/DropDownIds'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { CATEGORIES_LIST, type Category } from '../../utils/MadLibs'
import InfoCitations from './InfoCitations'

interface DefinitionsListProps {
  dataTypesToDefine: Array<[string, DataTypeConfig[]]>
}

export default function DefinitionsList(
  props: DefinitionsListProps,
): JSX.Element {
  // collect relevant categories
  const relevantCategoriesSet = new Set<Category>()
  props.dataTypesToDefine.forEach((dataType) => {
    const matchingCategory = CATEGORIES_LIST.find((category) =>
      category.options.includes(dataType[0] as DropdownVarId),
    )
    matchingCategory && relevantCategoriesSet.add(matchingCategory)
  })
  const relevantCategories: Category[] = Array.from(relevantCategoriesSet)

  return (
    <div id='definitionsList'>
      {/* for each category */}
      {relevantCategories.map((category: Category) => {
        // sort requested dataTypes into their categories
        const dataTypesForThisCategory = props.dataTypesToDefine.filter(
          (dataType: any) => category.options.includes(dataType[0]),
        )

        return (
          <aside key={category.title} className='px-5 pb-10'>
            {/* display category name and optional category definition */}
            <h3 className='m-0 pb-5 font-semibold text-title'>
              {category.title}
            </h3>
            {category.definition && <p>{category.definition}</p>}

            <ul>
              {
                // for all matching conditions
                dataTypesForThisCategory.map((dataType) => {
                  // list their data types and definitions
                  return dataType[1].map((dataTypeConfig: DataTypeConfig) => {
                    const hasAddedInfo = Boolean(dataTypeConfig?.description)
                    return (
                      <li
                        key={dataTypeConfig?.fullDisplayName}
                        className='pt-1'
                      >
                        <HetTerm>
                          {dataTypeConfig?.fullDisplayName ?? 'Data Type'}
                        </HetTerm>
                        <ul className='list-outside list-disc pl-5'>
                          <li>
                            {hasAddedInfo && (
                              <>
                                <span>Measurement Definition:</span>{' '}
                              </>
                            )}

                            {dataTypeConfig.definition?.text}
                            <InfoCitations
                              citations={dataTypeConfig.definition?.citations}
                            />
                          </li>
                          {hasAddedInfo && (
                            <li>
                              <span>Clinical Importance:</span>{' '}
                              {dataTypeConfig.description?.text}
                              <InfoCitations
                                citations={
                                  dataTypeConfig.description?.citations
                                }
                              />
                            </li>
                          )}
                        </ul>
                      </li>
                    )
                  })
                })
              }
            </ul>
          </aside>
        )
      })}
    </div>
  )
}
