import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import styles from "./MultiMapLink.module.scss";
import React from "react";

/*
Generates the "COMPARES ACROSS GROUPS" button which opens the small multiples modal
*/
interface MultiMapLinkProps {
  setSmallMultiplesDialogOpen: Function;
  currentBreakdown: BreakdownVar;
  currentVariable: string;
}

export function MultiMapLink(props: MultiMapLinkProps) {
  const groupTerm =
    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.currentBreakdown];
  return (
    <>
      <a
        href="#multiMap"
        onClick={() => props.setSmallMultiplesDialogOpen(true)}
        role="button"
        className={styles.CompareAcrossLink}
        aria-label={
          "Open modal to Compare " +
          props.currentVariable +
          " across " +
          groupTerm +
          " groups"
        }
      >
        Compare across {groupTerm} groups
      </a>
      <span aria-hidden={true}>.</span>
    </>
  );
}
