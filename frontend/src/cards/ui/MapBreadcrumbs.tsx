import React from 'react'
import { USA_FIPS, USA_DISPLAY_NAME, Fips } from '../../data/utils/Fips'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import styles from './MapBreadcrumbs.module.scss'
import { useLocation } from 'react-router-dom'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'

function MapBreadcrumbs(props: {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  ariaLabel?: string
  scrollToHashId: ScrollableHashId
  endNote?: string
}) {
  const location = useLocation()

  return (
    <>
      <Breadcrumbs
        sx={{ m: 2, justifyContent: 'center' }}
        separator="›"
        aria-label={`Breadcrumb navigation for ${
          props.ariaLabel ?? 'data'
        } in ${props.fips.getDisplayName()} report`}
      >
        <Crumb
          text={USA_DISPLAY_NAME}
          isClickable={!props.fips.isUsa()}
          onClick={() => {
            props.updateFipsCallback(new Fips(USA_FIPS))
            location.hash = `#${props.scrollToHashId}`
          }}
        />
        {!props.fips.isUsa() && (
          <Crumb
            text={props.fips.getStateDisplayName()}
            isClickable={!props.fips.isStateOrTerritory()}
            onClick={() => {
              props.updateFipsCallback(props.fips.getParentFips())
              location.hash = `#${props.scrollToHashId}`
            }}
          />
        )}
        {props.fips.isCounty() && (
          <Crumb text={props.fips.getDisplayName()} isClickable={false} />
        )}

        {props.endNote && (
          <Crumb text={props.endNote} isClickable={false} isNote={true} />
        )}
      </Breadcrumbs>
    </>
  )
}

function Crumb(props: {
  text: string
  isClickable: boolean
  onClick?: () => void
  isNote?: boolean
}) {
  return (
    <>
      {props.isClickable && (
        <Button
          color="primary"
          className={styles.Crumb}
          onClick={() => {
            props.onClick?.()
          }}
        >
          {props.text}
        </Button>
      )}
      {!props.isClickable && (
        <Button
          color="primary"
          className={props.isNote ? styles.NoteCrumb : styles.CurrentCrumb}
          disabled
        >
          {props.text}
        </Button>
      )}
    </>
  )
}

export default MapBreadcrumbs
