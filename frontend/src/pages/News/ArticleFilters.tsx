import { Link } from 'react-router-dom'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'

type FilterType = 'author' | 'category'

// pretty string for filter box heading
const filterHeaderMap: Record<FilterType, string> = {
  author: 'Authors',
  category: 'Categories',
}

interface ArticleFiltersProps {
  filterType: FilterType
  filterOptions: string[]
}

export default function ArticleFilters(props: ArticleFiltersProps) {
  return (
    <div className='flex h-auto w-11/12 flex-col flex-nowrap items-start'>
      {/* FILTER BOX HEADING */}
      <h2 className='m-0 font-light font-serif text-altGreen text-smallestHeader capitalize '>
        {filterHeaderMap[props.filterType]}
      </h2>

      {/* LIST OF LINKED FILTERS (IF ANY) */}
      <ul className='mb-20 w-full list-none ps-4 text-start text-altBlack text-text'>
        {props.filterOptions.length > 0 &&
          props.filterOptions.map((filter) => {
            return (
              <li key={filter}>
                <Link
                  to={`${NEWS_PAGE_LINK}?${props.filterType}=${filter}`}
                  className='no-underline'
                >
                  {filter}
                </Link>
              </li>
            )
          })}
        {/* ALWAYS DISPLAY ALL POSTS LINK */}
        <li>
          <Link to={NEWS_PAGE_LINK} className='no-underline'>
            All Posts
          </Link>
        </li>
      </ul>
    </div>
  )
}
