import {
  Card,
  Step,
  StepButton,
  Stepper,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React from "react";
import { StepData, useStepObserver } from "../../utils/hooks/useStepObserver";
import styles from "./TableOfContents.module.scss";

/* 
  reportSteps: StepData[]; Array of TOC "steps" mapping the card hashId to the step display name
  isScrolledToTop?: boolean; Optionally send in top scroll status; when true none of the steps will be highlighted
*/

interface TableOfContentsProps {
  reportSteps: StepData[];
  floatTopOffset?: number;
  isScrolledToTop?: boolean;
}

export function TableOfContents(props: TableOfContentsProps) {
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("md"));

  const [activeId, setRecentlyClicked] = useStepObserver(
    props.reportSteps,
    props.isScrolledToTop || false
  );

  return (
    <Card
      raised={true}
      className={styles.Toc}
      style={{ top: props.floatTopOffset }}
    >
      <Stepper
        component={"menu"}
        nonLinear
        activeStep={props.reportSteps?.findIndex(
          (step) => step.hashId === activeId
        )}
        orientation="vertical"
        aria-label="Table of Contents"
        className={styles.Stepper}
      >
        {props.reportSteps?.map((step) => {
          return (
            <Step
              key={step.label}
              completed={false}
              title={`Scroll to ${step.label}`}
            >
              <StepButton
                className={styles.StepButton}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`#${step.hashId}`)!.scrollIntoView({
                    behavior: "smooth",
                  });
                  setRecentlyClicked(step.hashId);
                }}
              >
                <span
                  // hide labels visually but not from screen readers on small screens
                  className={
                    pageIsWide
                      ? styles.StepButtonLabel
                      : styles.ScreenreaderTitleHeader
                  }
                >
                  {step.label}
                </span>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
