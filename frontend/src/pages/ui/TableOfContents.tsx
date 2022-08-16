import { Card, Step, StepLabel, Stepper } from "@material-ui/core";
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
  const [activeId, setRecentlyClicked] = useStepObserver(
    props.reportSteps,
    props.sticking
  );

  return (
    <Card raised={true} className={props.twoCol ? styles.TOC2 : styles.TOC}>
      <Stepper
        nonLinear
        activeStep={props.reportSteps?.findIndex(
          (step) => step.hashId === activeId
        )}
        orientation="vertical"
        component={"menu"}
        aria-label="Available data visualizations"
        className={styles.Stepper}
      >
        {props.reportSteps?.map((step) => {
          return (
            <Step key={step.label} completed={false}>
              <StepLabel>
                <a
                  href={`#${step.hashId}`}
                  className={styles.Step}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(`#${step.hashId}`)!.scrollIntoView({
                      behavior: "smooth",
                    });
                    setRecentlyClicked(step.hashId);
                  }}
                >
                  {step.label}
                </a>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
