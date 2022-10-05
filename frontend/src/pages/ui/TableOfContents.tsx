import {
  Card,
  Step,
  StepButton,
  Stepper,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React from "react";
import { reportProviderSteps } from "../../reports/ReportProviderSteps";
import {
  ScrollableHashId,
  useStepObserver,
} from "../../utils/hooks/useStepObserver";
import styles from "./TableOfContents.module.scss";
import { scrollIntoView } from "seamless-scroll-polyfill";

const TABLE_OF_CONTENT_PADDING = 15;

/* 
  reportStepHashIds: ScrollableHashId[]; Array of TOC "hashIds" used to map the hashId to the step display name
  isScrolledToTop?: boolean; Optionally send in top scroll status; when true none of the steps will be highlighted
*/

interface TableOfContentsProps {
  reportStepHashIds: ScrollableHashId[];
  floatTopOffset?: number;
  isScrolledToTop?: boolean;
}

export function TableOfContents(props: TableOfContentsProps) {
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("md"));

  const [activeId, setRecentlyClicked] = useStepObserver(
    props.reportStepHashIds,
    props.isScrolledToTop || false
  );

  function handleStepClick(stepId: ScrollableHashId) {
    const clickedElem: HTMLElement | null = document.querySelector(
      `#${stepId}`
    );

    if (clickedElem) {
      scrollIntoView(clickedElem, { behavior: "smooth" });
      // for a11y focus should shift to subsequent tab goes to next interactive element after the targeted card
      clickedElem.focus({ preventScroll: true });
      // manually set the browser url#hash for actual clicks
      window.history.replaceState(undefined, "", `#${stepId}`);
    }

    setRecentlyClicked(stepId);
  }

  const tocOffset = (props.floatTopOffset || 0) + TABLE_OF_CONTENT_PADDING;

  return (
    <Card raised={true} className={styles.Toc} style={{ top: tocOffset }}>
      <Stepper
        component={"nav"}
        nonLinear
        activeStep={props.reportStepHashIds?.findIndex(
          (stepId) => stepId === activeId
        )}
        orientation="vertical"
        aria-label="Available cards on this report"
        className={styles.Stepper}
      >
        {props.reportStepHashIds?.map((stepId) => {
          return (
            <Step completed={false} key={stepId}>
              <StepButton
                title={`Scroll to ${reportProviderSteps[stepId].label}`}
                className={styles.StepButton}
                onClick={(e) => {
                  e.preventDefault();
                  handleStepClick(stepId);
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
                  {reportProviderSteps[stepId].label}
                </span>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
