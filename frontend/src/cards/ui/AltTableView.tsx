import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { useRef } from 'react'
import AnimateHeight from 'react-animate-height'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import {
  type DemographicGroup,
  TIME_PERIOD_LABEL,
  AGE,
  ALL,
} from '../../data/utils/Constants'
import { makeA11yTableData } from '../../data/utils/DatasetTimeUtils'
import type { Row } from '../../data/utils/DatasetTypes'
import { DATA_CATALOG_PAGE_LINK } from '../../utils/internalRoutes'
import {
  ALT_TABLE_VIEW_1_PARAM_KEY,
  ALT_TABLE_VIEW_2_PARAM_KEY,
} from '../../utils/urlutils'
import HetExpandableBoxButton from '../../styles/HetComponents/HetExpandableBoxButton'
import {
  formatFieldValue,
  isPctType,
} from '../../data/config/MetricConfigUtils'

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
    props.hasUnknowns,
  )

  const latestTimePeriod: string = accessibleData[0][TIME_PERIOD_LABEL]
  const earliestTimePeriod: string =
    accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL]

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className='mt-4 mx-2 rounded-md bg-listboxColor text-left'
      id={
        props.isCompareCard
          ? ALT_TABLE_VIEW_2_PARAM_KEY
          : ALT_TABLE_VIEW_1_PARAM_KEY
      }
    >
      <HetExpandableBoxButton
        expanded={props.expanded}
        setExpanded={props.setExpanded}
        expandBoxLabel={props.expandBoxLabel}
      />

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
              className='m-3 w-98p whitespace-nowrap rounded-sm border border-altDark'
              size='small'
              stickyHeader
            >
              <caption className='font-medium'>{props.tableCaption}</caption>
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
                        className='break-words border-0 border-b border-altDark bg-white leading-lhSomeSpace'
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
                      className='odd:bg-tableZebra even:bg-white'
                    >
                      {keys.map((key, j) => {
                        const isTimePeriod = key === TIME_PERIOD_LABEL

                        const appendPct =
                          key.includes('with unknown ') ||
                          isPctType(props.knownMetricConfig.type)
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
                                {isTimePeriod
                                  ? row[key]
                                  : formatFieldValue(
                                      props.knownMetricConfig.type,
                                      row[key],
                                      !appendPct,
                                    )}
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
