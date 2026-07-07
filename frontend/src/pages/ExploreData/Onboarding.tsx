import Joyride from 'react-joyride-react-19' // TODO: ideally revert back to react-joyride and not this temporary fork
import { colors } from '../../styles/tokens/colors'
import { dimensions } from '../../styles/tokens/dimensions'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { getOnboardingSteps } from './OnboardingSteps'

export default function Onboarding(props: {
  callback: (data: any) => void
  activelyOnboarding: boolean
}) {
  const isMd = useIsBreakpointAndUp('md')
  const zAlmostTop = Number.parseInt(dimensions.zIndexAlmostTop, 10)

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
          arrowColor: colors.altGreen,
          backgroundColor: colors.altGreen,
          primaryColor: colors.altGreen,
          textColor: colors.altWhite,
          width: 900,
          zIndex: zAlmostTop,
        },
      }}
    />
  )
}
