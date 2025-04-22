import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import { useRef } from 'react'
import CardWrapper from '../cards/CardWrapper'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { formatFieldValue, isPctType } from '../data/config/MetricConfigUtils'
import type { DemographicType } from '../data/query/Breakdowns'
import { Breakdowns } from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  AGE,
  ALL,
  type DemographicGroup,
  TIME_PERIOD_LABEL,
} from '../data/utils/Constants'
import { makeA11yTableData } from '../data/utils/DatasetTimeUtils'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'

const HASH_ID_RATES_OVER_TIME: ScrollableHashId = 'rates-over-time'

interface CustomAltTableProps {
  fips: Fips
  dataTypeConfig: DataTypeConfig
  demographicType: DemographicType
  reportTitle: string
  className?: string
  selectedTableGroups?: DemographicGroup[]
}

export default function CustomAltTable(props: CustomAltTableProps) {
  const metricConfigRates =
    props.dataTypeConfig.metrics?.per100k ??
    props.dataTypeConfig.metrics?.pct_rate ??
    props.dataTypeConfig.metrics?.index

  if (!metricConfigRates) {
    return <div>No metrics available for this configuration.</div>
  }

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
  )

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    props.dataTypeConfig.dataTypeId,
    'historical',
  )

  const queries = [ratesQuery]

  return (
    <CardWrapper
      downloadTitle={props.reportTitle}
      queries={queries}
      minHeight={400}
      reportTitle={props.reportTitle}
      scrollToHash={HASH_ID_RATES_OVER_TIME}
      className={`relative m-2 rounded-sm bg-white p-3 shadow-raised ${props.className}`}
    >
      {([queryResponseRates]) => {
        const ratesData = queryResponseRates.getValidRowsForField(
          metricConfigRates.metricId,
        )

        const [knownRatesData, unknownPctShareData] =
          splitIntoKnownsAndUnknowns(ratesData, props.demographicType)

        const accessibleData = makeA11yTableData(
          knownRatesData as HetRow[],
          unknownPctShareData as HetRow[],
          props.demographicType,
          metricConfigRates,
          undefined,
          props.selectedTableGroups ?? [ALL],
          false,
        )

        const latestTimePeriod: string = accessibleData[0][TIME_PERIOD_LABEL]
        const earliestTimePeriod: string =
          accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL]

        const tableRef = useRef(null)
        const optionalAgesPrefix = props.demographicType === AGE ? 'Ages ' : ''

        return (
          <>
            {/* Render the Table */}
            <TableContainer className='flex max-h-sm caption-top self-center overflow-auto'>
              <Table
                tabIndex={0}
                ref={tableRef}
                className='m-3 w-98p whitespace-nowrap rounded-sm border border-altDark'
                size='small'
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    {Object.keys(accessibleData[0]).map((key) => {
                      const isTimeCol = key === TIME_PERIOD_LABEL
                      const isUnknownPctCol = key.includes('with unknown ')

                      const dataColumnLabel = metricConfigRates.shortLabel

                      return (
                        <TableCell
                          key={key}
                          style={{
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                          }}
                          className='break-words border-0 border-altDark border-b bg-white leading-lhSomeSpace'
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
                  {accessibleData.map((row) => {
                    const keys = Object.keys(row)
                    return (
                      <TableRow
                        key={row[TIME_PERIOD_LABEL]}
                        className='odd:bg-tableZebra even:bg-white'
                      >
                        {keys.map((key) => {
                          const isTimePeriod = key === TIME_PERIOD_LABEL

                          const appendPct =
                            key.includes('with unknown ') ||
                            isPctType(metricConfigRates.type)
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
                                        metricConfigRates.type,
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
          </>
        )
      }}
    </CardWrapper>
  )
}
