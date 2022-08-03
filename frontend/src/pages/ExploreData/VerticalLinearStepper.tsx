import { Card, Step, StepButton, StepLabel, Stepper } from "@material-ui/core";
import * as React from "react";
import { NavHashLink } from "react-router-hash-link";
import styles from "./ExploreDataPage.module.scss";

// import Box from '@mui/material/Box';
// import Stepper from '@mui/material/Stepper';
// import Step from '@mui/material/Step';
// import StepLabel from '@mui/material/StepLabel';
// import StepContent from '@mui/material/StepContent';
// import Button from '@mui/material/Button';
// import Paper from '@mui/material/Paper';
// import Typography from '@mui/material/Typography';

/* <HashLink to={`#missingDataInfo`}>#missingDataInfo{"  "}</HashLink>

				<HashLink to={`#map`}>#map{"  "}</HashLink>

				<HashLink to={`#bar`}>#bar{"  "}</HashLink>

				<HashLink to={`#unknowns`}>#unknowns{"  "}</HashLink>

				<HashLink to={`#disparity`}>#disparity{"  "}</HashLink>

				<HashLink to={`#table`}>#table{"  "}</HashLink>

				<HashLink to={`#age-adjusted`}>#age-adjusted{"  "}</HashLink> */

export const steps = [
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

export type StepData = {
  label: string;
  hashId: string;
};

export interface VerticalLinearStepperProps {
  steps: StepData[];
}

export default function VerticalLinearStepper(
  props: VerticalLinearStepperProps
) {
  const [activeStep, setActiveStep] = React.useState(0);

  function handleClick(e: any, index: number) {
    e.preventDefault();
    setActiveStep(index);
  }

  const presentIds = Array.from(document.querySelectorAll("*[id]")).map(
    (el) => el.id
  );
  console.log(presentIds);

  return (
    <Card raised={true} className={styles.StepperStickyCard}>
      <Stepper
        nonLinear
        activeStep={activeStep}
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
