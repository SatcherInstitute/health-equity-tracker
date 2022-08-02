import {
  Box,
  Button,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@material-ui/core";
import * as React from "react";
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

const steps = [
  {
    label: "Population",
    description: `Geographic info.`,
  },
  {
    label: "Rate Map",
    description:
      "Rates by locations; click on a place to view a more detailed report",
  },
  {
    label: "Rate Bar Chart",
    description: `Rates by demographic group.`,
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === 2 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button variant="contained" onClick={handleNext}>
                    {index === steps.length - 1 ? "Finish" : "Continue"}
                  </Button>
                  <Button disabled={index === 0} onClick={handleBack}>
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset}>Reset</Button>
        </Paper>
      )}
    </Box>
  );
}
