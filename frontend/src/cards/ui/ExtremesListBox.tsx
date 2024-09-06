import AnimateHeight from 'react-animate-height'
import { Grid } from '@mui/material'
import type {
  MetricConfig,
  DataTypeConfig,
} from '../../data/config/MetricConfig'
import type { Row } from '../../data/utils/DatasetTypes'
import { WHAT_DATA_ARE_MISSING_ID } from '../../utils/internalRoutes'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { Fips } from '../../data/utils/Fips'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { DemographicGroup } from '../../data/utils/Constants'
import ExtremeList from './ExtremeList'
import HetUnitLabel from '../../styles/HetComponents/HetUnitLabel'
import HetTerm from '../../styles/HetComponents/HetTerm'
import HetExpandableBoxButton from '../../styles/HetComponents/HetExpandableBoxButton'
import { formatFieldValue } from '../../data/config/MetricConfigUtils'

interface ExtremesListBoxProps {
  // MetricConfig for data
  metricConfig: MetricConfig
  // DataTypeConfig for data
  dataTypeConfig: DataTypeConfig
  fips: Fips
  // Whether or not list is expanded
  isOpen: boolean
  // Expand or collapse the list
  setIsOpen: (isOpen: boolean) => void
  highestValues: Row[]
  lowestValues: Row[]
  // items in highest/lowest list that should receive qualifiers
  qualifierItems?: string[]
  // message to display under a list with qualifiers
  qualifierMessage?: string
  // optional suffix to alter the selected metric (used for CAWP "identifying as Black women")
  selectedRaceSuffix?: string
  parentGeoQueryResponse: MetricQueryResponse
  demographicType: DemographicType
  activeDemographicGroup: DemographicGroup
}

/*
   Collapsible box showing lists of geographies with the highest and lowest rates
*/
export function ExtremesListBox(props: ExtremesListBoxProps) {
  const placesType = props.fips.getChildFipsTypeDisplayName()
  const { type: metricType } = props.metricConfig

  const overallRow = props.parentGeoQueryResponse.data.find(
    (row) => row[props.demographicType] === props.activeDemographicGroup,
  )

  const overallRate = formatFieldValue(
    /* metricType: MetricType, */ props.metricConfig.type,
    /* value: any, */ overallRow?.[props.metricConfig.metricId],
    /* omitPctSymbol: boolean = false */ true,
  )

  return (
    <AnimateHeight
      duration={500}
      height={props.isOpen ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className='mt-4 rounded-md bg-listboxColor text-left'
    >
      <HetExpandableBoxButton
        expandBoxLabel={`${placesType} rate extremes`}
        expanded={props.isOpen}
        setExpanded={() => {
          props.setIsOpen(!props.isOpen)
        }}
      />

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.isOpen && (
        <>
          <div className='mx-4 my-0'>
            <Grid container justifyContent='space-around'>
              <ExtremeList
                whichExtreme='Highest'
                values={props.highestValues}
                metricConfig={props.metricConfig}
                qualifierMessage={props.qualifierMessage}
                qualifierItems={props.qualifierItems}
              />

              <ExtremeList
                whichExtreme='Lowest'
                values={props.lowestValues}
                metricConfig={props.metricConfig}
                qualifierMessage={props.qualifierMessage}
                qualifierItems={props.qualifierItems}
              />
            </Grid>

            <h4>{props.fips.getUppercaseFipsTypeDisplayName()} overall:</h4>
            <ul>
              <li>
                {props.fips.getDisplayName()}:{' '}
                {formatFieldValue(metricType, overallRate)}
                {props.metricConfig.type === 'per100k' && (
                  <HetUnitLabel> per 100k</HetUnitLabel>
                )}
              </li>
            </ul>
          </div>

          <p className='m-0 p-4'>
            All rates are reported as:{' '}
            <HetTerm>
              {props.metricConfig.chartTitle}
              {props?.selectedRaceSuffix ?? ''}
            </HetTerm>
            .
          </p>
          <p className='m-0 p-4'>
            Consider the possible impact of{' '}
            <a href={`#${WHAT_DATA_ARE_MISSING_ID}`}>data reporting gaps</a>{' '}
            when interpreting the highest and lowest rates.
          </p>
        </>
      )}
    </AnimateHeight>
  )
}
