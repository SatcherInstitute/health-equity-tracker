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
import { scrollIntoView } from "seamless-scroll-polyfill";

const TABLE_OF_CONTENT_PADDING = 15;

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
    const clickedElem: HTMLElement | null = document.querySelector(
      `#${step.hashId}`
    );

    if (clickedElem) {
      console.log("would be scrolling CLICKED into view");
      // clickedElem.scrollIntoView({ behavior: "smooth" });
      // scrollIntoView(clickedElem, { behavior: "smooth" });
      // for a11y focus should shift to subsequent tab goes to next interactive element after the targeted card
      // clickedElem.focus({ preventScroll: true });
    }

    setRecentlyClicked(step.hashId);
  }

  const tocOffset = (props.floatTopOffset || 0) + TABLE_OF_CONTENT_PADDING;

  return (
    <Card raised={true} className={styles.Toc} style={{ top: tocOffset }}>
      <Stepper
        component={"nav"}
        nonLinear
        activeStep={props.reportSteps?.findIndex(
          (step) => step.hashId === activeId
        )}
        orientation="vertical"
        aria-label="Available cards on this report"
        className={styles.Stepper}
      >
        {props.reportSteps?.map((step) => {
          return (
            <Step completed={false} key={step.hashId}>
              <StepButton
                title={`Scroll to ${step.label}`}
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
