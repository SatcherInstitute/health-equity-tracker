import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Button } from '@mui/material'
import { routeConfigs } from '../methodologyContent/routeConfigs'
import { ArrowBack, ArrowForward } from '@mui/icons-material'

export const NavigationButtons: React.FC = () => {
  const history = useHistory()
  const location = useLocation()

  const currentIndex = routeConfigs.findIndex(
    (route) => route.path === location.pathname
  )

  const nextRoute = routeConfigs[currentIndex + 1]
  const prevRoute = routeConfigs[currentIndex - 1]

  const goNext = () => {
    if (nextRoute) {
      history.push(nextRoute.path)
    }
  }

  const goPrevious = () => {
    if (prevRoute) {
      history.push(prevRoute.path)
    }
  }

  return (
    <div
      // className={styles.NavigationButtonsDiv}
      className='lg:flex-grow-1 lg:flex-basis-0" mx-0 mb-0 mt-4 flex w-full flex-col justify-between lg:mt-8 lg:flex-shrink-0 lg:flex-row lg:self-stretch '
    >
      {prevRoute ? (
        <Button
          disabled={currentIndex === 0}
          onClick={goPrevious}
          // className={styles.Previous}
          className='mx-auto mb-0 mt-6 flex w-full flex-col justify-center rounded-2xl bg-dark-green p-1 font-sansTitle text-exploreButton font-medium leading-lhSomeMoreSpace tracking-wide text-alt-black lg:w-80'
        >
          <span className='flex items-center self-stretch p-2 font-sansText leading-lhLoose text-alt-black lg:leading-lhSomeMoreSpace'>
            {prevRoute ? (
              <span>
                <ArrowBack /> Previous
              </span>
            ) : null}
          </span>
          <span className='flex-grow-1 flex-basis-0 flex flex-shrink-0 flex-col justify-center gap-2 self-stretch p-2'>
            {/* <span className={styles.Previous}> */}
            <span className='items-start justify-start text-left'>
              {prevRoute ? prevRoute.label : null}
            </span>
          </span>
        </Button>
      ) : (
        <Button
          style={{ visibility: 'hidden' }}
          disabled={currentIndex === 0}
          onClick={goPrevious}
          className='items-start justify-start text-left'
        >
          <span className='flex items-center self-stretch p-2 font-sansText leading-lhSomeMoreSpace text-alt-black  '>
            {prevRoute ? (
              <span>
                <ArrowBack /> Previous
              </span>
            ) : null}
          </span>
        </Button>
      )}

      {nextRoute ? (
        <Button
          disabled={currentIndex === routeConfigs.length - 1}
          onClick={goNext}
          className='items-end justify-end text-right'
        >
          <span className='flex items-center self-stretch p-2 font-sansText leading-lhSomeMoreSpace text-alt-black  '>
            {nextRoute ? (
              <span>
                Up Next <ArrowForward />
              </span>
            ) : null}
          </span>
          <span className='flex flex-col justify-center gap-2 p-2 '>
            <span>{nextRoute ? nextRoute.label : null}</span>
          </span>
        </Button>
      ) : null}
    </div>
  )
}

export default NavigationButtons
