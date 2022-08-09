import { Card, Step, StepLabel, Stepper } from "@material-ui/core";
import * as React from "react";
import { NavHashLink } from "react-router-hash-link";
import { reportProviderSteps as steps } from "../../reports/ReportProviderSteps";
import styles from "./ExploreDataPage.module.scss";
import { useLocation } from "react-router-dom";

// https://github.com/toviszsolt/react-scrollspy

export type StepData = {
  label: string;
  hashId: ScrollableHashId;
};

export type ScrollableHashId =
  | "population"
  | "map"
  | "bar"
  | "unknowns"
  | "disparity"
  | "table"
  | "age-adjusted"
  | "definitions"
  | "missingDataInfo";

interface TableOfContentsStepperProps {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function TableOfContentsStepper(
  props: TableOfContentsStepperProps
) {
  function handleClick(e: any, index: number) {
    e.preventDefault();
    props.setActiveStep(index);
  }
  const location = useLocation();

  const presentIds = Array.from(document.querySelectorAll("*[id]")).map(
    (el) => el.id
  );

  return (
    <Card raised={true} className={styles.StepperStickyCard}>
      <Stepper
        nonLinear
        activeStep={props.activeStep}
        orientation="vertical"
        component={"menu"}
        className={styles.Stepper}
      >
        {steps.map((step, index) => {
          const toUrl = `#${steps[index].hashId}`;

          return (
            <Step key={step.label} completed={false}>
              {presentIds.includes(steps[index].hashId) ? (
                <StepLabel onClick={(e) => handleClick(e, index)}>
                  <NavHashLink
                    activeClassName={styles.SelectedStep}
                    isActive={() => toUrl === location.pathname + location.hash}
                    className={styles.Step}
                    to={toUrl}
                    // smooth
                  >
                    {step.label}
                  </NavHashLink>
                </StepLabel>
              ) : (
                <StepLabel className={styles.StepUnavailable}>
                  {step.label} (N/A)
                </StepLabel>
              )}
            </Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
