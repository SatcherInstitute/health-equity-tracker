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

  function handleStepClick(step: StepData) {
    // when clicking a step item from the top of the page, the size of the header is larger due to the 3 dot indicators on the carousel. To correct for this, actually change the hash which trigger the full correction feature used for incoming #hash links, rather than just simply navigating the card into view
    // window.location.hash = step.hashId
    if (props.isScrolledToTop) window.location.hash = step.hashId;

    document.querySelector(`#${step.hashId}`)?.scrollIntoView({
      behavior: "smooth",
    });

    setRecentlyClicked(step.hashId);
  }

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
                  handleStepClick(step);
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
