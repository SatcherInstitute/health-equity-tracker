import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import styles from './AltTableView.module.scss'
import { ALL, TIME_PERIOD_LABEL } from '../../data/utils/Constants'
import { DATA_TAB_LINK } from '../../utils/internalRoutes'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { type Ref } from 'react'
import { type Row } from '../../data/utils/DatasetTypes'
import { type MetricConfig } from '../../data/config/MetricConfig'

interface AltTableExpandedProps {
  tableCaption: string
  tableRef: Ref<any>
  linkRef: Ref<any>
  accessibleData: Row[]
  knownMetricConfig: MetricConfig
  optionalAgesPrefix: string
  firstTimePeriod: string
  lastTimePeriod: string
}

export default function AltTableExpanded(props: AltTableExpandedProps) {
  return (
    <>
      <p>
        Add or remove columns by toggling demographic groups above the chart.
      </p>
      <TableContainer className={styles.AltTableContainer}>
        <Table
          tabIndex={0}
          ref={props.tableRef}
          className={styles.AltTable}
          size="small"
          stickyHeader
        >
          <caption>
            <b>{props.tableCaption}</b>
          </caption>
          <TableHead>
            <TableRow>
              {Object.keys(props.accessibleData[0]).map((key, i) => {
                const isTimeCol = key === TIME_PERIOD_LABEL
                const isUnknownPctCol = key.includes('with unknown ')

                const dataColumnLabel = props.knownMetricConfig.shortLabel

                return (
                  <TableCell
                    key={key}
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}
                  >
                    {!isTimeCol &&
                      key !== ALL &&
                      !isUnknownPctCol &&
                      props.optionalAgesPrefix}
                    {key.replaceAll('_', ' ')}
                    {!isTimeCol && !isUnknownPctCol && ` ${dataColumnLabel}`}
                    {isTimeCol &&
                      ` (${props.firstTimePeriod} - ${props.lastTimePeriod})`}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {props.accessibleData.map((row, i) => {
              const keys = Object.keys(row)
              return (
                <TableRow key={row[TIME_PERIOD_LABEL]}>
                  {keys.map((key, j) => {
                    const isTimePeriod = key === TIME_PERIOD_LABEL
                    const appendPct =
                      key.includes('with unknown ') ||
                      [
                        'pct_relative_inequity',
                        'pct_share',
                        'pct_rate',
                      ].includes(props.knownMetricConfig.type)
                    return (
                      <TableCell
                        key={key}
                        style={{
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                        }}
                      >
                        {row[key] == null ? (
                          <>
                            <Tooltip title="Insufficient data">
                              <WarningRoundedIcon />
                            </Tooltip>
                            <span className={styles.ScreenreaderTitleHeader}>
                              Insufficient data
                            </span>
                          </>
                        ) : (
                          <>
                            {Math.round(row[key])}
                            {!isTimePeriod && appendPct && '%'}
                          </>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <p>
        View and download full .csv files on the{' '}
        <a href={DATA_TAB_LINK} ref={props.linkRef}>
          Downloads page.
        </a>
      </p>
    </>
  )
}
