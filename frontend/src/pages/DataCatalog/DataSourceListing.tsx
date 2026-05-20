import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GetAppIcon from '@mui/icons-material/GetApp'
import SaveAlt from '@mui/icons-material/SaveAlt'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useState } from 'react'
import type { CategoryTypeId } from '../../data/config/CategoryTypes'
import { CategoryMap } from '../../data/config/CategoryTypes'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  GEO_DISPLAY_TYPES,
  type GeographicBreakdown,
} from '../../data/query/Breakdowns'
import type {
  DataSourceMetadata,
  DatasetMetadata,
  MapOfDatasetMetadata,
} from '../../data/utils/DatasetTypes'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { HetTags } from '../../styles/HetComponents/HetTags'
import { getLogger } from '../../utils/globals'
import downloadDataset from './downloadDataset'

type LoadStatus = 'loading' | 'unloaded' | 'error' | 'loaded'

function DownloadDatasetListItem(props: {
  datasetId: DatasetId | DatasetIdWithStateFIPSCode
  datasetMetadata: DatasetMetadata
}) {
  const [downloadStatus, setDownloadStatus] = useState<LoadStatus>('unloaded')

  const download = async () => {
    setDownloadStatus('loading')
    const state = await downloadDataset(props.datasetId)
    setDownloadStatus(state ? 'loaded' : 'error')
  }

  const getIcon = () => {
    switch (downloadStatus) {
      case 'unloaded':
        return <GetAppIcon />
      case 'loading':
        return <CircularProgress className='h-6 w-6' aria-label='loading' />
      case 'loaded':
        return <CheckCircleIcon />
      case 'error':
        return ''
    }
  }

  if (props.datasetMetadata === undefined) {
    void getLogger().logError(
      new Error(
        'Dataset metadata was missing for dataset with ID: ' + props.datasetId,
      ),
      'ERROR',
    )
    return <></>
  }

  return (
    <ListItemButton
      className='px-6 hover:cursor-pointer'
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={async () => {
        await download()
      }}
      key={props.datasetId}
    >
      {downloadStatus !== 'error' ? (
        <>
          <ListItemIcon>{getIcon()}</ListItemIcon>
          <ListItemText
            // TODO: figure out where the period before csv is coming from
            primary={props.datasetMetadata.name + 'csv'}
            secondary={
              'Original data time range: ' +
              props.datasetMetadata.original_data_sourced
            }
          />
        </>
      ) : (
        <HetNotice kind='health-crisis'>
          Error downloading {props.datasetMetadata.name}.
        </HetNotice>
      )}
    </ListItemButton>
  )
}

interface DataSourceListingProps {
  source_metadata: DataSourceMetadata
  dataset_metadata: MapOfDatasetMetadata
  onCategoryTagClick?: (categoryId: CategoryTypeId) => void
  activeCategoryNames?: Set<string>
}

function DataSourceListing(props: DataSourceListingProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  if (props.source_metadata.hideFromUser) return <></>

  const geoSummary = props.source_metadata.geographic_breakdowns
    .map((geo: GeographicBreakdown) => GEO_DISPLAY_TYPES[geo])
    .join(', ')

  const summary = (
    <div className='flex min-w-0 flex-col gap-1.5'>
      <h2 className='my-0 font-semibold text-small leading-snug'>
        <a
          href={props.source_metadata.data_source_link}
          target='_blank'
          rel='noopener noreferrer'
          className='text-alt-green no-underline hover:underline'
        >
          {props.source_metadata.data_source_name}
        </a>
      </h2>

      {props.source_metadata.topic_categories &&
        props.source_metadata.topic_categories.length > 0 && (
          <HetTags
            tags={props.source_metadata.topic_categories.map(
              (cat) => CategoryMap[cat],
            )}
            activeTags={props.activeCategoryNames}
            onTagClick={(displayName) => {
              const catId = (
                Object.entries(CategoryMap) as [CategoryTypeId, string][]
              ).find(([, v]) => v === displayName)?.[0]
              if (catId) props.onCategoryTagClick?.(catId)
            }}
          />
        )}

      <p className='my-0 mt-0.5 text-alt-black text-tiny-tag'>
        {geoSummary}
        {props.source_metadata.update_frequency &&
          ` · ${props.source_metadata.update_frequency}`}
      </p>
    </div>
  )

  const details = (
    <>
      <ul className='mx-0 mb-3 flex list-none flex-col gap-1.5 px-0'>
        {props.source_metadata.data_source_release_years && (
          <li className='flex flex-col text-small sm:flex-row'>
            <p className='my-0 w-full font-semibold text-alt-black leading-normal sm:w-2/5'>
              Release Years
            </p>
            <p className='my-0 w-full leading-normal sm:w-3/5'>
              {props.source_metadata.data_source_release_years}
            </p>
          </li>
        )}
        {props.source_metadata.primary_data_time_period_range && (
          <li className='flex flex-col text-small sm:flex-row'>
            <p className='my-0 w-full font-semibold text-alt-black leading-normal sm:w-2/5'>
              Data Time Range
            </p>
            <p className='my-0 w-full leading-normal sm:w-3/5'>
              {props.source_metadata.primary_data_time_period_range}
            </p>
          </li>
        )}
        {props.source_metadata.demographic_breakdowns?.length > 0 && (
          <li className='flex flex-col text-small sm:flex-row'>
            <p className='my-0 w-full font-semibold text-alt-black leading-normal sm:w-2/5'>
              Demographics
            </p>
            <p className='my-0 w-full leading-normal sm:w-3/5'>
              {props.source_metadata.demographic_breakdowns
                .map((d) => DEMOGRAPHIC_DISPLAY_TYPES[d])
                .join(', ')}
            </p>
          </li>
        )}
        <li className='flex flex-col text-small sm:flex-row'>
          <p className='my-0 w-full font-semibold text-alt-black leading-normal sm:w-2/5'>
            Source Website
          </p>
          <a
            href={props.source_metadata.data_source_link}
            target='_blank'
            rel='noopener noreferrer'
            className='my-0 w-full leading-normal no-underline hover:underline sm:w-3/5'
          >
            {props.source_metadata.data_source_pretty_site_name}
          </a>
        </li>
      </ul>

      {props.source_metadata.description && (
        <p className='my-0 mb-4 text-smallest leading-relaxed'>
          {props.source_metadata.description}
        </p>
      )}

      {(props.source_metadata.downloadable ||
        props.source_metadata.downloadable_data_dictionary) && (
        <div className='flex flex-wrap gap-2'>
          {props.source_metadata.downloadable_data_dictionary && (
            <HetLinkButton
              href='/data_dictionaries/medicare_population.csv'
              className='px-0 py-0 font-bold leading-normal'
              buttonClassName='w-auto px-0 py-2'
              ariaLabel={'Download ' + props.source_metadata.data_source_name}
            >
              <SaveAlt className='pr-1 pl-0 text-base' />
              Download data dictionary
            </HetLinkButton>
          )}
          {props.source_metadata.downloadable && (
            <HetButtonSecondary
              buttonClassName='py-2 leading-normal'
              onClick={() => setDialogIsOpen(true)}
              ariaLabel={`Download ${props.source_metadata.data_source_name}`}
              href={''}
            >
              View downloadable tables
            </HetButtonSecondary>
          )}
        </div>
      )}

      {/* MODAL WITH DOWNLOADABLE FILES */}
      <Dialog onClose={() => setDialogIsOpen(false)} open={dialogIsOpen}>
        <DialogTitle className='flex justify-between'>
          <header className='flex w-8/12 sm:w-10/12'>
            <h4 className='mt-8 font-medium text-explore-button leading-some-more-space'>
              Available breakdowns for {props.source_metadata.data_source_name}
            </h4>
          </header>
          <HetCloseButton
            onClick={() => setDialogIsOpen(false)}
            ariaLabel='close dialogue'
          />
        </DialogTitle>
        <List>
          {props.source_metadata.dataset_ids.map((datasetId) => (
            <DownloadDatasetListItem
              key={datasetId}
              datasetId={datasetId}
              datasetMetadata={props.dataset_metadata[datasetId]}
            />
          ))}
        </List>
      </Dialog>
    </>
  )

  return (
    <div data-testid={props.source_metadata.id}>
      <HetAccordion
        accordionData={{ question: summary, answer: details }}
        accordionClassName='mb-0'
        summaryClassName='p-0'
        detailsClassName='p-0 pt-3'
        divClassName='py-0'
      />
    </div>
  )
}

export default DataSourceListing
