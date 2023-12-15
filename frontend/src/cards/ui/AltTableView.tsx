import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { useRef } from 'react'
import AnimateHeight from 'react-animate-height'
import { type MetricConfig } from '../../data/config/MetricConfig'
import { type DemographicType } from '../../data/query/Breakdowns'
import {
  type DemographicGroup,
  TIME_PERIOD_LABEL,
  AGE,
  ALL,
} from '../../data/utils/Constants'
import { makeA11yTableData } from '../../data/utils/DatasetTimeUtils'
import { type Row } from '../../data/utils/DatasetTypes'
import { DATA_CATALOG_PAGE_LINK } from '../../utils/internalRoutes'
import {
  ALT_TABLE_VIEW_1_PARAM_KEY,
  ALT_TABLE_VIEW_2_PARAM_KEY,
} from '../../utils/urlutils'

interface AltTableViewProps {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  expandBoxLabel: string
  tableCaption: string
  knownsData: Row[]
  unknownsData: Row[]
  demographicType: DemographicType
  knownMetricConfig: MetricConfig
  unknownMetricConfig?: MetricConfig
  selectedGroups: DemographicGroup[]
  hasUnknowns: boolean
  isCompareCard?: boolean
}

export default function AltTableView(props: AltTableViewProps) {
  const tableRef = useRef(null)
  const linkRef = useRef(null)
  const optionalAgesPrefix = props.demographicType === AGE ? 'Ages ' : ''

  const accessibleData = makeA11yTableData(
    props.knownsData,
    props.unknownsData,
    props.demographicType,
    props.knownMetricConfig,
    props.unknownMetricConfig,
    props.selectedGroups,
    props.hasUnknowns
  )

  const latestTimePeriod: string = accessibleData[0][TIME_PERIOD_LABEL]
  const earliestTimePeriod: string =
    accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL]

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className='mt-4 rounded-md bg-listbox-color text-left'
      id={
        props.isCompareCard
          ? ALT_TABLE_VIEW_2_PARAM_KEY
          : ALT_TABLE_VIEW_1_PARAM_KEY
      }
    >
      <div className='float-right'>
        <IconButton
          aria-label={`${
            !props.expanded ? 'Expand' : 'Collapse'
          } data table view of ${props.expandBoxLabel}`}
          aria-expanded={props.expanded}
          onClick={() => {
            props.setExpanded(!props.expanded)
          }}
          color='primary'
          size='large'
        >
          {props.expanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        onClick={() => {
          props.setExpanded(!props.expanded)
        }}
        aria-hidden={true}
        className={`cursor-pointer pl-4 text-left  text-smallest sm:text-text ${
          props.expanded
            ? 'px-0 py-4'
            : 'text-ellipsis whitespace-nowrap leading-lhListBoxTitle sm:overflow-hidden'
        } `}
      >
        <span>
          {!props.expanded ? 'Expand' : 'Collapse'}{' '}
          <b>{props.expandBoxLabel}</b> table
        </span>
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.expanded && (
        <>
          <p className='m-0 p-4'>
            Add or remove columns by toggling demographic groups above the
            chart.
          </p>
          <TableContainer className='flex max-h-sm caption-top self-center overflow-auto'>
            <Table
              tabIndex={0}
              ref={tableRef}
              className='border-1 rounded-xs w-98p m-3 whitespace-nowrap border-alt-dark'
              size='small'
              stickyHeader
            >
              <caption>
                <b>{props.tableCaption}</b>
              </caption>
              <TableHead>
                <TableRow>
                  {Object.keys(accessibleData[0]).map((key, i) => {
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
                        className='break-words border-0 border-b border-alt-dark bg-white leading-lhSomeSpace'
                      >
                        {!isTimeCol &&
                          key !== ALL &&
                          !isUnknownPctCol &&
                          optionalAgesPrefix}
                        {key.replaceAll('_', ' ')}
                        {!isTimeCol &&
                          !isUnknownPctCol &&
                          ` ${dataColumnLabel}`}
                        {isTimeCol &&
                          ` (${earliestTimePeriod} - ${latestTimePeriod})`}
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {accessibleData.map((row, i) => {
                  const keys = Object.keys(row)
                  return (
                    <TableRow
                      key={row[TIME_PERIOD_LABEL]}
                      className='odd:bg-table-zebra even:bg-white'
                    >
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
                                <Tooltip title='Insufficient data'>
                                  <WarningRoundedIcon />
                                </Tooltip>
                                <span className='sr-only'>
                                  Insufficient data
                                </span>
                              </>
                            ) : (
                              <>
                                {isTimePeriod ? row[key] : Math.round(row[key])}
                                {!isTimePeriod && appendPct ? '%' : ''}
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
          <p className='m-0 p-4'>
            View and download full .csv files on the{' '}
            <a href={DATA_CATALOG_PAGE_LINK} ref={linkRef}>
              Downloads page.
            </a>
          </p>
        </>
      )}
    </AnimateHeight>
  )
}
