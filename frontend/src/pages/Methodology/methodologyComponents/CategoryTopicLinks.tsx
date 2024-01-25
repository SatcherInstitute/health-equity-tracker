import { type DropdownVarId } from '../../../data/config/MetricConfig'
import { DROPDOWN_TOPIC_MAP } from '../../../utils/MadLibs'

interface CategoryTopicLinksProps {
  dropdownIds: DropdownVarId[]
}

export default function CategoryTopicLinks(props: CategoryTopicLinksProps) {
  return (
    <ul className='list-none pb-8'>
      {props.dropdownIds.map((dropdownId) => {
        return (
          <li key={dropdownId} className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href={`/exploredata?mls=1.${dropdownId}-3.00&group1=All`}
            >
              {DROPDOWN_TOPIC_MAP[dropdownId]}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
