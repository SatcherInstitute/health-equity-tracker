import styles from './HighestLowestList.module.scss'
import AnimateHeight from 'react-animate-height'
import { Grid, IconButton } from '@mui/material'
import ArrowDropUp from '@mui/icons-material/ArrowDropUp'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import {
  type MetricConfig,
  type DataTypeConfig,
  formatFieldValue,
} from '../../data/config/MetricConfig'
import { type Row } from '../../data/utils/DatasetTypes'
import { WHAT_DATA_ARE_MISSING_ID } from '../../utils/internalRoutes'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type Fips } from '../../data/utils/Fips'
import { type DemographicType } from '../../data/query/Breakdowns'
import { type DemographicGroup } from '../../data/utils/Constants'

export interface HighestLowestListProps {
  // MetricConfig for data
  metricConfig: MetricConfig
  // DataTypeConfig for data
  dataTypeConfig: DataTypeConfig
  fips: Fips
  // Whether or not list is expanded
  listExpanded: boolean
  // Expand or collapse the list
  setListExpanded: (listExpanded: boolean) => void
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
export function HighestLowestList(props: HighestLowestListProps) {
  const placesType = props.fips.getPluralChildFipsTypeDisplayName()
  const { type: metricType } = props.metricConfig

  const overallRow = props.parentGeoQueryResponse.data.find(
    (row) => row[props.demographicType] === props.activeDemographicGroup
  )

  const overallRate = formatFieldValue(
    /* metricType: MetricType, */ props.metricConfig.type,
    /* value: any, */ overallRow?.[props.metricConfig.metricId],
    /* omitPctSymbol: boolean = false */ true
  )

  return (
    <AnimateHeight
      duration={500}
      height={props.listExpanded ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className={styles.ListBox}
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={
            props.listExpanded
              ? `hide lists of ${placesType} with highest and lowest rates `
              : `show lists of ${placesType} with highest and lowest rates`
          }
          onClick={() => {
            props.setListExpanded(!props.listExpanded)
          }}
          color="primary"
          size="large"
        >
          {props.listExpanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        onClick={() => {
          props.setListExpanded(!props.listExpanded)
        }}
        aria-hidden={true}
        className={
          props.listExpanded ? styles.ListBoxTitleExpanded : styles.ListBoxTitle
        }
      >
        {!props.listExpanded ? 'See ' : 'Viewing '}
        <span className={styles.HideOnMobile}>the {placesType} with the </span>
        <b>highest</b> and <b>lowest</b> rates.
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.listExpanded && (
        <>
          <div className={styles.ListBoxLists}>
            <Grid container justifyContent="space-around">
              <ExtremeList
                whichExtreme="Highest"
                values={props.highestValues}
                metricConfig={props.metricConfig}
                qualifierMessage={props.qualifierMessage}
                qualifierItems={props.qualifierItems}
              />

              <ExtremeList
                whichExtreme="Lowest"
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
                {formatFieldValue(metricType, overallRate)}{' '}
                <span className={styles.Unit}>
                  {props.metricConfig.type === 'per100k' ? 'per 100k' : ''}
                </span>
              </li>
            </ul>
          </div>

          <p>
            All rates are reported as:{' '}
            <b>
              {props.metricConfig.chartTitle}
              {props.selectedRaceSuffix}
            </b>
            .
          </p>
          <p>
            Consider the possible impact of{' '}
            <a href={`#${WHAT_DATA_ARE_MISSING_ID}`}>data reporting gaps</a>{' '}
            when interpreting the highest and lowest rates.
          </p>
        </>
      )}
    </AnimateHeight>
  )
}

// TODO: This should be its own component file
interface ExtremeListProps {
  whichExtreme: 'Highest' | 'Lowest'
  values: Row[]
  metricConfig: MetricConfig
  qualifierItems?: string[]
  qualifierMessage?: string
}

function ExtremeList(props: ExtremeListProps) {
  const { type: metricType, metricId } = props.metricConfig

  const extremeVal = props.values?.[0]?.[props.metricConfig.metricId]

  const isTie = extremeVal === props.values?.[1]?.[props.metricConfig.metricId]

  const tieDisplayValue = isTie
    ? formatFieldValue(metricType, extremeVal)
    : null

  return (
    <Grid item xs={12} sm={6}>
      <h4>
        {tieDisplayValue
          ? `${props.whichExtreme} (${tieDisplayValue}):`
          : `${props.values.length} ${props.whichExtreme}:`}
      </h4>

      <ul className={styles.ExtremeList}>
        {isTie ? (
          <li>
            <>
              {props.values.map((row, i) => {
                let placeName = row.fips_name
                if (props.qualifierItems?.includes(placeName)) {
                  placeName += ` ${props.qualifierMessage ?? ''}`
                }

                return (
                  <span key={row.fips_name}>
                    {placeName}
                    {i < props.values.length - 1 ? ', ' : ''}
                  </span>
                )
              })}
            </>
          </li>
        ) : (
          <>
            {!isTie &&
              props.values.map((row) => {
                let placeName = row.fips_name
                if (props.qualifierItems?.includes(placeName)) {
                  placeName += ` ${props.qualifierMessage ?? ''}`
                }

                return (
                  <li key={row.fips_name}>
                    {placeName}: {formatFieldValue(metricType, row[metricId])}{' '}
                    <span className={styles.Unit}>
                      {metricType === 'per100k' ? 'per 100k' : ''}
                    </span>
                  </li>
                )
              })}
          </>
        )}
      </ul>
    </Grid>
  )
}
