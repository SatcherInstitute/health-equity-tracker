import React from "react";

function onboardingStep(targetId: string, title: string, content: JSX.Element) {
  return {
    hideCloseButton: true,
    target: targetId,
    content: (
      <div style={{ textAlign: "left" }}>
        <h4>{title}</h4>
        {content}
      </div>
    ),
    disableBeacon: true,
  };
}

const ONBOARDING_STEPS = [
  onboardingStep(
    "#onboarding-start-your-search",
    "Start Your Search",
    <>
      Complete the sentence by selecting a location. You can also select a
      different variable, like <i>'Diabetes'</i> or <i>'Poverty'</i>
    </>
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
    </>
  ),
  onboardingStep(
    "#onboarding-limits-in-the-data",
    "Limits in the data",
    <>
      The Tracker ingests and standardizes many data sets, but unfortunately
      there is missing, incomplete, or misclassified data in our sources.
      <br />
      <i>
        *We acknowledge that deep inequities exist in the very structure we use
        to collect and share data. We are committed to helping to fix this.
      </i>
    </>
  ),
  onboardingStep(
    "#onboarding-explore-trends",
    "Explore further to see trends",
    <>
      Where available, the tracker offers breakdowns by race and ethnicity, sex,
      and age. This is currently limited to the national and state level, with
      county-level data coming soon.
    </>
  ),
];

export default ONBOARDING_STEPS;
