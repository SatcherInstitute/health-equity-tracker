import {
  Box,
  Button,
  Paper,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import { HashLink } from "react-router-hash-link";
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
    // description: `Geographic info`,
  },
  {
    label: "Rate Map",
    // description:
    // 	"Rates by locations; click on a place to view a more detailed report",
  },
  {
    label: "Rate Chart",
    description: `Rates by demographic group.`,
  },
  {
    label: "Unknown Share Map",
    description: `Rates by demographic group.`,
  },
  {
    label: "Share Chart",
    description: `Rates by demographic group.`,
  },
  {
    label: "Data Table",
    description: `Rates by demographic group.`,
  },
  {
    label: "Age-Adjusted Ratios",
    description: `Rates by demographic group.`,
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(1);

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper nonLinear activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} completed={false}>
            <StepButton>{step.label}</StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
