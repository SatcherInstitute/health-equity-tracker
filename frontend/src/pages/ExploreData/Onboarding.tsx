import React from "react";
import Joyride from "react-joyride";
// import { isSpreadAssignment } from "typescript";
import sass from "../../styles/variables.module.scss";

export function Onboarding(props: {
  callback: (data: any) => void;
  activelyOnboarding: boolean;
}) {
  return (
    <Joyride
      steps={ONBOARDING_STEPS}
      callback={props.callback}
      disableScrolling={true}
      showProgress={true}
      showSkipButton={true}
      disableCloseOnEsc={true}
      continuous={true}
      disableOverlayClose={true}
      disableOverlay={true}
      run={props.activelyOnboarding}
      styles={{
        options: {
          arrowColor: sass.altGreen,
          backgroundColor: sass.altGreen,
          primaryColor: sass.altGreen,
          textColor: sass.white,
          width: 900,
          zIndex: 1000,
        },
      }}
    />
  );
}
const ONBOARDING_STEPS = [
  onboardingStep(
    "#onboarding-start-your-search",
    "Start Your Search",
    <>
      Select the variable or location of interest to start your search, such as{" "}
      <i>'Investigate rates of COPD in California</i>. We'll be adding
      additional variables in the coming months!
    </>,
    /*hideCloseButton=*/ true,
    /*placement=*/ "auto"
  ),
  onboardingStep(
    "#onboarding-madlib-arrow",
    "Compare Locations and Variables",
    <>
      Click the arrows to scroll left or right for more ways to search, such as{" "}
      <i>‘Compare rates of COVID-19 between Georgia and Alabama’</i> or{" "}
      <i>
        ‘Explore relationships between Diabetes and Health Insurance in the
        United States’
      </i>
      .
    </>,
    /*hideCloseButton=*/ true,
    /*placement=*/ "auto"
  ),
  onboardingStep(
    "#onboarding-limits-in-the-data",
    "Limits in the data",
    <>
      The Tracker ingests and standardizes many data sets, but unfortunately
      there is missing, incomplete, or misclassified data in our sources.{" "}
      <i>
        *We acknowledge that deep inequities exist in the very structure we use
        to collect and share data. We are committed to helping fix this.
      </i>
    </>,
    /*hideCloseButton=*/ true,
    /*placement=*/ "top-start"
  ),
  onboardingStep(
    "#onboarding-explore-trends",
    "Explore further to see trends",
    <>
      Where available, the tracker offers breakdowns by race and ethnicity, sex,
      and age.
    </>,
    /*hideCloseButton=*/ false,
    /*placement=*/ "top-start"
  ),
];

function onboardingStep(
  targetId: string,
  title: string,
  content: JSX.Element,
  hideCloseButton: boolean,
  placement:
    | "auto"
    | "left-start"
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end"
    | "center"
    | undefined
) {
  return {
    hideCloseButton: hideCloseButton,
    target: targetId,
    placement: placement,
    content: (
      <div style={{ textAlign: "left" }}>
        <h4>{title}</h4>
        {content}
      </div>
    ),
    disableBeacon: true,
  };
}
