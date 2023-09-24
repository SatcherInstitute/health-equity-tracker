import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
} from '@mui/material'
import { TIME_PERIOD_LABEL, ALL, AGE } from '../../data/utils/Constants'
import { DATA_TAB_LINK } from '../../utils/internalRoutes'
import { useRef } from 'react'
import styles from './AltTableView.module.scss'
import { type MetricConfig } from '../../data/config/MetricConfig'
import { type DemographicType } from '../../data/query/Breakdowns'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { type Row } from '../../data/utils/DatasetTypes'

interface AltTableExpandedProps {
  accessibleData: Row[]
  tableCaption: string
  demographicType: DemographicType
  knownMetricConfig: MetricConfig
}

export default function AltTableExpanded(props: AltTableExpandedProps) {
  const tableRef = useRef(null)
  const linkRef = useRef(null)

  const optionalAgesPrefix = props.demographicType === AGE ? 'Ages ' : ''

  const firstTimePeriod: string = props.accessibleData[0][TIME_PERIOD_LABEL]
  const lastTimePeriod: string =
    props.accessibleData[props.accessibleData.length - 1][TIME_PERIOD_LABEL]

  return (
    <>
      <p>
        Add or remove columns by toggling demographic groups above the chart.
      </p>
      <TableContainer className={styles.AltTableContainer}>
        <Table
          tabIndex={0}
          ref={tableRef}
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
                      optionalAgesPrefix}
                    {key.replaceAll('_', ' ')}
                    {!isTimeCol && !isUnknownPctCol && ` ${dataColumnLabel}`}
                    {isTimeCol && ` (${firstTimePeriod} - ${lastTimePeriod})`}
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
        <a href={DATA_TAB_LINK} ref={linkRef}>
          Downloads page.
        </a>
      </p>
    </>
  )
}
