import React, { useState } from 'react'
import {
  type DataSourceMetadata,
  type MapOfDatasetMetadata,
  type DatasetMetadata,
} from '../../../data/utils/DatasetTypes'
import { getLogger } from '../../../utils/globals'
import styles from './DataSourceListing.module.scss'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import downloadDataset from './downloadDataset'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ListItemText from '@mui/material/ListItemText'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GetAppIcon from '@mui/icons-material/GetApp'
import { Grid, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Link from '@mui/material/Link'

export type LoadStatus = 'loading' | 'unloaded' | 'error' | 'loaded'

function DownloadDatasetListItem(props: {
  datasetId: string
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
        return (
          <CircularProgress
            className={styles.DownloadIcon}
            aria-label="loading"
          />
        )
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
      className={styles.DownloadListItem}
      button
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
            className={styles.DownloadListItemText}
            primary={props.datasetMetadata.name + '.csv'}
            secondary={'Last updated: ' + props.datasetMetadata.update_time}
          />
        </>
      ) : (
        <Alert severity="error">
          Error downloading {props.datasetMetadata.name}.
        </Alert>
      )}
    </ListItem>
  )
}
export interface DataSourceListingProps {
  source_metadata: DataSourceMetadata
  dataset_metadata: MapOfDatasetMetadata
}

export function DataSourceListing(props: DataSourceListingProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  return (
    <Card
      elevation={3}
      className={styles.DataSourceListing}
      data-testid={props.source_metadata.id}
    >
      <Typography variant="h4" className={styles.DatasetTitle} align="left">
        <Link
          href={props.source_metadata.data_source_link}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          {props.source_metadata.data_source_name}
        </Link>
      </Typography>
      <table className={styles.MetadataTable}>
        <tbody>
          {props.source_metadata.time_period_range && (
            <tr>
              <td>
                <b>Time Series Range</b>
              </td>
              <td>{props.source_metadata.time_period_range}</td>
            </tr>
          )}

          <tr>
            <td>
              <b>Geographic Level</b>
            </td>
            <td>{props.source_metadata.geographic_level}</td>
          </tr>
          <tr>
            <td>
              <b>Demographic Granularity</b>
            </td>
            <td>{props.source_metadata.demographic_granularity}</td>
          </tr>
          <tr>
            <td>
              <b>Update Frequency</b>
            </td>
            <td>{props.source_metadata.update_frequency}</td>
          </tr>
          <tr>
            <td>
              <b>Source Website</b>
            </td>
            <td>
              <Link
                href={props.source_metadata.data_source_link}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                {props.source_metadata.data_source_pretty_site_name}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
      <p className={styles.Description}>{props.source_metadata.description}</p>
      <footer className={styles.Footer}>
        {props.source_metadata.downloadable && (
          <Button
            color="primary"
            onClick={() => {
              setDialogIsOpen(true)
            }}
            className={styles.DownloadListItem}
            aria-label={'Download ' + props.source_metadata.data_source_name}
          >
            View downloadable tables
          </Button>
        )}

        {/* MODAL WITH DOWNLOADABLE FILES */}
        <Dialog
          onClose={() => {
            setDialogIsOpen(false)
          }}
          open={dialogIsOpen}
        >
          <DialogTitle>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              component="header"
            >
              <Grid item xs={10} sm={11}>
                <Typography
                  variant="body1"
                  className={styles.DatasetTitle}
                  align="left"
                  component="h3"
                >
                  Available breakdowns for{' '}
                  {props.source_metadata.data_source_name}
                </Typography>
              </Grid>

              <Grid item xs={2} sm={1}>
                <IconButton
                  aria-label="close dialogue"
                  onClick={() => {
                    setDialogIsOpen(false)
                  }}
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
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
    </Card>
  )
}

export default DataSourceListing
