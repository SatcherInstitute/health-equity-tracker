import { ClickAwayListener, Tooltip } from '@mui/material'
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

  // Guarded on isOpen so a hover that is already showing the list does not log a
  // second table when the same pointer then clicks.
  const openAndLog = () => {
    if (!isOpen) logFeatureFlags()
    setIsOpen(true)
  }

  return (
    // A touch device never fires hover, so the tooltip is controlled: hover opens
    // it on desktop, a tap or click opens it anywhere, and ClickAwayListener plus
    // MUI's own Escape handling close it. MUI's touch listener is disabled because
    // its leave timer would otherwise dismiss the tooltip a second after the tap.
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Tooltip
        // Without describeChild, a non-string title makes MUI point aria-labelledby
        // at the tooltip, which outranks the aria-label below and leaves the button
        // renamed the moment it opens. describeChild uses aria-describedby instead,
        // so the accessible name stays put whether the tooltip is open or not.
        describeChild
        open={isOpen}
        onOpen={openAndLog}
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
              Full flag list logged to the browser console.
            </p>
          </div>
        }
      >
        <button
          type='button'
          onClick={openAndLog}
          aria-label={`${onFlags.length} active feature flags: ${onFlags
            .map(({ key, source }) => `${key} via ${source}`)
            .join(', ')}`}
          className='ml-2 cursor-pointer self-center border-0 bg-transparent p-1 text-title leading-none'
        >
          <span aria-hidden='true'>🧑🏽‍🔬</span>
        </button>
      </Tooltip>
    </ClickAwayListener>
  )
}
