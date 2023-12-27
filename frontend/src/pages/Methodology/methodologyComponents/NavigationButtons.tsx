import { useHistory, useLocation } from 'react-router-dom'
import { routeConfigs } from '../methodologyContent/routeConfigs'
import HetPaginationButton from '../../../styles/HetComponents/HetPaginationButton'

export default function NavigationButtons() {
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
    <div className='lg:flex-grow-1 lg:flex-basis-0 mx-0 mb-0 mt-4 flex w-full flex-col justify-between lg:mt-8 lg:flex-shrink-0 lg:flex-row lg:self-stretch '>
      {prevRoute ? (
        <HetPaginationButton
          direction='previous'
          label={prevRoute.label}
          onClick={goPrevious}
        />
      ) : (
        <div></div>
      )}

      {nextRoute ? (
        <HetPaginationButton
          direction='next'
          label={nextRoute.label}
          onClick={goNext}
          disabled={currentIndex === routeConfigs.length - 1}
        />
      ) : (
        <div></div>
      )}
    </div>
  )
}

/*  */
