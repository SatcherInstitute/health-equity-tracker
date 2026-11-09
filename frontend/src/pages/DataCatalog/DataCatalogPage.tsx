import { useMemo, useState } from 'react'
import {
  CategoryMap,
  type CategoryTypeId,
} from '../../data/config/CategoryTypes'
import {
  type DataSourceId,
  dataSourceMetadataMap,
} from '../../data/config/MetadataMap'
import { WithMetadata } from '../../data/react/WithLoadingOrErrorUI'
import type { DataSourceMetadata } from '../../data/utils/DatasetTypes'
import HetCTASmall from '../../styles/HetComponents/HetCTASmall'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import {
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
} from '../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS, useSearchParams } from '../../utils/urlutils'
import DataSourceListing from './DataSourceListing'

// Map of filter id to list of datasets selected by that filter, or empty list
// for filters that don't have anything selected.
type Filters = Record<string, DataSourceId[]>

// The id of the filter by dataset name. This is the only one that supports
// pre-filtering from url params.
const NAME_FILTER_ID = 'name_filter'
const CATEGORY_FILTER_ID = 'category_filter'

const availableCategories = (
  Object.keys(CategoryMap) as CategoryTypeId[]
).filter((catId) =>
  Object.values(dataSourceMetadataMap).some((src) =>
    src.topic_categories?.includes(catId),
  ),
)

/**
 * Returns the ids of the sources to display based on the provided filter. The
 * displayed sources are the intersection of each filter.
 */
function getFilteredSources(
  metadata: Record<DataSourceId, DataSourceMetadata>,
  activeFilter: Filters,
): DataSourceId[] {
  const filters = Object.values(activeFilter)
  const reducer = (
    intersection: DataSourceId[],
    nextFilter: DataSourceId[],
  ) => {
    if (nextFilter.length === 0) {
      return intersection
    }
    return intersection.filter((x) => nextFilter.includes(x))
  }
  const allIds = Object.keys(metadata) as DataSourceId[]
  return filters.reduce(reducer, allIds)
}

export default function DataCatalogPage() {
  const params = useSearchParams()
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(',')
    : []

  const [activeCategories, setActiveCategories] = useState<Set<CategoryTypeId>>(
    new Set(),
  )

  const handleCategoryClick = (catId: CategoryTypeId) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return next
    })
  }

  const activeCategoryNames = useMemo(
    () => new Set([...activeCategories].map((cat) => CategoryMap[cat])),
    [activeCategories],
  )

  const categoryFilteredIds = useMemo(
    () =>
      activeCategories.size > 0
        ? Object.values(dataSourceMetadataMap)
            .filter((src) =>
              src.topic_categories?.some((cat) => activeCategories.has(cat)),
            )
            .map((src) => src.id)
        : [],
    [activeCategories],
  )

  const activeFilter = {
    [NAME_FILTER_ID]: datasets as DataSourceId[],
    [CATEGORY_FILTER_ID]: categoryFilteredIds,
  }

  return (
    <>
      <title>Data Downloads - Health Equity Tracker</title>
      <section
        id='main-content'
        className='max-w-lgplus mx-auto flex w-svw flex-col justify-center px-2 py-16 sm:px-16 md:px-24 lg:px-56'
      >
        <h1
          id='main'
          className='font-sans-title text-alt-green text-big-header leading-normal font-bold'
        >
          Data Downloads
        </h1>

        <p className='text-text'>
          Here you can access and download the data source files that are
          displayed in the charts on the Health Equity Tracker. Want to explore
          what each data set can show us about different health outcomes?
        </p>

        <HetCTASmall
          className='mx-auto w-fit font-extrabold'
          href={EXPLORE_DATA_PAGE_LINK}
        >
          Explore the data dashboard
        </HetCTASmall>

        <div className='bg-methodology-green/20 mt-10 mb-2 rounded-md p-6'>
          <p className='text-alt-black text-small my-0 mb-3 font-semibold'>
            Filter by topic
          </p>
          <div className='flex flex-wrap gap-2'>
            {availableCategories.map((catId) => {
              const isActive = activeCategories.has(catId)
              return (
                <button
                  key={catId}
                  type='button'
                  aria-pressed={isActive}
                  onClick={() => handleCategoryClick(catId)}
                  className={`font-sans-title text-tiny-tag rounded-sm border-none px-2 py-1 font-bold uppercase transition-colors duration-150 ${
                    isActive
                      ? 'bg-alt-green text-alt-white hover:bg-alt-green/80 cursor-pointer'
                      : 'bg-tiny-tag-gray text-alt-black hover:bg-methodology-green cursor-pointer'
                  }`}
                >
                  {CategoryMap[catId]}
                </button>
              )
            })}
            {activeCategories.size > 0 && (
              <button
                type='button'
                onClick={() => setActiveCategories(new Set())}
                aria-label='Clear all topic filters'
                className='border-alt-green font-sans-title text-alt-green text-tiny-tag hover:bg-alt-green/10 cursor-pointer rounded-sm border border-solid bg-transparent px-2 py-1 font-bold uppercase transition-colors duration-150'
              >
                Clear ×
              </button>
            )}
          </div>
        </div>

        <ul className='list-none pl-0'>
          <WithMetadata>
            {(datasetMetadata) => {
              const filteredDatasets = getFilteredSources(
                dataSourceMetadataMap,
                activeFilter,
              )
              const viewingSubsetOfSources =
                activeFilter[NAME_FILTER_ID].length > 0 ||
                activeCategories.size > 0

              return (
                <>
                  {filteredDatasets.map((sourceId) => (
                    <li key={sourceId}>
                      <DataSourceListing
                        key={dataSourceMetadataMap[sourceId].id}
                        source_metadata={dataSourceMetadataMap[sourceId]}
                        dataset_metadata={datasetMetadata}
                        onCategoryTagClick={handleCategoryClick}
                        activeCategoryNames={activeCategoryNames}
                      />
                    </li>
                  ))}
                  {viewingSubsetOfSources && (
                    <HetTextArrowLink
                      containerClassName='flex justify-center'
                      link={DATA_CATALOG_PAGE_LINK}
                      linkText={'View All Datasets'}
                    />
                  )}
                </>
              )
            }}
          </WithMetadata>
        </ul>
      </section>
    </>
  )
}
