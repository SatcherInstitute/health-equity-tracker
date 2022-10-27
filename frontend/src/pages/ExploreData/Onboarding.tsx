import React from "react";
import Joyride from "react-joyride";
import LazyLoad from "react-lazyload";
import sass from "../../styles/variables.module.scss";
import styles from "./ExploreDataPage.module.scss";

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
      showSkipButton={false}
      hideBackButton={false}
      disableCloseOnEsc={false}
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
          zIndex: parseInt(sass.zAlmostTop),
        },
      }}
    />
  );
}
const ONBOARDING_STEPS = [
  onboardingStep(
    "#covid-dropdown-topic",
    "Start Your Search",
    <>
      <p>
        Select a topic (and location) to start your search, such as{" "}
        <i>
          ‘Investigate rates of <b>Incarceration</b> in <b>Alabama</b>’
        </i>
        .
      </p>
      <LazyLoad offset={300} once>
        <video
          autoPlay={true}
          loop
          muted
          playsInline
          className={styles.HowToStepImg}
        >
          <source src="videos/search-by.mp4" type="video/mp4" />
        </video>
      </LazyLoad>
    </>,
    /*hideCloseButton=*/ false,
    /*placement=*/ "auto"
  ),
  onboardingStep(
    "#onboarding-madlib-arrow",
    "Compare Locations and Topics",
    <>
      Click the arrows to scroll left or right for more ways to search, such as{" "}
      <i>
        ‘Compare rates of <b>COVID-19</b> between <b>Georgia</b> and{" "}
        <b>Alabama</b>’
      </i>{" "}
      or{" "}
      <i>
        ‘Explore relationships between <b>Diabetes</b> and{" "}
        <b>Health Insurance</b> in <b>New York</b>’
      </i>
      .
    </>,
    /*hideCloseButton=*/ false,
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
    /*hideCloseButton=*/ false,
    /*placement=*/ "auto"
  ),
  onboardingStep(
    "#onboarding-explore-trends",
    "Explore further to see demographic trends",
    <>
      Where available, the tracker offers breakdowns by race and ethnicity, sex,
      and age.
    </>,
    /*hideCloseButton=*/ false,
    /*placement=*/ "auto"
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
