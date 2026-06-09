import { useEffect, useRef } from 'react'
import { Fips } from '../../data/utils/Fips'
import HetLocationSearch from '../../styles/HetComponents/HetLocationSearch'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import { usePopover } from '../../utils/hooks/usePopover'
import { useRecentLocations } from '../../utils/hooks/useRecentLocations'

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
  const { recentLocations, addRecentLocation } = useRecentLocations()

  // Track every location the user views, regardless of how they got here —
  // typing, dropdown click, map click, back/forward, or direct URL.
  useEffect(() => {
    addRecentLocation(props.newValue, currentDisplayName)
  }, [props.newValue, addRecentLocation, currentDisplayName])

  // MUI Autocomplete groupBy requires options sorted by their group key so groups
  // are contiguous. Sort by an explicit priority prefix rather than FIPS code
  // length so the requirement holds after any filtering the user triggers.
  const groupSortKey = (fips: Fips): string => {
    if (fips.isUsa()) return `0`
    if (fips.isState()) return `1`
    if (fips.isTerritory()) return `2`
    return `3_${fips.getFipsCategory()}`
  }

  const options = Object.keys(props.phraseSegment)
    .map((fipsCode) => new Fips(fipsCode))
    .sort((a, b) => {
      const ka = groupSortKey(a)
      const kb = groupSortKey(b)
      if (ka !== kb) return ka.localeCompare(kb)
      return a.code.localeCompare(b.code)
    })

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
            recentLocations={recentLocations}
          />
        </HetPopover>
      </span>
    </>
  )
}
