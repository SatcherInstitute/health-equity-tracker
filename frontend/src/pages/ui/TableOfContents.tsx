import { Card, Step, StepLabel, Stepper } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import {
  reportProviderSteps,
  ScrollableHashId,
} from "../../reports/ReportProviderSteps";
import { useHeadsObserver } from "../../utils/useHeadsObserver";
import styles from "./TableOfContents.module.scss";

interface TableOfContentsProps {
  sticking: boolean;
}

export function TableOfContents(props: TableOfContentsProps) {
  const [headings, setHeadings] = useState<any[]>([]);

  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null);

  const { activeId } = useHeadsObserver(
    recentlyClicked,
    setRecentlyClicked,
    props.sticking
  );

  // useEffect(() => {

  //   console.log(recentlyClicked);
  // }, [recentlyClicked])

  useEffect(() => {
    const elements = reportProviderSteps
      .map((step) => {
        const stepElement = document.getElementById(step.hashId);

        return {
          id: stepElement?.id,
          text: step.label,
        };
      })
      .filter((el) => !!el.id);

    elements && setHeadings(elements);
  }, []);

  return (
    <Card raised={true} className={styles.TOC}>
      <Stepper
        nonLinear
        activeStep={headings.findIndex((heading) => heading.id === activeId)}
        orientation="vertical"
        component={"menu"}
        aria-label="Available data visualizations"
        // className={styles.Stepper}
      >
        {headings.map((heading) => {
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
