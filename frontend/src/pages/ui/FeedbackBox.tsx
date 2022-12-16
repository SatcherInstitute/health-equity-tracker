import React, { useRef, useState } from "react";
// @ts-ignore
import Feedback from "@benhammondmusic/feeder-react-feedback";
import "@benhammondmusic/feeder-react-feedback/dist/feeder-react-feedback.css"; // import stylesheet
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { useCookies } from "react-cookie";
import useClickAway from "../../utils/hooks/useClickAway";
import sass from "../../styles/variables.module.scss";
import { useMediaQuery, useTheme } from "@material-ui/core";

const TEST_FEEDER_ID = "6171cc2965b82c00045239dc"; // this is a test account; we can create a new ID for our real dashboard account once secrets are working
const FEEDBACK_ID = process.env.REACT_APP_FEEDBACK_ID || TEST_FEEDER_ID; // view collected feedback at feeder.sh/dashboard
const BOTTOM_SCROLL_OPTIONS = {
  offset: 500,
};

export default function FeedbackBox(props: { alwaysShow?: boolean }) {
  // calculate page size for responsive layout, dont show feedback box on mobile as it breaks iOS links
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("lg"));

  // If cookie is in place, this is a return user and therefore eligible for feedback
  const [cookies] = useCookies();
  const isReturnUser = cookies.skipOnboarding;
  const [showFeedback, setShowFeedback] = useState(
    (props.alwaysShow && pageIsWide) || false
  );
  useBottomScrollListener(() => setShowFeedback(true), BOTTOM_SCROLL_OPTIONS);

  // allow user to close (by rerendering to default closed state) feedback modal by clicking anywhere outside of it
  const clickAwayRef: any = useRef();
  const [clickAwayChildKey] = useClickAway(clickAwayRef);

  return showFeedback && pageIsWide && isReturnUser ? (
    <div ref={clickAwayRef} aria-hidden={true}>
      <Feedback
        key={clickAwayChildKey}
        projectId={FEEDBACK_ID}
        email={false}
        feedbackPrompt={"What brings you to the Health Equity Tracker?"}
        feedbackTypes={[
          "General Health Equity / Other (please specify below)",
          "COVID-19 / Vaccination Data",
          "Chronic Disease Data",
          "Social / Political Determinants Data",
          "Behavioral/Mental Health Data",
        ]}
        interestPrompt={"What field are you in?"}
        interestTypes={[
          "Non-Profit / Community Engagement",
          "Legal / Political / Governmental",
          "Medical / Clinical",
          "Academic",
          "Other (please specify below)",
        ]}
        textboxPrompt={"Did you get what you needed today?"}
        hoverBorderColor={sass.altGreen}
        postSubmitButtonMsg="Thank you for helping us advance health equity"
        primaryColor={sass.altGreen}
        textColor={sass.white}
      />
    </div>
  ) : (
    <></>
  );
}
