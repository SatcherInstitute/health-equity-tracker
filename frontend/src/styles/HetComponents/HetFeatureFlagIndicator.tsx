import { Tooltip } from '@mui/material'
import { useState } from 'react'
import {
  ANY_FEATURE_FLAG_ON,
  describeFeatureFlags,
  logFeatureFlags,
} from '../../featureFlags'

export default function HetFeatureFlagIndicator() {
  const [isOpen, setIsOpen] = useState(false)

  if (!ANY_FEATURE_FLAG_ON) return null

  const onFlags = describeFeatureFlags().filter(({ on }) => on)

  return (
    // Controlled rather than left to MUI's own listeners, because a touch device
    // never fires hover and MUI's touch path did not reliably open on a tap. A
    // click toggles the list, which is the one gesture both a mouse and a finger
    // produce; onOpen/onClose keep plain hover working on desktop.
    <Tooltip
      // Without describeChild, a non-string title makes MUI point aria-labelledby
      // at the tooltip, which outranks the aria-label below and leaves the button
      // renamed the moment it opens. describeChild uses aria-describedby instead,
      // so the accessible name stays put whether the tooltip is open or not.
      describeChild
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      disableTouchListener
      title={
        <div>
          <p className='my-0 font-semibold'>Active feature flags</p>
          <ul className='my-1 list-none pl-0'>
            {onFlags.map(({ key, source }) => (
              <li key={key}>
                {key} ({source})
              </li>
            ))}
          </ul>
          <p className='my-0'>
            Select to log every flag to the browser console.
          </p>
        </div>
      }
    >
      <button
        type='button'
        onClick={() => {
          setIsOpen((wasOpen) => !wasOpen)
          logFeatureFlags()
        }}
        aria-label={`${onFlags.length} active feature flags: ${onFlags
          .map(({ key, source }) => `${key} via ${source}`)
          .join(', ')}. Activate to log every flag to the browser console.`}
        className='ml-2 cursor-pointer self-center border-0 bg-transparent p-1 text-title leading-none'
      >
        <span aria-hidden='true'>🧑🏽‍🔬</span>
      </button>
    </Tooltip>
  )
}
