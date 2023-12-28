import Joyride from 'react-joyride'
import { getOnboardingSteps } from './OnboardingSteps'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { Het, ThemeZIndexValues } from '../../styles/DesignTokens'

export default function Onboarding(props: {
  callback: (data: any) => void
  activelyOnboarding: boolean
}) {
  const isMd = useIsBreakpointAndUp('md')

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
          arrowColor: Het.altGreen,
          backgroundColor: Het.altGreen,
          primaryColor: Het.altGreen,
          textColor: Het.white,
          width: 900,
          zIndex: ThemeZIndexValues.almostTop,
        },
      }}
    />
  )
}
