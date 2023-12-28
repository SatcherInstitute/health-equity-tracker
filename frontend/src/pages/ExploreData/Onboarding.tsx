import Joyride from 'react-joyride'
import { getOnboardingSteps } from './OnboardingSteps'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { het, ThemeZIndexValues } from '../../styles/DesignTokens'

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
          arrowColor: het.altGreen,
          backgroundColor: het.altGreen,
          primaryColor: het.altGreen,
          textColor: het.white,
          width: 900,
          zIndex: ThemeZIndexValues.almostTop,
        },
      }}
    />
  )
}
