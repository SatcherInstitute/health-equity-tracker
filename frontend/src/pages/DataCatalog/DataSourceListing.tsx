import { useState } from 'react'
import {
  type DataSourceMetadata,
  type MapOfDatasetMetadata,
  type DatasetMetadata,
} from '../../data/utils/DatasetTypes'
import { getLogger } from '../../utils/globals'
import downloadDataset from './downloadDataset'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import CircularProgress from '@mui/material/CircularProgress'
import ListItemText from '@mui/material/ListItemText'
import GetAppIcon from '@mui/icons-material/GetApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import {
  type DatasetId,
  type DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'

export type LoadStatus = 'loading' | 'unloaded' | 'error' | 'loaded'

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
        'Dataset metadata was missing for dataset with ID: ' + props.datasetId
      ),
      'ERROR'
    )
    return <></>
  }

  return (
    <ListItem
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
            primary={props.datasetMetadata.name + '.csv'}
            secondary={
              'Last updated: ' + props.datasetMetadata.original_data_sourced
            }
          />
        </>
      ) : (
        <HetNotice kind='health-crisis'>
          Error downloading {props.datasetMetadata.name}.
        </HetNotice>
      )}
    </ListItem>
  )
}
interface DataSourceListingProps {
  source_metadata: DataSourceMetadata
  dataset_metadata: MapOfDatasetMetadata
}

export function DataSourceListing(props: DataSourceListingProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  if (props.source_metadata.hideFromUser) return <></>

  return (
    <article
      className='mb-5 w-full p-2 pt-5 shadow-raised-tighter sm:p-5'
      data-testid={props.source_metadata.id}
    >
      <h4 className='m-0 text-left font-serif text-title font-light'>
        <a
          href={props.source_metadata.data_source_link}
          target='_blank'
          rel='noopener noreferrer'
          className='no-underline hover:underline'
        >
          {props.source_metadata.data_source_name}
        </a>
      </h4>
      <ul className='list-none px-0 py-2 text-left'>
        {props.source_metadata.time_period_range && (
          <li className='pb-1 sm:flex'>
            <p className='m-0 w-full text-small font-semibold sm:w-3/12'>
              Time Series Range
            </p>
            <p className='m-0 text-small'>
              {props.source_metadata.time_period_range}
            </p>
          </li>
        )}

        <li className='pb-1 sm:flex'>
          <p className='m-0 w-full text-small font-semibold sm:w-3/12'>
            Geographic Level
          </p>
          <p className='m-0 text-small'>
            {props.source_metadata.geographic_level}
          </p>
        </li>
        <li className='pb-1 sm:flex'>
          <p className='m-0 w-full text-small font-semibold sm:w-3/12'>
            Demographic Granularity
          </p>
          <p className='m-0 text-small'>
            {props.source_metadata.demographic_granularity}
          </p>
        </li>
        <li className='pb-1 sm:flex'>
          <p className='m-0 w-full text-small font-semibold sm:w-3/12'>
            Update Frequency
          </p>
          <p className='m-0 text-small'>
            {props.source_metadata.update_frequency}
          </p>
        </li>
        <li className='pb-1 sm:flex'>
          <p className='m-0 w-full text-small font-semibold sm:w-3/12'>
            Source Website
          </p>
          <a
            href={props.source_metadata.data_source_link}
            target='_blank'
            rel='noopener noreferrer'
            className='no-underline hover:underline'
          >
            <p className='m-0 text-small'>
              {props.source_metadata.data_source_pretty_site_name}
            </p>
          </a>
        </li>
      </ul>
      <p className='text-left text-small'>
        {props.source_metadata.description}
      </p>
      <footer className='mb-2 mt-4 flex h-auto w-full flex-col justify-end sm:flex-row'>
        {props.source_metadata.downloadable && (
          <HetLinkButton
            onClick={() => {
              setDialogIsOpen(true)
            }}
            ariaLabel={'Download ' + props.source_metadata.data_source_name}
          >
            View downloadable tables
          </HetLinkButton>
        )}
        {props.source_metadata.downloadable_data_dictionary && (
          <HetLinkButton
            href='/data_dictionaries/medicare_population.csv'
            ariaLabel={'Download ' + props.source_metadata.data_source_name}
          >
            Download data dictionary
          </HetLinkButton>
        )}

        {/* MODAL WITH DOWNLOADABLE FILES */}
        <Dialog
          onClose={() => {
            setDialogIsOpen(false)
          }}
          open={dialogIsOpen}
        >
          <DialogTitle className='flex justify-between'>
            <header className='flex w-8/12 sm:w-10/12'>
              <h3 className='text-left font-serif text-title font-light'>
                Available breakdowns for{' '}
                {props.source_metadata.data_source_name}
              </h3>
            </header>
            <HetCloseButton onClick={() => setDialogIsOpen(false)} ariaLabel='close dialogue' />
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
      </footer>
    </article>
  )
}

export default DataSourceListing
