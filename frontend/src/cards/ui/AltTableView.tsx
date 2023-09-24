import { IconButton } from '@mui/material'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import AnimateHeight from 'react-animate-height'
import { type MetricConfig } from '../../data/config/MetricConfig'
import { type DemographicType } from '../../data/query/Breakdowns'
import { type DemographicGroup } from '../../data/utils/Constants'
import { type Row } from '../../data/utils/DatasetTypes'
import styles from './AltTableView.module.scss'
import {
  ALT_TABLE_VIEW_1_PARAM_KEY,
  ALT_TABLE_VIEW_2_PARAM_KEY,
} from '../../utils/urlutils'
import { lazy, useMemo } from 'react'
import { makeA11yTableData } from '../../data/utils/DatasetTimeUtils'

// Lazy
const AltTableExpanded = lazy(async () => await import('./AltTableExpanded'))
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
  const accessibleData =
    props.expanded &&
    useMemo(
      () =>
        makeA11yTableData(
          props.knownsData,
          props.unknownsData,
          props.demographicType,
          props.knownMetricConfig,
          props.unknownMetricConfig,
          props.selectedGroups,
          props.hasUnknowns
        ),
      [
        props.knownsData,
        props.unknownsData,
        props.demographicType,
        props.knownMetricConfig,
        props.unknownMetricConfig,
        props.selectedGroups,
        props.hasUnknowns,
      ]
    )

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className={styles.AltTableExpanderBox}
      id={
        props.isCompareCard
          ? ALT_TABLE_VIEW_2_PARAM_KEY
          : ALT_TABLE_VIEW_1_PARAM_KEY
      }
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={`${
            !props.expanded ? 'Expand' : 'Collapse'
          } data table view of ${props.expandBoxLabel}`}
          aria-expanded={props.expanded}
          onClick={() => {
            props.setExpanded(!props.expanded)
          }}
          color="primary"
          size="large"
        >
          {props.expanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        onClick={() => {
          props.setExpanded(!props.expanded)
        }}
        aria-hidden={true}
        className={
          props.expanded ? styles.AltTableTitleExpanded : styles.AltTableTitle
        }
      >
        {!props.expanded ? 'Expand' : 'Collapse'} <b>{props.expandBoxLabel}</b>{' '}
        table
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {accessibleData && (
        <AltTableExpanded
          accessibleData={accessibleData}
          tableCaption={props.tableCaption}
          demographicType={props.demographicType}
          knownMetricConfig={props.knownMetricConfig}
        />
      )}
    </AnimateHeight>
  )
}
