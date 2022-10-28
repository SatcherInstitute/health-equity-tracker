import React from "react";
import Joyride from "react-joyride";
import sass from "../../styles/variables.module.scss";
import { ONBOARDING_STEPS } from "./OnboardingSteps";

export default function Onboarding(props: {
  callback: (data: any) => void;
  activelyOnboarding: boolean;
}) {
  return (
    <Joyride
      steps={ONBOARDING_STEPS}
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
          arrowColor: sass.altGreen,
          backgroundColor: sass.altGreen,
          primaryColor: sass.altGreen,
          textColor: sass.white,
          width: 900,
          zIndex: parseInt(sass.zAlmostTop),
        },
      }}
    />
  );
}
