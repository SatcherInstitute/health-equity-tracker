import { Grid } from '@mui/material'
import {
  type DataTypeConfig,
  type DropdownVarId,
} from '../data/config/MetricConfig'
import { type Fips } from '../data/utils/Fips'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { type MadLibId } from '../utils/MadLibs'

// Needed for type safety, used when the card does not need to use the fips update callback
const unusedFipsCallback = () => {}
interface RowOfTwoOptionalMetricsProps {
  id: ScrollableHashId
  dataTypeConfig1: DataTypeConfig | undefined
  dataTypeConfig2: DataTypeConfig | undefined
  fips1: Fips
  fips2: Fips
  updateFips1?: (fips: Fips) => void
  updateFips2?: (fips: Fips) => void
  createCard: (
    dataTypeConfig: DataTypeConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void,
    dropdownVarId?: DropdownVarId,
    isCompareCard?: boolean
  ) => JSX.Element
  dropdownVarId1?: DropdownVarId
  dropdownVarId2?: DropdownVarId
  headerScrollMargin: number
  trackerMode: MadLibId
}

export default function RowOfTwoOptionalMetrics(
  props: RowOfTwoOptionalMetricsProps
) {
  if (!props.dataTypeConfig1 && !props.dataTypeConfig2) {
    return <></>
  }

  const dataTypeConfig2 =
    props.trackerMode === 'comparegeos'
      ? props.dataTypeConfig1
      : props.dataTypeConfig2

  return (
    <>
      <Grid
        item
        xs={12}
        md={6}
        id={props.id}
        tabIndex={-1}
        style={{ scrollMarginTop: props.headerScrollMargin }}
      >
        {props.dataTypeConfig1 && (
          <>
            {props.createCard(
              props.dataTypeConfig1,
              props.fips1,
              props.updateFips1 ?? unusedFipsCallback,
              props.dropdownVarId1,
              /* isCompareCard */ false
            )}
          </>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        tabIndex={-1}
        id={`${props.id}2`}
        style={{ scrollMarginTop: props.headerScrollMargin }}
      >
        {dataTypeConfig2 && (
          <>
            {props.createCard(
              dataTypeConfig2,
              props.fips2,
              props.updateFips2 ?? unusedFipsCallback,
              props.dropdownVarId2,
              /* isCompareCard */ true
            )}
          </>
        )}
      </Grid>
    </>
  )
}
