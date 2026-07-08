import AnimateHeight from 'react-animate-height'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  formatFieldValue,
  isPctType,
} from '../../data/config/MetricConfigUtils'
import type { DemographicType } from '../../data/query/Breakdowns'
import {
  AGE,
  ALL,
  type DemographicGroup,
  TIME_PERIOD_LABEL,
} from '../../data/utils/Constants'
import { makeA11yTableData } from '../../data/utils/DatasetTimeUtils'
import type { HetRow } from '../../data/utils/DatasetTypes'
import HetExpandableBoxButton from '../../styles/HetComponents/HetExpandableBoxButton'
import HetTable from '../../styles/HetComponents/HetTable'
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
  knownsData: HetRow[]
  unknownsData: HetRow[]
  demographicType: DemographicType
  knownMetricConfig: MetricConfig
  unknownMetricConfig?: MetricConfig
  selectedGroups: DemographicGroup[]
  hasUnknowns: boolean
  isCompareCard?: boolean
}

export default function AltTableView(props: AltTableViewProps) {
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

  const safeLabel = props.tableCaption.replaceAll(' ', '-')

  const uniqueId = `${safeLabel}-${
    props.isCompareCard
      ? ALT_TABLE_VIEW_2_PARAM_KEY
      : ALT_TABLE_VIEW_1_PARAM_KEY
  }`

  const dataColumnLabel = props.knownMetricConfig.shortLabel

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
          isPctType(props.knownMetricConfig.type)
        return [
          key,
          isTimePeriod
            ? row[key]
            : formatFieldValue(
                props.knownMetricConfig.type,
                row[key],
                !appendPct,
              ),
        ]
      }),
    ),
  )

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className='hide-on-screenshot mx-2 mt-4 rounded-md bg-standard-info text-left'
      id={uniqueId}
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
          <HetTable
            rows={hetRows}
            columns={hetColumns}
            caption={props.tableCaption}
            variant='methodology'
            stickyHeader
            size='small'
          />
          <p className='m-0 p-4'>
            View and download full .csv files on the{' '}
            <a href={DATA_CATALOG_PAGE_LINK}>Downloads page.</a>
          </p>
        </>
      )}
    </AnimateHeight>
  )
}
