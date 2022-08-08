import { Card, Step, StepButton, StepLabel, Stepper } from "@material-ui/core";
import * as React from "react";
import { NavHashLink } from "react-router-hash-link";
import { steps } from "../../reports/ReportProvider";
import styles from "./ExploreDataPage.module.scss";

// https://github.com/toviszsolt/react-scrollspy

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

interface CardsStepperProps {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  cardsInView: string[];
  setCardsInView: React.Dispatch<React.SetStateAction<string[]>>;
  setskipScrollTracking: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CardsStepper(props: CardsStepperProps) {
  function handleClick(e: any, index: number) {
    e.preventDefault();
    // props.setskipScrollTracking(true);
    props.setActiveStep(index);
    // props.setskipScrollTracking(false);
  }

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
        {steps.map((step, index) => (
          <Step key={step.label} completed={false}>
            {presentIds.includes(steps[index].hashId) ? (
              <StepButton onClick={(e) => handleClick(e, index)}>
                <NavHashLink
                  activeClassName={styles.SelectedStep}
                  className={styles.Step}
                  to={`#${steps[index].hashId}`}
                  // smooth
                >
                  {step.label}
                </NavHashLink>
              </StepButton>
            ) : (
              <StepLabel className={styles.StepUnavailable}>
                {step.label} (N/A)
              </StepLabel>
            )}
          </Step>
        ))}
      </Stepper>
    </Card>
  );
}
