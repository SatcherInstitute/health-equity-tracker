import { Card, Step, StepLabel, Stepper } from "@material-ui/core";
import React, { useState } from "react";
import { ScrollableHashId } from "../../reports/ReportProviderSteps";
import { useHeadsObserver } from "../../utils/useHeadsObserver";
import styles from "./TableOfContents.module.scss";

interface TableOfContentsProps {
  headings?: any[];
  sticking: boolean;
}

export function TableOfContents(props: TableOfContentsProps) {
  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null);

  const { activeId } = useHeadsObserver(
    recentlyClicked,
    setRecentlyClicked,
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
