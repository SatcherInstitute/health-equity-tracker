import Joyride from 'react-joyride-react-19' // TODO: ideally revert back to react-joyride and not this temporary fork
import { colorValues } from '../../styles/tokens/colors'
import { dimensionValues } from '../../styles/tokens/dimensions'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { getOnboardingSteps } from './OnboardingSteps'

export default function Onboarding(props: {
  callback: (data: any) => void
  activelyOnboarding: boolean
}) {
  const isMd = useIsBreakpointAndUp('md')
  const zAlmostTop = Number.parseInt(dimensionValues.zIndexAlmostTop, 10)

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
          arrowColor: colorValues.altGreen,
          backgroundColor: colorValues.altGreen,
          primaryColor: colorValues.altGreen,
          textColor: colorValues.altWhite,
          width: 900,
          zIndex: zAlmostTop,
        },
      }}
    />
  )
}
