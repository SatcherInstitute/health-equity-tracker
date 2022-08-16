import { Card, Step, StepLabel, Stepper } from "@material-ui/core";
import React from "react";
import { reportProviderSteps } from "../../reports/ReportProviderSteps";
import { useStepObserver } from "../../utils/useStepObserver";
import styles from "./TableOfContents.module.scss";

interface TableOfContentsProps {
  headings?: any[];
  sticking: boolean;
}

export function TableOfContents(props: TableOfContentsProps) {
  const [activeId, setRecentlyClicked] = useStepObserver(
    reportProviderSteps,
    props.sticking
  );

  return (
    <Card raised={true} className={styles.TOC}>
      <Stepper
        nonLinear
        activeStep={props.headings?.findIndex(
          (heading) => heading.id === activeId
        )}
        orientation="vertical"
        component={"menu"}
        aria-label="Available data visualizations"
        className={styles.Stepper}
      >
        {props.headings?.map((heading) => {
          return (
            <Step key={heading.text} completed={false}>
              <StepLabel>
                <a
                  href={`#${heading.id}`}
                  className={styles.Step}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(`#${heading.id}`)!.scrollIntoView({
                      behavior: "smooth",
                    });
                    setRecentlyClicked(heading.id);
                  }}
                >
                  {heading.text}
                </a>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
