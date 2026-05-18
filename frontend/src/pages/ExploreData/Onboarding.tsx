import Joyride from 'react-joyride-react-19' // TODO: ideally revert back to react-joyride and not this temporary fork
import { het as colorVars } from '../../styles/theme/colorVars'
import { resolveCssVar } from '../../styles/theme/cssVarUtils'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { getOnboardingSteps } from './OnboardingSteps'

export default function Onboarding(props: {
  callback: (data: any) => void
  activelyOnboarding: boolean
}) {
  const isMd = useIsBreakpointAndUp('md')
  const zAlmostTop = Number.parseInt(resolveCssVar('--z-index-almost-top'), 10)

  return (
    <Joyride
      steps={getOnboardingSteps(isMd)}
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
      run={props.activelyOnboarding}
      styles={{
        options: {
          arrowColor: colorVars.altGreen,
          backgroundColor: colorVars.altGreen,
          primaryColor: colorVars.altGreen,
          textColor: colorVars.altWhite,
          width: 900,
          zIndex: zAlmostTop,
        },
      }}
    />
  )
}
