import DataSourceListing from './DataSourceListing'
import {
  type DataSourceId,
  dataSourceMetadataMap,
} from '../../data/config/MetadataMap'
import type { DataSourceMetadata } from '../../data/utils/DatasetTypes'
import {
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
} from '../../utils/internalRoutes'
import { WithMetadata } from '../../data/react/WithLoadingOrErrorUI'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { DATA_SOURCE_PRE_FILTERS, useSearchParams } from '../../utils/urlutils'
import HetCTABig from '../../styles/HetComponents/HetCTABig'

// Map of filter id to list of datasets selected by that filter, or empty list
// for filters that don't have anything selected.
type Filters = Record<string, DataSourceId[]>

// The id of the filter by dataset name. This is the only one that supports
// pre-filtering from url params.
const NAME_FILTER_ID = 'name_filter'

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

  const activeFilter = {
    [NAME_FILTER_ID]: datasets as DataSourceId[],
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Data Downloads - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Data Downloads</h2>
      <div className='mx-auto min-h-full max-w-md flex-col p-10'>
        <header className='pb-2'>
          <h3
            id='main'
            className='m-0 font-serif text-smallHeader font-light leading-lhSomeSpace text-altBlack'
          >
            View and download Health Equity Tracker data sources
          </h3>
          <p className='text-small'>
            Here you can access and download the data sources that are displayed
            in the charts on the Health Equity Tracker. Want to explore what
            each data set can show us about different health outcomes?{' '}
            <a href={EXPLORE_DATA_PAGE_LINK}>Explore the data dashboard</a>
            <span aria-hidden={true}>.</span>
          </p>
        </header>
        <ul className='list-none pl-0'>
          <WithMetadata>
            {(datasetMetadata) => {
              const filteredDatasets = getFilteredSources(
                dataSourceMetadataMap,
                activeFilter,
              )
              // Check if more than the default filters are enabled to see if you're viewing
              // a subset of sources
              const viewingSubsetOfSources =
                Object.keys(activeFilter).length > 1 ||
                activeFilter[NAME_FILTER_ID].length > 0

              return (
                <>
                  {filteredDatasets.map((sourceId, index) => (
                    <li key={sourceId}>
                      <DataSourceListing
                        key={dataSourceMetadataMap[sourceId].id}
                        source_metadata={dataSourceMetadataMap[sourceId]}
                        dataset_metadata={datasetMetadata}
                      />
                    </li>
                  ))}
                  {viewingSubsetOfSources && (
                    <HetCTABig href={DATA_CATALOG_PAGE_LINK} className='mt-10'>
                      View All Datasets
                    </HetCTABig>
                  )}
                </>
              )
            }}
          </WithMetadata>
        </ul>
      </div>
    </HelmetProvider>
  )
}
