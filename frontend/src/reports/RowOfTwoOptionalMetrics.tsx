import type { DropdownVarId } from '../data/config/DropDownIds'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { Fips } from '../data/utils/Fips'
import type { MadLibId } from '../utils/MadLibs'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'

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
    isCompareCard?: boolean,
  ) => React.ReactElement<any>
  dropdownVarId1?: DropdownVarId
  dropdownVarId2?: DropdownVarId
  headerScrollMargin: number
  trackerMode: MadLibId
}

export default function RowOfTwoOptionalMetrics(
  props: RowOfTwoOptionalMetricsProps,
) {
  if (!props.dataTypeConfig1 && !props.dataTypeConfig2) {
    return <></>
  }

  const dataTypeConfig2 =
    props.trackerMode === 'comparegeos'
      ? props.dataTypeConfig1
      : props.dataTypeConfig2

  return (
    <div id={`${props.id}-row`} className='flex w-full flex-wrap'>
      <div
        tabIndex={-1}
        className='w-full gap-2 md:w-1/2 lg:gap-3'
        id={props.id}
        // NOTE: use inline styles to set dynamic scroll margin based on MadLib header height
        style={{ scrollMarginTop: props.headerScrollMargin }}
      >
        {props.dataTypeConfig1 && (
          <>
            {props.createCard(
              props.dataTypeConfig1,
              props.fips1,
              props.updateFips1 ?? unusedFipsCallback,
              props.dropdownVarId1,
              /* isCompareCard */ false,
            )}
          </>
        )}
      </div>
      <div
        tabIndex={-1}
        className='w-full md:w-1/2'
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
              /* isCompareCard */ true,
            )}
          </>
        )}
      </div>
    </div>
  )
}
