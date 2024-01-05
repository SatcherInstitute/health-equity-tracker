import { useMemo, useRef } from 'react'
import { Fips, sortFipsObjects } from '../../data/utils/Fips'
import { usePopover } from '../../utils/hooks/usePopover'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import HetLocationSearch from '../../styles/HetComponents/HetLocationSearch'

interface LocationSelectorProps {
  newValue: string // fips location name as string
  phraseSegment: any
  onOptionUpdate: (option: string) => void
}

export default function LocationSelector(props: LocationSelectorProps) {
  const currentDisplayName = new Fips(props.newValue).getFullDisplayName()
  const popoverRef = useRef(null)
  const popover = usePopover()
  const dropdownTarget = `${props.newValue}-dropdown-fips`

  const options = useMemo(() => {
    return sortFipsObjects(
      Object.keys(props.phraseSegment).map((fipsCode) => new Fips(fipsCode))
    )
  }, [props.phraseSegment])

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton handleClick={popover.open} isOpen={popover.isOpen}>
          <span className={dropdownTarget}>{currentDisplayName}</span>
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* Location Dropdown */}

          <HetLocationSearch
            value={props.newValue}
            onOptionUpdate={props.onOptionUpdate}
            popover={popover}
            options={options}
          />
        </HetPopover>
      </span>
    </>
  )
}
