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
import HetDataProfile from '../../styles/HetComponents/HetDataProfile'
import HetCTASmall from '../../styles/HetComponents/HetCTASmall'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'

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

      <section
        id='main-content'
        aria-labelledby='main-content'
        tabIndex={-1}
        className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-16 md:px-24 lg:px-56 mx-auto'
      >
        <h1
          id='main'
          tabIndex={-1}
          className='font-sansTitle text-bigHeader font-bold leading-lhNormal text-altGreen'
        >
          Data Downloads
        </h1>

        <h2 className='sr-only'>Data Downloads</h2>
        <p className='text-text'>
          Here you can access and download the data source files that are
          displayed in the charts on the Health Equity Tracker. Want to explore
          what each data set can show us about different health outcomes?
        </p>

        <HetCTASmall
          className='w-fit mx-auto font-extrabold'
          href={EXPLORE_DATA_PAGE_LINK}
        >
          Explore the data dashboard
        </HetCTASmall>

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
                  {filteredDatasets.map((sourceId) => {
                    const sourceMetadata = dataSourceMetadataMap[sourceId]
                    return (
                      <li key={sourceId}>
                        <HetDataProfile
                          description={sourceMetadata.description}
                          name={sourceMetadata.data_source_name}
                          acronym={sourceMetadata.acronym || ''}
                          prettySiteName={
                            sourceMetadata.data_source_pretty_site_name
                          }
                          link={sourceMetadata.data_source_link}
                          geographicLevel={sourceMetadata.geographic_level}
                          demographicGranularity={
                            sourceMetadata.demographic_granularity
                          }
                          updateFrequency={sourceMetadata.update_frequency}
                          downloadable={sourceMetadata.downloadable}
                          downloadableBlurb={sourceMetadata.downloadable_blurb}
                          downloadableDataDictionary={
                            sourceMetadata.downloadable_data_dictionary
                          }
                          timePeriodRange={
                            sourceMetadata.time_period_range || undefined
                          }
                          datasetIds={sourceMetadata.dataset_ids}
                          datasetMetadata={datasetMetadata}
                        />
                      </li>
                    )
                  })}
                  {viewingSubsetOfSources && (
                    <HetTextArrowLink
                      link={DATA_CATALOG_PAGE_LINK}
                      linkText='View All Datasets'
                      containerClassName='text-title justify-center'
                    />
                  )}
                </>
              )
            }}
          </WithMetadata>
        </ul>
      </section>
    </HelmetProvider>
  )
}
