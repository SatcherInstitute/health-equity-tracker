import { Grid } from '@mui/material'
import LazyLoad from 'react-lazyload'
import {
  type VariableConfig,
  type DropdownVarId,
} from '../data/config/MetricConfig'
import { type Fips } from '../data/utils/Fips'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'

// Needed for type safety, used when the card does not need to use the fips update callback
const unusedFipsCallback = () => {}
interface RowOfTwoOptionalMetricsProps {
  id: ScrollableHashId
  variableConfig1: VariableConfig | undefined
  variableConfig2: VariableConfig | undefined
  fips1: Fips
  fips2: Fips
  updateFips1?: (fips: Fips) => void
  updateFips2?: (fips: Fips) => void
  createCard: (
    variableConfig: VariableConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void,
    dropdownVarId?: DropdownVarId,
    isCompareCard?: boolean
  ) => JSX.Element
  dropdownVarId1?: DropdownVarId
  dropdownVarId2?: DropdownVarId
  headerScrollMargin: number
}

export default function RowOfTwoOptionalMetrics(
  props: RowOfTwoOptionalMetricsProps
) {
  if (!props.variableConfig1 && !props.variableConfig2) {
    return <></>
  }

  const NON_LAZYLOADED_CARDS: ScrollableHashId[] = [
    'rate-map',
    'rates-over-time',
  ]

  const doNotLazyLoadCard = NON_LAZYLOADED_CARDS.includes(props.id)
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
        {/* render with or without LazyLoad wrapped based on card id */}
        {props.variableConfig1 && doNotLazyLoadCard && (
          <>
            {props.createCard(
              props.variableConfig1,
              props.fips1,
              props.updateFips1 ?? unusedFipsCallback,
              props.dropdownVarId1,
              /* isCompareCard */ false
            )}
          </>
        )}

        <LazyLoad offset={800} height={750}>
          {props.variableConfig1 && !doNotLazyLoadCard && (
            <>
              {props.createCard(
                props.variableConfig1,
                props.fips1,
                props.updateFips1 ?? unusedFipsCallback,
                props.dropdownVarId1,
                /* isCompareCard */ false
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        tabIndex={-1}
        id={`${props.id}2`}
        style={{ scrollMarginTop: props.headerScrollMargin }}
      >
        {props.variableConfig2 && doNotLazyLoadCard && (
          <>
            {props.createCard(
              props.variableConfig2,
              props.fips2,
              props.updateFips2 ?? unusedFipsCallback,
              props.dropdownVarId2,
              /* isCompareCard */ true
            )}
          </>
        )}

        <LazyLoad offset={800} height={600} once>
          {props.variableConfig2 && !doNotLazyLoadCard && (
            <>
              {props.createCard(
                props.variableConfig2,
                props.fips2,
                props.updateFips2 ?? unusedFipsCallback,
                props.dropdownVarId2,
                /* isCompareCard */ true
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
    </>
  )
}
