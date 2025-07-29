import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GetAppIcon from '@mui/icons-material/GetApp'
import SaveAlt from '@mui/icons-material/SaveAlt'
import { ListItemButton } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useState } from 'react'
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
import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
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
        `Dataset metadata was missing for dataset with ID: ${props.datasetId}`,
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
            primary={`${props.datasetMetadata.name}.csv`}
            secondary={`Last updated: ${props.datasetMetadata.original_data_sourced}`}
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
}

function DataSourceListing(props: DataSourceListingProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  if (props.source_metadata.hideFromUser) return <></>

  return (
    <article
      className='group my-8 rounded-md border border-alt-green border-solid bg-white p-12 text-left shadow-raised-tighter transition-all duration-300 ease-in-out hover:shadow-raised md:px-20 md:pt-14 md:pb-10'
      data-testid={props.source_metadata.id}
    >
      <h2 className='my-0 font-bold text-title leading-some-more-space md:font-medium md:text-smallest-header'>
        <a
          href={props.source_metadata.data_source_link}
          target='_blank'
          rel='noopener noreferrer'
          className='no-underline hover:underline'
        >
          {props.source_metadata.data_source_name}
        </a>
      </h2>
      <ul className='mx-0 my-4 flex list-none flex-col px-0 md:my-8 md:gap-1'>
        {props.source_metadata.time_period_range && (
          <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
            <p className='my-0 xs:mb-1 w-full font-semibold text-alt-black leading-normal md:w-1/3 md:min-w-1/3'>
              Time Series Range
            </p>
            <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-normal md:w-7/12 md:max-w-2/3'>
              {props.source_metadata.time_period_range}
            </p>
          </li>
        )}

        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-alt-black leading-normal md:w-1/3 md:min-w-1/3'>
            Geographic Level
          </p>
          <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-normal md:w-7/12 md:max-w-2/3'>
            {props.source_metadata.geographic_breakdowns
              .map((geo: GeographicBreakdown) => GEO_DISPLAY_TYPES[geo])
              .join(', ')}
          </p>
        </li>
        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-alt-black leading-normal md:w-1/3 md:min-w-1/3'>
            Demographic Granularity
          </p>
          <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-normal md:w-7/12 md:max-w-2/3'>
            {props.source_metadata.demographic_breakdowns
              ?.map((d) => DEMOGRAPHIC_DISPLAY_TYPES[d])
              .join(', ')}
          </p>
        </li>
        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-alt-black leading-normal md:w-1/3 md:min-w-1/3'>
            Update Frequency
          </p>
          <p className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-normal md:w-7/12 md:max-w-2/3'>
            {props.source_metadata.update_frequency}
          </p>
        </li>
        <li className='mb-2 flex flex-col items-center justify-start text-small md:flex-row'>
          <p className='my-0 xs:mb-1 w-full font-semibold text-alt-black leading-normal md:w-1/3 md:min-w-1/3'>
            Source Website
          </p>
          <a
            href={props.source_metadata.data_source_link}
            target='_blank'
            rel='noopener noreferrer'
            className='my-0 ml-auto w-full pl-0 xs:pl-2 leading-normal no-underline hover:underline md:w-7/12 md:max-w-2/3'
          >
            {props.source_metadata.data_source_pretty_site_name}
          </a>
        </li>
      </ul>
      <p className='my-0 text-smallest leading-some-space sm:text-small md:my-4 lg:text-text'>
        {props.source_metadata.description}
      </p>
      <div className='mt-8 xs:flex xs:flex-col-reverse gap-2 md:inline md:flex-row md:items-center md:justify-start lg:gap-1'>
        {props.source_metadata.downloadable_data_dictionary && (
          <HetLinkButton
            href='/data_dictionaries/medicare_population.csv'
            className='px-0 py-0 text-center font-bold leading-normal'
            buttonClassName='w-auto mx-auto md:w-auto md:mr-4 md:ml-0 px-0 pt-2 pb-4'
            ariaLabel={`Download ${props.source_metadata.data_source_name}`}
          >
            <SaveAlt className='pt-1 pr-2 pl-0' />
            Download data dictionary
          </HetLinkButton>
        )}
        {props.source_metadata.downloadable && (
          <HetButtonSecondary
            buttonClassName='md:mr-auto md:ml-0 mx-auto py-4 leading-normal'
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
              <h4 className='mt-8 font-medium text-explore-button leading-some-more-space'>
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
