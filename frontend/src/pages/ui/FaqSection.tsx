import React from "react";
import styles from "./FaqSection.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Accordion, AccordionSummary } from "@material-ui/core";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { FAQ_TAB_LINK, ReactRouterLinkButton } from "../../utils/urlutils";
import { selectFaqs } from "../WhatIsHealthEquity/FaqTab";
import { getHtml } from "../../utils/urlutils";

function Question(props: {
  questionText: string;
  ariaControls: string;
  id: string;
  answer: JSX.Element;
}) {
  return (
    <Accordion component="li" className={styles.FaqListItem}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={props.ariaControls}
        id={props.id}
      >
        <Typography className={styles.FaqQuestion} variant="h2" component="h4">
          {props.questionText}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.FaqAnswer}>{props.answer}</div>
      </AccordionDetails>
    </Accordion>
  );
}

function FaqSection() {
  return (
    <Grid container component="article">
      <Grid item>
        <Typography className={styles.FaqHeader} variant="h1" component="h3">
          Frequently asked questions
        </Typography>
      </Grid>
      <Grid item xs={12} className={styles.FaqQAItem} component="ul">
        {selectFaqs.map((faq, index) => {
          return (
            <Question
              key={faq.q}
              questionText={faq.q}
              ariaControls={`panel${index + 1}-content`}
              id={`panel${index + 1}-header`}
              answer={<>{getHtml(faq.a)}</>}
            />
          );
        })}
      </Grid>
      <Grid item>
        <ReactRouterLinkButton
          url={`${FAQ_TAB_LINK}`}
          className={styles.FaqLink}
          displayName="See our full FAQ page"
        />
      </Grid>
    </Grid>
  );
}

export default FaqSection;
