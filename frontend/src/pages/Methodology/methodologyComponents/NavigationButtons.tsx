import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Button } from '@mui/material'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
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
    <div className={styles.NavigationButtonsDiv} >
      {prevRoute ? 
      
      <Button
        disabled={currentIndex === 0}
        onClick={goPrevious}
        className={styles.Previous}
      >
        <span className={styles.ButtonHeader}>
          {prevRoute ? (
            <span>
              <ArrowBack /> Previous
            </span>
          ) : null}
        </span>
        <span className={styles.ButtonContentDiv}>
          <span className={styles.Previous}>
            {prevRoute ? prevRoute.label : null}
          </span>
        </span>
      </Button>
      :  <Button
      style={{visibility:'hidden'}}
        disabled={currentIndex === 0}
        onClick={goPrevious}
        className={styles.Previous}
      >
        <span className={styles.ButtonHeader}>
          {prevRoute ? (
            <span>
              <ArrowBack /> Previous
            </span>
          ) : null}
        </span>
        <span className={styles.ButtonContentDiv}>
          <span className={styles.Previous}>
            {prevRoute ? prevRoute.label : null}
          </span>
        </span>
      </Button>}

{nextRoute ?

<Button
        disabled={currentIndex === routeConfigs.length - 1}
        onClick={goNext}
        className={styles.Next}
      >
        <span className={styles.ButtonHeader}>
          {nextRoute ? (
            <span>
              Up Next <ArrowForward />
            </span>
          ) : null}
        </span>
        <span className={styles.ButtonContentDiv}>
          <span>{nextRoute ? nextRoute.label : null}</span>
        </span>
      </Button>
: null}

    </div>
  )
}

export default NavigationButtons
