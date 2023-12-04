import Joyride from 'react-joyride'
import { getOnboardingSteps } from './OnboardingSteps'
import { getCssVar } from '../../utils/designUtils'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

export default function Onboarding(props: {
  callback: (data: any) => void
  activelyOnboarding: boolean
}) {
  const isMd = useIsBreakpointAndUp('md')
  const zAlmostTop = getCssVar<number>('z-almost-top') ?? 3
  const altGreen = getCssVar<string>('alt-green')
  const white = getCssVar<string>('white')

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
          arrowColor: altGreen,
          backgroundColor: altGreen,
          primaryColor: altGreen,
          textColor: white,
          width: 900,
          zIndex: zAlmostTop,
        },
      }}
    />
  )
}
