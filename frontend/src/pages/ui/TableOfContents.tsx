import {
  Card,
  Step,
  StepButton,
  Stepper,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React from "react";
import { StepData } from "../../reports/ReportProviderSteps";
import { useStepObserver } from "../../utils/useStepObserver";
import styles from "./TableOfContents.module.scss";

interface TableOfContentsProps {
  reportSteps: StepData[];
  sticking: boolean;
  twoCol?: boolean;
}

export function TableOfContents(props: TableOfContentsProps) {
  const theme = useTheme();
  const pageIsWide = useMediaQuery(
    theme.breakpoints.up(props.twoCol ? "lg" : "md")
  );

  const [activeId, setRecentlyClicked] = useStepObserver(
    props.reportSteps,
    props.sticking
  );

  return (
    <Card raised={true} className={props.twoCol ? styles.TOC2 : styles.TOC}>
      <Stepper
        component={"menu"}
        nonLinear
        activeStep={props.reportSteps?.findIndex(
          (step) => step.hashId === activeId
        )}
        orientation="vertical"
        aria-label="Available data visualizations"
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
                  className={
                    pageIsWide
                      ? styles.StepButtonLabel
                      : styles.ScreenreaderTitleHeader
                  }
                >
                  {step.label}
                  {props.twoCol && step.pluralOnCompare ? "s" : ""}
                </span>
                {/* <a
                  href={`#${step.hashId}`}
                  className={styles.Step}
                >
                  {""}
                  {pageIsWide ? step.label : ""}
                  {!step.label.endsWith("Info") && props.twoCol && pageIsWide ? "s" : ""}
                </a> */}
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
