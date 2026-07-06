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
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import HetTable from '../styles/HetComponents/HetTable'
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

  return (
    <CardWrapper
      downloadTitle={props.reportTitle}
      queries={[ratesQuery]}
      minHeight={400}
      reportTitle={props.reportTitle}
      scrollToHash={HASH_ID_RATES_OVER_TIME}
      className={`relative m-2 rounded-sm bg-alt-white p-3 shadow-raised ${props.className}`}
      fips={props.fips}
      dataTypeConfig={props.dataTypeConfig}
      demographicType={props.demographicType}
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

        const optionalAgesPrefix = props.demographicType === AGE ? 'Ages ' : ''
        const dataColumnLabel = metricConfigRates.shortLabel

        const hetColumns = Object.keys(accessibleData[0]).map((key) => {
          const isTimeCol = key === TIME_PERIOD_LABEL
          const isUnknownPctCol = key.includes('with unknown ')

          let header: React.ReactNode = key.replaceAll('_', ' ')
          if (!isTimeCol && !isUnknownPctCol) {
            const prefix = key !== ALL ? optionalAgesPrefix : ''
            header = `${prefix}${key.replaceAll('_', ' ')} ${dataColumnLabel}`
          } else if (isTimeCol) {
            header = `${key.replaceAll('_', ' ')} (${earliestTimePeriod} - ${latestTimePeriod})`
          }

          return { key, header }
        })

        const hetRows = accessibleData.map((row) =>
          Object.fromEntries(
            Object.keys(row).map((key) => {
              if (row[key] == null) return [key, null]
              const isTimePeriod = key === TIME_PERIOD_LABEL
              const appendPct =
                key.includes('with unknown ') ||
                isPctType(metricConfigRates.type)
              return [
                key,
                isTimePeriod
                  ? row[key]
                  : formatFieldValue(
                      metricConfigRates.type,
                      row[key],
                      !appendPct,
                    ),
              ]
            }),
          ),
        )

        return (
          <HetTable
            rows={hetRows}
            columns={hetColumns}
            variant='methodology'
            stickyHeader
            size='small'
          />
        )
      }}
    </CardWrapper>
  )
}
