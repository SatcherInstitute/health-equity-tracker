import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

export default function CAWPCountyMultiDistrictAlert() {
  return (
    <HetNotice kind='helpful-info' title='County-level data methodology'>
      County figures include all U.S. Congress members (House and Senate) whose
      districts overlap any part of the county. Because most counties share two
      senators with every other county in their state, the denominator is
      typically <HetTerm>3 members</HetTerm> (2 senators + 1 representative),
      producing only four possible percentages: 0%, 33%, 67%, or 100%. Counties
      that span multiple House districts will have a higher denominator and more
      gradations. Members from multi-county districts are counted once in each
      overlapping county.
    </HetNotice>
  )
}
