import { useRef } from 'react'
import { Fips } from '../../data/utils/Fips'
import HetLocationSearch from '../../styles/HetComponents/HetLocationSearch'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import { usePopover } from '../../utils/hooks/usePopover'
import {
  addRecentLocation,
  getRecentLocations,
} from '../../utils/recentLocations'

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

  const recentLocations = getRecentLocations()

  const allOptions = Object.keys(props.phraseSegment)
    .sort((a: string, b: string) => {
      if (a.length === b.length) {
        return a.localeCompare(b)
      }
      return b.length > a.length ? -1 : 1
    })
    .map((fipsCode) => new Fips(fipsCode))

  const filteredOptions = allOptions.filter(
    (option) => !recentLocations.some((recent) => recent.code === option.code),
  )

  const options = [...recentLocations, ...filteredOptions]

  const handleOptionUpdate = (newValue: string) => {
    addRecentLocation(new Fips(newValue))
    props.onOptionUpdate(newValue)
  }

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
            onOptionUpdate={handleOptionUpdate}
            popover={popover}
            options={options}
            recentLocations={recentLocations}
          />
        </HetPopover>
      </span>
    </>
  )
}
