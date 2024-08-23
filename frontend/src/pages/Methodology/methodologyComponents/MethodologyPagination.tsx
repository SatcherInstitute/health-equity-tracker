import { useHistory, useLocation } from 'react-router-dom'
import { routeConfigs } from '../methodologyContent/routeConfigs'
import HetPaginationButton from '../../../styles/HetComponents/HetPaginationButton'

export default function MethodologyPagination() {
  const history = useHistory()
  const location = useLocation()

  const currentIndex = routeConfigs.findIndex(
    (route) => route.path === location.pathname
  )

  const nextRoute = routeConfigs[currentIndex + 1]
  const prevRoute = routeConfigs[currentIndex - 1]

  function goNext() {
    if (nextRoute) {
      history.push(nextRoute.path)
    }
  }

  function goPrevious() {
    if (prevRoute) {
      history.push(prevRoute.path)
    }
  }

  /* When a previous or next step isn't available, render empty div to keep flex alignment working */
  return (
    <div className='mx-0 smMd:mb-0 mb-8 mt-8 flex w-full flex-col justify-between md:mt-16 md:flex-row gap-4 md:self-stretch '>
      {prevRoute ? (
        <HetPaginationButton direction='previous' onClick={goPrevious}>
          {prevRoute.label}
        </HetPaginationButton>
      ) : (
        <div></div>
      )}

      {nextRoute ? (
        <HetPaginationButton
          direction='next'
          onClick={goNext}
          disabled={currentIndex === routeConfigs.length - 1}
        >
          {nextRoute.label}
        </HetPaginationButton>
      ) : (
        <div></div>
      )}
    </div>
  )
}
