import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import {
  GetApp as GetAppIcon,
  CheckCircle as CheckCircleIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material'
import HetNotice from './HetNotice'
import HetCloseButton from './HetCloseButton'
import HetButtonSecondary from './HetButtonSecondary'
import HetLinkButton from './HetLinkButton'
import downloadDataset from '../../pages/DataCatalog/downloadDataset'
import type { DatasetMetadata } from '../../data/utils/DatasetTypes'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'

type LoadStatus = 'loading' | 'unloaded' | 'error' | 'loaded'

interface HetDataProfileProps {
  description: string
  name: string
  acronym?: string
  prettySiteName: string
  link: string
  geographicLevel: string
  demographicGranularity: string
  updateFrequency: string
  downloadable: boolean
  downloadableBlurb?: string
  downloadableDataDictionary?: boolean
  timePeriodRange?: string | undefined
  datasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode>
  datasetMetadata: Record<string, DatasetMetadata>
}

function DownloadDatasetListItem({
  datasetId,
  datasetMetadata,
}: {
  datasetId: DatasetId | DatasetIdWithStateFIPSCode
  datasetMetadata: DatasetMetadata
}) {
  const [downloadStatus, setDownloadStatus] = useState<LoadStatus>('unloaded')

  const download = async () => {
    setDownloadStatus('loading')
    try {
      const state = await downloadDataset(datasetId)
      setDownloadStatus(state ? 'loaded' : 'error')
    } catch (error) {
      setDownloadStatus('error')
    }
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
        return null
      default:
        return null
    }
  }

  if (!datasetMetadata) {
    return (
      <HetNotice kind='health-crisis'>
        Dataset metadata missing for dataset ID: {datasetId}.
      </HetNotice>
    )
  }

  return (
    <ListItem button onClick={download} key={datasetId}>
      {downloadStatus !== 'error' ? (
        <>
          <ListItemIcon>{getIcon()}</ListItemIcon>
          <ListItemText
            primary={`${datasetMetadata.name}.csv`}
            secondary={`Last updated: ${datasetMetadata.original_data_sourced}`}
          />
        </>
      ) : (
        <HetNotice kind='health-crisis'>
          Error downloading {datasetMetadata.name}.
        </HetNotice>
      )}
    </ListItem>
  )
}

export function HetDataProfile(props: HetDataProfileProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const {
    description,
    name,
    prettySiteName,
    link,
    geographicLevel,
    demographicGranularity,
    updateFrequency,
    downloadable,
    downloadableDataDictionary,
    timePeriodRange,
    datasetIds,
    datasetMetadata,
    acronym,
  } = props

  return (
    <article
      className='rounded-md border border-solid border-altGreen shadow-raised-tighter bg-white p-12 md:px-20 md:pb-10 md:pt-14 group my-8 text-left hover:shadow-raised group transition-all duration-300 ease-in-out'
      aria-labelledby={`${acronym} data source profile}`}
    >
      <h2 className='my-0 text-title md:text-smallestHeader font-bold md:font-medium leading-lhSomeMoreSpace'>
        {name}
      </h2>

      <div className='flex flex-col my-4 md:my-8 md:gap-1'>
        {timePeriodRange && (
          <div className='flex md:flex-row flex-col justify-start items-center gap-1 md:gap-4 mb-2 text-small'>
            <p className='my-0 text-altGreen font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
              Time-Series Range
            </p>
            <p className='pl-2 my-0 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
              {timePeriodRange}
            </p>
          </div>
        )}

        <div className='flex md:flex-row flex-col justify-start items-center gap-1 md:gap-4 mb-2 text-small'>
          <p className='my-0 text-altGreen font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Geographic Level
          </p>
          <p className='pl-2 my-0 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
            {geographicLevel}
          </p>
        </div>

        <div className='flex md:flex-row flex-col justify-start items-center gap-1 md:gap-4 mb-2 text-small'>
          <p className='my-0 text-altGreen font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Demographic Granularity
          </p>
          <p className='pl-2 my-0 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
            {demographicGranularity}
          </p>
        </div>

        <div className='flex md:flex-row flex-col justify-start items-center gap-1 md:gap-4 mb-2 text-small'>
          <p className='my-0 text-altGreen font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Update Frequency
          </p>
          <p className='pl-2 my-0 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal'>
            {updateFrequency}
          </p>
        </div>

        <div className='flex md:flex-row flex-col justify-start items-center gap-1 md:gap-4 mb-2 text-small'>
          <p className='my-0 text-altGreen font-semibold w-full md:min-w-1/3 md:w-1/3 leading-lhNormal'>
            Source Website
          </p>
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Link to ${name}`}
            className='pl-2 my-0 ml-auto w-full md:w-7/12 md:max-w-2/3 leading-lhNormal no-underline hover:underline'
          >
            {prettySiteName}
          </a>
        </div>
      </div>

      <p className='leading-lhSomeSpace my-0 md:my-4 text-smallest sm:text-small lg:text-text'>
        {description}
      </p>

      <div className='flex md:flex-row md:justify-start md:items-center mt-8 lg:gap-4 flex-col-reverse gap-2'>
        {downloadableDataDictionary && (
          <HetLinkButton
            href='/data_dictionaries/medicare_population.csv'
            className='font-bold py-0 px-0 text-center leading-lhNormal'
            buttonClassName='w-auto md:w-1/2 mx-auto lg:w-auto lg:mr-2 lg:ml-0 px-0'
            ariaLabel='Download data dictionary'
          >
            <SaveAltIcon className='pr-2' />
            Download data dictionary
          </HetLinkButton>
        )}

        {downloadable && (
          <HetButtonSecondary
            className='md:mr-auto md:ml-0 mx-auto leading-lhNormal'
            text='View downloadable tables'
            onClick={() => setDialogIsOpen(true)}
            ariaLabel='View downloadable tables'
          />
        )}
      </div>

      <Dialog
        onClose={() => setDialogIsOpen(false)}
        open={dialogIsOpen}
        aria-labelledby='download-dialog-title'
      >
        <DialogTitle
          id='download-dialog-title'
          className='flex justify-between'
        >
          <header className='flex w-8/12 sm:w-10/12'>
            <h3 className='mt-8 text-exploreButton font-medium leading-lhSomeMoreSpace'>
              Available breakdowns for {name}
            </h3>
          </header>
          <HetCloseButton
            onClick={() => setDialogIsOpen(false)}
            ariaLabel='Close dialog'
          />
        </DialogTitle>
        <List>
          {datasetIds.map((datasetId) => (
            <DownloadDatasetListItem
              key={datasetId}
              datasetId={datasetId}
              datasetMetadata={datasetMetadata[datasetId]}
            />
          ))}
        </List>
      </Dialog>
    </article>
  )
}

export default HetDataProfile
