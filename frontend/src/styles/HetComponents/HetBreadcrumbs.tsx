import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import { useLocation } from 'react-router'
import { USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/ConstantsGeography'
import { Fips } from '../../data/utils/Fips'
import { useParamState } from '../../utils/hooks/useParamState'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { ATLANTA_MODE_PARAM_KEY } from '../../utils/urlutils'

export default function HetBreadcrumbs(props: {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  ariaLabel?: string
  scrollToHashId: ScrollableHashId
  totalPopulationPhrase?: string
  subPopulationPhrase?: string
  isAtlantaMode?: boolean
}) {
  const location = useLocation()

  const [, setIsAtlantaMode] = useParamState<boolean>(
    ATLANTA_MODE_PARAM_KEY,
    false,
  )

  return (
    <div className='mx-3 my-1'>
      <Breadcrumbs
        separator='›'
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
        {!props.fips.isUsa() && !props.isAtlantaMode && (
          <Crumb
            text={props.fips.getStateDisplayName()}
            isClickable={!props.fips.isStateOrTerritory()}
            onClick={() => {
              props.updateFipsCallback(props.fips.getParentFips())
              location.hash = `#${props.scrollToHashId}`
            }}
          />
        )}
        {props.isAtlantaMode && (
          <Crumb
            text={'Georgia'}
            isClickable={true}
            onClick={() => {
              setIsAtlantaMode(false)
            }}
          />
        )}
        {props.fips.isCounty() && (
          <Crumb text={props.fips.getDisplayName()} isClickable={false} />
        )}
      </Breadcrumbs>

      {(props.totalPopulationPhrase || props.subPopulationPhrase) && (
        <div className='px-1 text-left text-alt-black text-smallest'>
          {props.totalPopulationPhrase && (
            <p className='my-0.5'>{props.totalPopulationPhrase}</p>
          )}
          {props.subPopulationPhrase && (
            <p className='my-0.5'>{props.subPopulationPhrase}</p>
          )}
        </div>
      )}
    </div>
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
          className='p-1 text-alt-green'
          onClick={() => {
            props.onClick?.()
          }}
        >
          {props.text}
        </Button>
      )}
      {!props.isClickable && (
        <Button
          className={`p-1 text-alt-black ${props.isNote ? 'text-left' : ''}`}
          disabled
        >
          {props.text}
        </Button>
      )}
    </>
  )
}
