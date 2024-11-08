import { useState } from 'react'
import type {
  DataSourceMetadata,
  MapOfDatasetMetadata,
  DatasetMetadata,
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

import {
  GetApp as GetAppIcon,
  CheckCircle as CheckCircleIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material'

import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'

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
      className='rounded-md border border-solid border-altGreen shadow-raised-tighter bg-white p-12 md:px-20 md:pb-10 md:pt-14 group my-8 text-left hover:shadow-raised group transition-all duration-300 ease-in-out'
      data-testid={props.source_metadata.id}
    >
      <h3 className='my-0 text-title md:text-smallestHeader font-bold md:font-medium leading-lhSomeMoreSpace'>
        <a
          href={props.source_metadata.data_source_link}
          target='_blank'
          rel='noopener noreferrer'
          className='no-underline hover:underline'
        >
          {props.source_metadata.data_source_name}
        </a>
      </h3>
      <ul className='list-none flex flex-col my-4 mx-0 px-0 md:my-8 md:gap-1'>
        {props.source_metadata.time_period_range && (
          <li className='flex md:flex-row flex-col justify-start items-center mb-2 text-small'>
            <p className='my-0 xs:mb-1 text-altBlack font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
              Time Series Range
            </p>
            <p className='my-0 pl-0 xs:pl-2 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
              {props.source_metadata.time_period_range}
            </p>
          </li>
        )}

        <li className='flex md:flex-row flex-col justify-start items-center mb-2 text-small'>
          <p className='my-0 xs:mb-1 text-altBlack font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Geographic Level
          </p>
          <p className='my-0 pl-0 xs:pl-2 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
            {props.source_metadata.geographic_level}
          </p>
        </li>
        <li className='flex md:flex-row flex-col justify-start items-center mb-2 text-small'>
          <p className='my-0 xs:mb-1 text-altBlack font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Demographic Granularity
          </p>
          <p className='my-0 pl-0 xs:pl-2 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
            {props.source_metadata.demographic_granularity}
          </p>
        </li>
        <li className='flex md:flex-row flex-col justify-start items-center mb-2 text-small'>
          <p className='my-0 xs:mb-1 text-altBlack font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Update Frequency
          </p>
          <p className='my-0 pl-0 xs:pl-2 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
            {props.source_metadata.update_frequency}
          </p>
        </li>
        <li className='flex md:flex-row flex-col justify-start items-center mb-2 text-small'>
          <p className='my-0 xs:mb-1 text-altBlack font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Source Website
          </p>
          <a
            href={props.source_metadata.data_source_link}
            target='_blank'
            rel='noopener noreferrer'
            className='my-0 pl-0 xs:pl-2 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal no-underline hover:underline'
          >
            {props.source_metadata.data_source_pretty_site_name}
          </a>
        </li>
      </ul>
      <p className='leading-lhSomeSpace my-0 md:my-4 text-smallest sm:text-small lg:text-text'>
        {props.source_metadata.description}
      </p>
      <div className='xs:flex md:inline md:flex-row md:justify-start md:items-center mt-8 lg:gap-1 xs:flex-col-reverse gap-2'>
        {props.source_metadata.downloadable_data_dictionary && (
          <HetLinkButton
            href='/data_dictionaries/medicare_population.csv'
            className='font-bold text-center leading-lhNormal py-0 px-0'
            buttonClassName='w-auto mx-auto md:w-auto md:mr-4 md:ml-0 px-0 pt-2 pb-4'
            ariaLabel={'Download ' + props.source_metadata.data_source_name}
          >
            <SaveAltIcon className='pt-1 pr-2 pl-0' />
            Download data dictionary
          </HetLinkButton>
        )}
        {props.source_metadata.downloadable && (
          <HetButtonSecondary
            className='md:mr-auto md:ml-0 mx-auto py-4 leading-lhNormal'
            text='View downloadable tables'
            onClick={() => {
              setDialogIsOpen(true)
            }}
            ariaLabel={`'Download ${props.source_metadata.data_source_name}`}
            href={''}
          />
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
              <h4 className='mt-8 text-exploreButton font-medium leading-lhSomeMoreSpace'>
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
