import Joyride from 'react-joyride'
import sass from '../../styles/variables.module.scss'
import { getOnboardingSteps } from './OnboardingSteps'
import { useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'

export default function Onboarding(props: {
  callback: (data: any) => void
  activelyOnboarding: boolean
}) {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('md'))

  const [runJoyride, setRunJoyride] = useState(false)
  useEffect(() => {
    setRunJoyride(true)
    console.log(runJoyride)
  }, [])

  return (
    <Joyride
      // stepIndex={0}
      steps={getOnboardingSteps(pageIsWide)}
      callback={props.callback}
      disableScrolling={false}
      scrollOffset={200}
      showProgress={true}
      showSkipButton={true}
      hideBackButton={false}
      disableCloseOnEsc={true}
      continuous={true}
      disableOverlayClose={false}
      disableOverlay={false}
      run={props.activelyOnboarding && runJoyride}
      styles={{
        options: {
          arrowColor: sass.altGreen,
          backgroundColor: sass.altGreen,
          primaryColor: sass.altGreen,
          textColor: sass.white,
          width: 900,
          zIndex: parseInt(sass.zAlmostTop),
        },
      }}
    />
  )
}
