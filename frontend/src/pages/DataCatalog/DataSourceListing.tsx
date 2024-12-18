import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useState } from 'react'
import type {
  DataSourceMetadata,
  DatasetMetadata,
  MapOfDatasetMetadata,
} from '../../data/utils/DatasetTypes'
import { getLogger } from '../../utils/globals'
import downloadDataset from './downloadDataset'

import {
  CheckCircle as CheckCircleIcon,
  GetApp as GetAppIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material'

import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'

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
        'Dataset metadata was missing for dataset with ID: ' + props.datasetId,
      ),
      'ERROR',
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
      className='group group my-8 rounded-md border border-altGreen border-solid bg-white p-12 text-left shadow-raised-tighter transition-all duration-300 ease-in-out hover:shadow-raised md:px-20 md:pt-14 md:pb-10'
      data-testid={props.source_metadata.id}
    >
      <h3 className='my-0 font-bold text-title leading-lhSomeMoreSpace md:font-medium md:text-smallestHeader'>
        <a
          href={props.source_metadata.data_source_link}
          target='_blank'
          rel='noopener noreferrer'
          className='no-underline hover:underline'
        >
          {props.source_metadata.data_source_name}
        </a>
      </h3>
      <ul className='mx-0 my-4 flex list-none flex-col px-0 md:my-8 md:gap-1'>
        {props.source_metadata.time_period_range && (
          <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
            <p className='my-0 xs:mb-1 w-full font-semibold text-altBlack leading-lhNormal md:w-1/3 md:min-w-1/3'>
              Time Series Range
            </p>
            <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-lhNormal md:w-7/12 md:max-w-2/3'>
              {props.source_metadata.time_period_range}
            </p>
          </li>
        )}

        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-altBlack leading-lhNormal md:w-1/3 md:min-w-1/3'>
            Geographic Level
          </p>
          <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-lhNormal md:w-7/12 md:max-w-2/3'>
            {props.source_metadata.geographic_level}
          </p>
        </li>
        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-altBlack leading-lhNormal md:w-1/3 md:min-w-1/3'>
            Demographic Granularity
          </p>
          <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-lhNormal md:w-7/12 md:max-w-2/3'>
            {props.source_metadata.demographic_granularity}
          </p>
        </li>
        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-altBlack leading-lhNormal md:w-1/3 md:min-w-1/3'>
            Update Frequency
          </p>
          <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-lhNormal md:w-7/12 md:max-w-2/3'>
            {props.source_metadata.update_frequency}
          </p>
        </li>
        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-altBlack leading-lhNormal md:w-1/3 md:min-w-1/3'>
            Source Website
          </p>
          <a
            href={props.source_metadata.data_source_link}
            target='_blank'
            rel='noopener noreferrer'
            className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-lhNormal no-underline hover:underline md:w-7/12 md:max-w-2/3'
          >
            {props.source_metadata.data_source_pretty_site_name}
          </a>
        </li>
      </ul>
      <p className='my-0 text-smallest leading-lhSomeSpace sm:text-small md:my-4 lg:text-text'>
        {props.source_metadata.description}
      </p>
      <div className='mt-8 xs:flex xs:flex-col-reverse gap-2 md:inline md:flex-row md:items-center md:justify-start lg:gap-1'>
        {props.source_metadata.downloadable_data_dictionary && (
          <HetLinkButton
            href='/data_dictionaries/medicare_population.csv'
            className='px-0 py-0 text-center font-bold leading-lhNormal'
            buttonClassName='w-auto mx-auto md:w-auto md:mr-4 md:ml-0 px-0 pt-2 pb-4'
            ariaLabel={'Download ' + props.source_metadata.data_source_name}
          >
            <SaveAltIcon className='pt-1 pr-2 pl-0' />
            Download data dictionary
          </HetLinkButton>
        )}
        {props.source_metadata.downloadable && (
          <HetButtonSecondary
            buttonClassName='md:mr-auto md:ml-0 mx-auto py-4 leading-lhNormal'
            onClick={() => {
              setDialogIsOpen(true)
            }}
            ariaLabel={`'Download ${props.source_metadata.data_source_name}`}
            href={''}
          >
            View downloadable tables
          </HetButtonSecondary>
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
              <h4 className='mt-8 font-medium text-exploreButton leading-lhSomeMoreSpace'>
                Available breakdowns for{' '}
                {props.source_metadata.data_source_name}
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
      </div>
    </article>
  )
}

export default DataSourceListing
