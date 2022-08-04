import { Card, Step, StepButton, StepLabel, Stepper } from "@material-ui/core";
import * as React from "react";
import { NavHashLink } from "react-router-hash-link";
import styles from "./ExploreDataPage.module.scss";

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

export type StepData = {
  label: string;
  hashId: ScrollableHashId;
};

export const steps: StepData[] = [
  {
    label: "Population",
    hashId: "population",
  },
  {
    label: "Rate Map",
    hashId: "map",
  },
  {
    label: "Rate Chart",
    hashId: "bar",
  },
  {
    label: "Unknown Share Map",
    hashId: "unknowns",
  },
  {
    label: "Share Chart",
    hashId: "disparity",
  },
  {
    label: "Data Table",
    hashId: "table",
  },
  {
    label: "Age-Adjusted Ratios",
    hashId: "age-adjusted",
  },
  {
    label: "Definitions",
    hashId: "definitions",
  },
  {
    label: "What Data Are Missing?",
    hashId: "missingDataInfo",
  },
];

interface CardsStepperProps {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function CardsStepper(props: CardsStepperProps) {
  function handleClick(e: any, index: number) {
    e.preventDefault();
    props.setActiveStep(index);
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
              <StepButton
                className={styles.Step}
                onClick={(e) => handleClick(e, index)}
              >
                <NavHashLink
                  activeClassName={styles.SelectedStep}
                  to={`#${steps[index].hashId}`}
                  smooth
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
