import { useState } from 'react'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import List from '@mui/material/List'
import HetNotice from './HetNotice'
import HetCloseButton from './HetCloseButton'
import HetButtonSecondary from './HetButtonSecondary'
import ListItemIcon from '@mui/material/ListItemIcon'
import CircularProgress from '@mui/material/CircularProgress'
import ListItemText from '@mui/material/ListItemText'
import GetAppIcon from '@mui/icons-material/GetApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type {
  DataSourceMetadata,
  DatasetMetadata,
} from '../../data/utils/DatasetTypes'
import type { DatasetId } from '../../data/config/DatasetMetadata'
import type { DatasetIdWithStateFIPSCode } from '../../data/config/DatasetMetadata'
import { ListItem } from '@mui/material'
import downloadDataset from '../../pages/DataCatalog/downloadDataset'
import HetLinkButton from './HetLinkButton'

type LoadStatus = 'loading' | 'unloaded' | 'error' | 'loaded'

interface HetDataProfileProps {
  description: string
  name: string
  acronym: string
  prettySiteName: string
  link: string
  geographicLevel: string
  demographicGranularity: string
  updateFrequency: string
  downloadable: boolean
  downloadableBlurb?: string
  downloadableDataDictionary?: boolean
  timePeriodRange: string | null
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
    const state = await downloadDataset(datasetId)
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

  return (
    <ListItem
      className='px-6 hover:cursor-pointer'
      onClick={download}
      key={datasetId}
    >
      {downloadStatus !== 'error' ? (
        <>
          <ListItemIcon>{getIcon()}</ListItemIcon>
          <ListItemText
            primary={datasetMetadata.name + '.csv'}
            secondary={'Last updated: ' + datasetMetadata.original_data_sourced}
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

export function HetDataProfile({
  description,
  name,
  acronym,
  prettySiteName,
  link,
  geographicLevel,
  demographicGranularity,
  updateFrequency,
  downloadable,
  downloadableBlurb,
  downloadableDataDictionary,
  timePeriodRange,
  datasetIds,
  datasetMetadata,
}: HetDataProfileProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  return (
    <article className='rounded-md border border-solid border-altGreen shadow-raised-tighter bg-white px-20 pb-10 pt-14 group my-8 text-left hover:shadow-raised group transition-all duration-300 ease-in-out'>
      <h2 className='my-0 text-smallestHeader font-medium leading-lhSomeMoreSpace'>
        {name}
      </h2>

      <div className='flex md:flex-col my-8'>
        {timePeriodRange && (
          <div className='flex gap-4'>
            <p className='flex my-0 text-altGreen font-semibold min-w-1/3 w-1/3'>
              Time-Series Range
            </p>
            <p className='flex my-0 w-full max-w-2/3'>{timePeriodRange}</p>
          </div>
        )}

        <div className='flex gap-4'>
          <p className='flex my-0 text-altGreen font-semibold min-w-1/3 w-1/3'>
            Geographic Level
          </p>
          <p className='flex my-0 w-full max-w-2/3'>{geographicLevel}</p>
        </div>
        <div className='flex gap-4'>
          <p className='flex my-0 text-altGreen font-semibold min-w-1/3 w-1/3'>
            Demographic Granularity
          </p>
          <p className='flex my-0 w-full max-w-2/3'>{demographicGranularity}</p>
        </div>
        <div className='flex gap-4'>
          <p className='flex my-0 text-altGreen font-semibold min-w-1/3 w-1/3'>
            Update Frequency
          </p>
          <p className='flex my-0 w-full max-w-2/3'>{updateFrequency}</p>
        </div>
        <div className='flex gap-4'>
          <p className='flex my-0 text-altGreen font-semibold min-w-1/3 w-1/3'>
            Source Website
          </p>
          <a
            href={prettySiteName}
            aria-label={`Link to ${name}`}
            className='flex my-0 no-underline w-full max-w-2/3'
          >
            {prettySiteName}
          </a>
        </div>
      </div>
      <p className='leading-lhSomeSpace my-4'>{description}</p>
      {downloadable && (
        <div className='mt-8 text-left'>
          <HetButtonSecondary
            text='View downloadable tables'
            onClick={() => setDialogIsOpen(true)}
            href={''}
          />
        </div>
      )}
      {downloadableDataDictionary && (
        <HetLinkButton href='/data_dictionaries/medicare_population.csv'>
          Download data dictionary
        </HetLinkButton>
      )}

      <Dialog onClose={() => setDialogIsOpen(false)} open={dialogIsOpen}>
        <DialogTitle className='flex justify-between'>
          <header className='flex w-8/12 sm:w-10/12'>
            <h3 className='mt-8 text-exploreButton font-medium leading-lhSomeMoreSpace'>
              Available breakdowns for {name}
            </h3>
          </header>
          <HetCloseButton
            onClick={() => setDialogIsOpen(false)}
            ariaLabel='close dialogue'
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
