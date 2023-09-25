/*
Receives list of dataType objects for which definitions should be displayed;
Retrieves their parent categories (with optional category definitions)
*/

import { type DataTypeConfig } from '../../data/config/MetricConfig'
import { CATEGORIES_LIST, type Category } from '../../utils/MadLibs'
import InfoCitations from './InfoCitations'

interface DefinitionsListProps {
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

  function toLowerCaseWithHash(inputString: string) {
    return '#' + inputString.toLowerCase().replace(/ /g, '-')
  }

  return (
    <div id="definitionsList">
      {/* for each category */}
      {relevantCategories.map((category: Category) => {
        // sort requested dataTypes into their categories
        const dataTypesForThisCategory = props.dataTypesToDefine.filter(
          (dataType: any) => category.options.includes(dataType[0])
        )

        return (
          <div key={category.title} id={toLowerCaseWithHash(category.title)}>
            {/* display category name and optional category definition */}
            <b>{category.title}</b>
            {category.definition && <p>{category.definition}</p>}

            <ul>
              {
                // for all matching conditions
                dataTypesForThisCategory.map((dataType) => {
                  // list their data types and definitions
                  return dataType[1].map((dataTypeConfig: DataTypeConfig) => {
<<<<<<< HEAD
<<<<<<< HEAD
                    const hasAddedInfo = Boolean(dataTypeConfig?.description)
=======
                    const hasAddedInfo = Boolean(
                      dataTypeConfig?.dataTypeDescription
                    )
>>>>>>> cbae1314 (Hidden: Updates PHRMA definitions and methodology (#2377))
=======
                    const hasAddedInfo = Boolean(dataTypeConfig?.description)
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
                            {dataTypeConfig.definition?.text}
                            <InfoCitations
                              citations={dataTypeConfig.definition?.citations}
                            />
<<<<<<< HEAD
=======
                            {dataTypeConfig.dataTypeDefinition}
>>>>>>> cbae1314 (Hidden: Updates PHRMA definitions and methodology (#2377))
=======
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
                          </li>
                          {hasAddedInfo && (
                            <li>
                              <b>Clinical Importance:</b>{' '}
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
                              {dataTypeConfig.description?.text}
                              <InfoCitations
                                citations={
                                  dataTypeConfig.description?.citations
                                }
                              />
<<<<<<< HEAD
=======
                              {dataTypeConfig.dataTypeDescription}
>>>>>>> cbae1314 (Hidden: Updates PHRMA definitions and methodology (#2377))
=======
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
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
