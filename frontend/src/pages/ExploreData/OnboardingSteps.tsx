import React from "react";
import LazyLoad from "react-lazyload";
import styles from "./ExploreDataPage.module.scss";
import covidClick from "../../assets/screengrabs/covidClick.mp4";
import changeModes from "../../assets/screengrabs/changeModes.mp4";

export const ONBOARDING_STEPS = [
  onboardingStep(
    "#covid-dropdown-topic",
    "Start Your Search",
    <>
      <p>
        Select a topic (and location) to start your search, such as{" "}
        <i>
          ‘Investigate rates of <b>COVID-19</b> in the <b>United States</b>’
        </i>
        .
      </p>
      <LazyLoad offset={300} height={300} once>
        <video
          autoPlay={true}
          loop
          muted
          playsInline
          className={styles.HowToStepImg}
        >
          <source src={covidClick} type="video/mp4" />
        </video>
      </LazyLoad>
    </>,
    /*hideCloseButton=*/ true,
    /*placement=*/ "auto"
  ),
  onboardingStep(
    "#onboarding-madlib-arrow",
    "Compare Locations and Topics",
    <>
      <p>
        Click the arrows to scroll left or right for more ways to search, such
        as{" "}
        <i>
          ‘Compare rates of <b>Poverty</b> between{" "}
          <b>Los Angeles County, California</b> and the <b>United States</b>’
        </i>{" "}
        or{" "}
        <i>
          ‘Explore relationships between <b>Poverty</b> and <b>COVID-19</b> in{" "}
          <b>Los Angeles County, California</b>’
        </i>
        .
      </p>

      <LazyLoad offset={300} height={176} once>
        <video
          autoPlay={true}
          loop
          muted
          playsInline
          className={styles.HowToStepImg}
        >
          <source src={changeModes} type="video/mp4" />
        </video>
      </LazyLoad>
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
    /*hideCloseButton=*/ true,
    /*placement=*/ "auto"
  ),
  // onboardingStep(
  // 	"#onboarding-explore-datatypes",
  // 	"Multiple data types",
  // 	<>
  // 		Some topics includes multiple data types, like COVID-19 <b>cases</b>, <b>deaths</b>, and <b>hospitalizations</b>.
  // 	</>,
  //   /*hideCloseButton=*/ false,
  //   /*placement=*/ "auto"
  // ),
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
