import { useHistory, useLocation } from 'react-router-dom'
import { routeConfigs } from '../policyContent/routeConfigs'
import HetPaginationButton from '../../../styles/HetComponents/HetPaginationButton'

export default function PolicyPagination() {
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

  return (
    <div className='mx-0 mb-0 mt-auto flex w-full flex-col justify-between md:mt-8 md:flex-row md:self-stretch '>
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
